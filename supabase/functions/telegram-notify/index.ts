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

  try {
    // Get Telegram settings
    const { data: settings } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['telegram_bot_token', 'telegram_chat_id', 'telegram_enabled']);

    const settingsMap = settings?.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>) || {};

    const botToken = settingsMap['telegram_bot_token'];
    const chatId = settingsMap['telegram_chat_id'];
    const enabled = settingsMap['telegram_enabled'] === 'true';

    if (!enabled || !botToken || !chatId) {
      console.log('Telegram not configured or disabled');
      return new Response(
        JSON.stringify({ success: false, message: 'Telegram not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { order, items } = await req.json();
    console.log('Sending Telegram notification for order:', order.id);

    // Format order items
    const itemsList = items?.map((item: { product_name: string; quantity: number; product_price: number }) => 
      `  • ${item.product_name} x${item.quantity} — ${item.product_price} ₽`
    ).join('\n') || 'Нет товаров';

    // Build message
    const message = `
🌸 *Новый заказ!*

📦 *Номер:* \`${order.id.slice(0, 8)}\`
💰 *Сумма:* ${order.total_price} ₽

👤 *Клиент:* ${escapeMarkdown(order.customer_name)}
📞 *Телефон:* ${order.customer_phone}
${order.customer_email ? `📧 *Email:* ${order.customer_email}` : ''}

🚚 *Доставка:* ${order.delivery_type === 'pickup' ? 'Самовывоз' : 'Доставка'}
📍 *Адрес:* ${escapeMarkdown(order.delivery_address)}
📅 *Дата:* ${order.delivery_date}
${order.delivery_time ? `⏰ *Время:* ${order.delivery_time}` : ''}
${order.pickup_time ? `⏰ *Время самовывоза:* ${order.pickup_time}` : ''}

🛒 *Состав заказа:*
${itemsList}

${order.card_text ? `💌 *Открытка:* ${escapeMarkdown(order.card_text)}` : ''}
${order.comment ? `💬 *Комментарий:* ${escapeMarkdown(order.comment)}` : ''}
${order.is_surprise ? '🎁 *Это сюрприз!*' : ''}
    `.trim();

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const result = await response.json();

    // Log the result
    await supabase.from('integration_logs').insert({
      integration_type: 'telegram',
      order_id: order.id,
      status: result.ok ? 'success' : 'error',
      message: result.ok ? 'Уведомление отправлено' : result.description,
      response_data: result,
    });

    if (!result.ok) {
      console.error('Telegram API error:', result);
      return new Response(
        JSON.stringify({ success: false, error: result.description }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Telegram notification sent successfully');
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in telegram-notify:', error);
    
    // Try to log the error
    try {
      const { order } = await req.clone().json();
      await supabase.from('integration_logs').insert({
        integration_type: 'telegram',
        order_id: order?.id,
        status: 'error',
        message: errorMessage,
      });
    } catch {}

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function escapeMarkdown(text: string): string {
  if (!text) return '';
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}
