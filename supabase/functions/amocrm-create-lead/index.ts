import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let orderId: string | null = null;

  try {
    const { order } = await req.json();
    orderId = order?.id;

    // Get AmoCRM settings
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['amocrm_subdomain', 'amocrm_access_token', 'amocrm_enabled']);

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

    if (!enabled || !subdomain || !accessToken) {
      console.log('AmoCRM not configured or disabled');
      await supabase.from('integration_logs').insert({
        integration_type: 'amocrm',
        order_id: orderId,
        status: 'skipped',
        message: 'Интеграция не настроена или отключена',
      });
      return new Response(
        JSON.stringify({ success: false, message: 'AmoCRM not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating lead for order:', order.id);

    // Prepare lead data
    const leadData = [
      {
        name: `Заказ #${order.id.slice(0, 8)} - ${order.customer_name}`,
        price: order.total_price,
        custom_fields_values: [
          { field_code: "PHONE", values: [{ value: order.customer_phone }] },
          ...(order.customer_email ? [{ field_code: "EMAIL", values: [{ value: order.customer_email }] }] : [])
        ],
        _embedded: {
          contacts: [{
            name: order.customer_name,
            custom_fields_values: [
              { field_code: "PHONE", values: [{ value: order.customer_phone }] },
              ...(order.customer_email ? [{ field_code: "EMAIL", values: [{ value: order.customer_email }] }] : [])
            ]
          }]
        }
      }
    ];

    const noteText = `
Заказ с сайта:
📦 ID заказа: ${order.id.slice(0, 8)}
👤 Клиент: ${order.customer_name}
📞 Телефон: ${order.customer_phone}
${order.customer_email ? `📧 Email: ${order.customer_email}` : ''}
📍 Адрес доставки: ${order.delivery_address}
📅 Дата доставки: ${order.delivery_date}
${order.delivery_time ? `⏰ Время: ${order.delivery_time}` : ''}
💰 Сумма: ${order.total_price} ₽
${order.comment ? `💬 Комментарий: ${order.comment}` : ''}
${order.card_text ? `💌 Текст открытки: ${order.card_text}` : ''}
    `.trim();

    // Create lead
    const amoResponse = await fetch(`https://${subdomain}.amocrm.ru/api/v4/leads/complex`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });

    if (!amoResponse.ok) {
      const errorText = await amoResponse.text();
      console.error('AmoCRM API error:', amoResponse.status, errorText);
      
      await supabase.from('integration_logs').insert({
        integration_type: 'amocrm',
        order_id: orderId,
        status: 'error',
        message: `API ошибка: ${amoResponse.status}`,
        response_data: { status: amoResponse.status, body: errorText },
      });

      throw new Error(`AmoCRM API error: ${amoResponse.status}`);
    }

    const amoResult = await amoResponse.json();
    const leadId = amoResult[0]?.id;
    console.log('Lead created:', leadId);

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
    await supabase.from('integration_logs').insert({
      integration_type: 'amocrm',
      order_id: orderId,
      status: 'success',
      message: `Сделка создана: ${leadId}`,
      response_data: { lead_id: leadId },
    });

    return new Response(
      JSON.stringify({ success: true, lead_id: leadId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in amocrm-create-lead:', error);

    // Log error
    await supabase.from('integration_logs').insert({
      integration_type: 'amocrm',
      order_id: orderId,
      status: 'error',
      message: errorMessage,
    });

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
