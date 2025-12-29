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
  // Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: data.senderName,
      customer_phone: data.senderPhone,
      customer_email: data.customerEmail,
      delivery_address: data.deliveryAddress,
      delivery_date: data.deliveryDate,
      delivery_time: data.deliveryTime,
      comment: data.comment,
      total_price: data.totalPrice,
      status: 'pending',
      // New fields
      sender_name: data.senderName,
      sender_phone: data.senderPhone,
      is_surprise: data.isSurprise || false,
      recipient_name: data.recipientName,
      recipient_phone: data.recipientPhone,
      card_text: data.cardText,
      delivery_type: data.deliveryType,
      pickup_time: data.pickupTime,
    })
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError);
    throw orderError;
  }

  const typedOrder = order as Order;

  // Create order items
  const orderItems = data.items.map((item) => ({
    order_id: typedOrder.id,
    product_id: item.id,
    product_name: item.name,
    product_price: item.price,
    quantity: item.quantity,
    addons: item.addons || [],
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    throw itemsError;
  }

  // Send to AmoCRM (non-blocking)
  sendToAmoCRM(typedOrder).catch((err) => {
    console.error('AmoCRM integration error:', err);
  });

  return typedOrder;
}

async function sendToAmoCRM(order: Order) {
  try {
    const { data, error } = await supabase.functions.invoke('amocrm-create-lead', {
      body: { order },
    });

    if (error) {
      console.error('Error calling AmoCRM edge function:', error);
    } else {
      console.log('AmoCRM response:', data);
    }
  } catch (err) {
    console.error('Failed to send to AmoCRM:', err);
  }
}