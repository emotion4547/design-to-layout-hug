import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type LogEntry = {
  status: 'success' | 'error' | 'skipped';
  message: string;
  response_data?: Record<string, unknown>;
};

// Запись в журнал — единственный след заявки, которая не дошла до amoCRM,
// поэтому ошибку вставки нельзя проглатывать: она уходит в console.error и
// видна в логах контейнера. Вторая тонкость — order_id ссылается на orders,
// и если заказа там нет, строку отвергает внешний ключ. Тогда пишем её ещё
// раз без ссылки, перенеся номер в текст: потерять запись об упавшей заявке
// хуже, чем потерять связь с заказом.
async function logIntegration(
  supabase: SupabaseClient,
  orderId: string | null,
  entry: LogEntry,
) {
  const row = { integration_type: 'amocrm', order_id: orderId, ...entry };
  const { error } = await supabase.from('integration_logs').insert(row);
  if (!error) return;

  console.error('Не удалось записать в integration_logs:', error.message);
  if (!orderId) return;

  const retry = await supabase.from('integration_logs').insert({
    ...row,
    order_id: null,
    message: `${entry.message} (заказ ${orderId})`,
  });
  if (retry.error) {
    console.error('Повтор без ссылки на заказ тоже не прошёл:', retry.error.message);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let orderId: string | null = null;

  try {
    const { order, items } = await req.json();
    orderId = order?.id;

    // Get AmoCRM settings
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['amocrm_subdomain', 'amocrm_access_token', 'amocrm_enabled', 'amocrm_pipeline_id', 'amocrm_unsorted']);

    if (settingsError) {
      throw new Error('Failed to fetch AmoCRM settings');
    }

    const settingsMap = settings?.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>) || {};

    const subdomain = settingsMap['amocrm_subdomain'];
    const accessToken = settingsMap['amocrm_access_token'];
    const enabled = settingsMap['amocrm_enabled'] === 'true';
    // Необязательно: без него сделка попадёт в воронку по умолчанию, а она
    // не всегда та, в которой работают с заказами.
    const pipelineId = Number(settingsMap['amocrm_pipeline_id']) || undefined;
    // Куда класть заявку. По умолчанию — прямо в воронку, как было.
    // При включённой настройке — в «Неразобранное»: там заявка поднимает
    // счётчик входящих, менеджер принимает её и берёт на себя. Сделка,
    // созданная обычным способом, в «Неразобранное» не попадает никогда и
    // тихо появляется карточкой в колонке — её легко не заметить.
    const toUnsorted = settingsMap['amocrm_unsorted'] === 'true';

    if (!enabled || !subdomain || !accessToken) {
      console.log('AmoCRM not configured or disabled');
      await logIntegration(supabase, orderId, {
        status: 'skipped',
        message: 'Интеграция не настроена или отключена',
      });
      return new Response(
        JSON.stringify({ success: false, message: 'AmoCRM not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating lead for order:', order.id, toUnsorted ? '(в Неразобранное)' : '(в воронку)');

    const contact = {
      name: order.customer_name,
      custom_fields_values: [
        { field_code: "PHONE", values: [{ value: order.customer_phone }] },
        ...(order.customer_email ? [{ field_code: "EMAIL", values: [{ value: order.customer_email }] }] : [])
      ],
    };

    const leadName = `Заказ #${order.id.slice(0, 8)} - ${order.customer_name}`;

    // Prepare lead data
    const leadData = [
      {
        name: leadName,
        price: order.total_price,
        ...(pipelineId ? { pipeline_id: pipelineId } : {}),
        // Телефон и почта — поля контакта, у сделки таких нет. Когда они
        // стояли и на сделке, amoCRM отвечала 400 NotSupportedChoice на
        // custom_fields_values.0.field_code, и ни одна заявка не доходила.
        _embedded: { contacts: [contact] }
      }
    ];

    // «Неразобранное» — отдельная ручка API со своим форматом: нужен источник,
    // который менеджер увидит в карточке, и блок metadata, иначе запрос
    // отвергается. request_id берём от заказа, чтобы повторная отправка того
    // же заказа была узнаваема в ответе.
    const nowSec = Math.floor(Date.now() / 1000);
    const unsortedData = [
      {
        request_id: order.id,
        source_name: 'Сайт vezubuket23.ru',
        source_uid: 'vezubuket-site',
        ...(pipelineId ? { pipeline_id: pipelineId } : {}),
        created_at: nowSec,
        metadata: {
          category: 'forms',
          form_id: 'order-form',
          form_name: 'Заказ с сайта',
          form_page: 'https://vezubuket23.ru/cart',
          form_sent_at: nowSec,
          ip: '0.0.0.0',
          referer: 'https://vezubuket23.ru/',
        },
        _embedded: {
          leads: [{ name: leadName, price: order.total_price }],
          contacts: [contact],
        },
      }
    ];

    const positions = Array.isArray(items) && items.length > 0
      ? items
          .map((i: { product_name: string; quantity: number; product_price: number }) =>
            `  • ${i.product_name} — ${i.quantity} шт. × ${i.product_price} ₽`)
          .join('\n')
      : '  (состав не передан)';

    const noteText = `
Заказ с сайта:
📦 ID заказа: ${order.id.slice(0, 8)}
👤 Клиент: ${order.customer_name}
📞 Телефон: ${order.customer_phone}
${order.customer_email ? `📧 Email: ${order.customer_email}` : ''}
📍 Адрес доставки: ${order.delivery_address}
📅 Дата доставки: ${order.delivery_date}
${order.delivery_time ? `⏰ Время: ${order.delivery_time}` : ''}
🛒 Состав:
${positions}
💰 Сумма: ${order.total_price} ₽
${order.comment ? `💬 Комментарий: ${order.comment}` : ''}
${order.card_text ? `💌 Текст открытки: ${order.card_text}` : ''}
    `.trim();

    // Create lead
    const endpoint = toUnsorted ? 'leads/unsorted/forms' : 'leads/complex';
    const amoResponse = await fetch(`https://${subdomain}.amocrm.ru/api/v4/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toUnsorted ? unsortedData : leadData),
    });

    if (!amoResponse.ok) {
      const errorText = await amoResponse.text();
      console.error('AmoCRM API error:', amoResponse.status, errorText);
      
      await logIntegration(supabase, orderId, {
        status: 'error',
        message: `API ошибка: ${amoResponse.status}`,
        response_data: { status: amoResponse.status, body: errorText },
      });

      throw new Error(`AmoCRM API error: ${amoResponse.status}`);
    }

    const amoResult = await amoResponse.json();
    // Ответы у двух ручек разной формы. У «Неразобранного» идентификатор
    // сделки приходит сразу, ещё до того как менеджер примет заявку, —
    // поэтому примечание с составом заказа можно приложить тем же способом.
    const unsortedEntry = amoResult?._embedded?.unsorted?.[0];
    const leadId = toUnsorted
      ? unsortedEntry?._embedded?.leads?.[0]?.id
      : amoResult?.[0]?.id;
    console.log('Lead created:', leadId, toUnsorted ? `(uid ${unsortedEntry?.uid})` : '');

    // Add note
    if (leadId) {
      await fetch(`https://${subdomain}.amocrm.ru/api/v4/leads/${leadId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ note_type: "common", params: { text: noteText } }]),
      });
    }

    // Log success
    await logIntegration(supabase, orderId, {
      status: 'success',
      message: toUnsorted
        ? `Заявка в Неразобранном, сделка ${leadId}`
        : `Сделка создана: ${leadId}`,
      response_data: { lead_id: leadId, unsorted: toUnsorted, uid: unsortedEntry?.uid ?? null },
    });

    return new Response(
      JSON.stringify({ success: true, lead_id: leadId, unsorted: toUnsorted }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in amocrm-create-lead:', error);

    // Log error
    await logIntegration(supabase, orderId, {
      status: 'error',
      message: errorMessage,
    });

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
