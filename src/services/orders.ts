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
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTime?: string;
  comment?: string;
  items: CartItem[];
  totalPrice: number;
}

export async function createOrder(data: CreateOrderData) {
  // Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      customer_email: data.customerEmail,
      delivery_address: data.deliveryAddress,
      delivery_date: data.deliveryDate,
      delivery_time: data.deliveryTime,
      comment: data.comment,
      total_price: data.totalPrice,
      status: 'pending',
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

  return typedOrder;
}
