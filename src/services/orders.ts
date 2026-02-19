import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/contexts/CartContext';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'delivering'
  | 'completed'
  | 'cancelled';

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_address: string;
  delivery_date: string;
  delivery_time: string | null;
  comment: string | null;
  status: OrderStatus;
  total_price: number;
  created_at: string;
  updated_at: string;
  // New fields
  sender_name: string | null;
  sender_phone: string | null;
  is_surprise: boolean;
  recipient_name: string | null;
  recipient_phone: string | null;
  card_text: string | null;
  delivery_type: string | null;
  pickup_time: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
  addons: unknown;
  created_at: string;
}

export type OrderInsert = Omit<Order, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type OrderItemInsert = Omit<OrderItem, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

interface CreateOrderData {
  senderName: string;
  senderPhone: string;
  isSurprise?: boolean;
  recipientName?: string;
  recipientPhone?: string;
  cardText?: string;
  deliveryType: 'delivery' | 'pickup';
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTime?: string;
  pickupTime?: string;
  comment?: string;
  customerEmail?: string;
  items: CartItem[];
  totalPrice: number;
}

export async function createOrder(data: CreateOrderData) {
  const insertData = {
    customer_name: data.senderName,
    customer_phone: data.senderPhone,
    customer_email: data.customerEmail || null,
    delivery_address: data.deliveryAddress,
    delivery_date: data.deliveryDate,
    delivery_time: data.deliveryTime || null,
    comment: data.comment || null,
    total_price: data.totalPrice,
    status: 'pending' as const,
    sender_name: data.senderName || null,
    sender_phone: data.senderPhone || null,
    is_surprise: data.isSurprise || false,
    recipient_name: data.recipientName || null,
    recipient_phone: data.recipientPhone || null,
    card_text: data.cardText || null,
    delivery_type: data.deliveryType || 'delivery',
    pickup_time: data.pickupTime || null,
  };

  console.log('ORDER_INSERT_DATA:', JSON.stringify(insertData, null, 2));

  // Generate ID client-side so we can reference it without needing SELECT back
  const orderId = crypto.randomUUID();
  const insertWithId = { ...insertData, id: orderId };

  const { error: orderError } = await supabase
    .from('orders')
    .insert(insertWithId);

  if (orderError) {
    console.error('ORDER_DB_ERROR:', JSON.stringify(orderError, null, 2));
    throw orderError;
  }

  console.log('ORDER_CREATED:', orderId);
  const typedOrder = { ...insertWithId, id: orderId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Order;

  const orderItems = data.items.map((item) => ({
    order_id: typedOrder.id,
    product_id: item.id,
    product_name: item.name,
    product_price: item.price,
    quantity: item.quantity,
    addons: item.addons || [],
  }));

  console.log('ORDER_ITEMS_DATA:', JSON.stringify(orderItems, null, 2));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    throw itemsError;
  }

  // Send to integrations (non-blocking)
  const integrationItems = orderItems.map((item) => ({
    product_name: item.product_name,
    quantity: item.quantity,
    product_price: item.product_price,
    product_id: item.product_id,
  }));

  sendToIntegrations(typedOrder, integrationItems).catch((err) => {
    console.error('Integration error:', err);
  });

  return typedOrder;
}

async function sendToIntegrations(
  order: Order,
  items: { product_name: string; quantity: number; product_price: number }[],
) {
  // Fire-and-forget; errors are logged in the function + here
  const [amo, tg] = await Promise.all([
    supabase.functions.invoke('amocrm-create-lead', { body: { order } }),
    supabase.functions.invoke('telegram-notify', { body: { order, items } }),
  ]);

  if (amo.error) console.error('AmoCRM error:', amo.error);
  if (tg.error) console.error('Telegram error:', tg.error);
}