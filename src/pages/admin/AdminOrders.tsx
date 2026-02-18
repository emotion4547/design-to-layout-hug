import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Eye, Gift, Truck, Store } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { OrderStatus } from '@/types/database';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждён',
  processing: 'В обработке',
  delivering: 'Доставляется',
  completed: 'Выполнен',
  cancelled: 'Отменён',
};

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  delivering: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
  addons: unknown;
}

interface Order {
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
  sender_name: string | null;
  sender_phone: string | null;
  is_surprise: boolean | null;
  recipient_name: string | null;
  recipient_phone: string | null;
  card_text: string | null;
  delivery_type: string | null;
  pickup_time: string | null;
  order_items: OrderItem[];
}

const AdminOrders = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast({ title: 'Статус обновлён' });
    },
    onError: () => {
      toast({ title: 'Ошибка обновления статуса', variant: 'destructive' });
    },
  });

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_phone.includes(search) ||
      (order.recipient_name?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) ?? [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Заказы</h1>
        <p className="text-muted-foreground">Управление заказами клиентов</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени или телефону..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Заказы не найдены
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Товары</TableHead>
                  <TableHead>Отправитель</TableHead>
                  <TableHead>Получатель</TableHead>
                  <TableHead>Доставка</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5 max-w-[200px]">
                        {order.order_items?.map((item, idx) => (
                          <div key={idx} className="text-sm truncate">
                            {item.product_name} × {item.quantity}
                          </div>
                        ))}
                        {(!order.order_items || order.order_items.length === 0) && (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.sender_name || order.customer_name}</div>
                      <div className="text-sm text-muted-foreground">{order.sender_phone || order.customer_phone}</div>
                    </TableCell>
                    <TableCell>
                      {order.recipient_name ? (
                        <div>
                          <div className="font-medium flex items-center gap-1">
                            {order.recipient_name}
                            {order.is_surprise && (
                              <Gift className="h-4 w-4 text-pink-500" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{order.recipient_phone}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {order.delivery_type === 'pickup' ? (
                          <Store className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Truck className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-sm">
                          {order.delivery_type === 'pickup' ? 'Самовывоз' : 'Доставка'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {order.delivery_date} {order.delivery_type === 'pickup' ? order.pickup_time : order.delivery_time}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(order.total_price)} ₽
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => 
                          updateStatusMutation.mutate({ 
                            id: order.id, 
                            status: value as OrderStatus 
                          })
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <span className={`px-2 py-0.5 rounded text-xs ${statusColors[order.status as OrderStatus]}`}>
                            {statusLabels[order.status as OrderStatus]}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              <span className={`px-2 py-0.5 rounded text-xs ${statusColors[value as OrderStatus]}`}>
                                {label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Детали заказа</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Дата заказа</p>
                  <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Сумма</p>
                  <p className="font-medium">{formatPrice(selectedOrder.total_price)} ₽</p>
                </div>
              </div>

              {/* Order Items */}
              {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                <div className="p-4 bg-secondary/50 rounded-lg space-y-3">
                  <h3 className="font-semibold">Состав заказа</h3>
                  <div className="space-y-2">
                    {selectedOrder.order_items.map((item) => {
                      const addons = Array.isArray(item.addons) ? item.addons as { name: string; price: number }[] : [];
                      return (
                        <div key={item.id} className="flex justify-between items-start text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-muted-foreground">Кол-во: {item.quantity} × {formatPrice(item.product_price)} ₽</p>
                            {addons.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Доп.: {addons.map(a => `${a.name} (+${formatPrice(a.price)} ₽)`).join(', ')}
                              </div>
                            )}
                          </div>
                          <p className="font-medium whitespace-nowrap ml-4">
                            {formatPrice(item.product_price * item.quantity)} ₽
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sender */}
              <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                <h3 className="font-semibold">Отправитель</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Имя</p>
                    <p>{selectedOrder.sender_name || selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Телефон</p>
                    <p>{selectedOrder.sender_phone || selectedOrder.customer_phone}</p>
                  </div>
                  {selectedOrder.customer_email && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Email</p>
                      <p>{selectedOrder.customer_email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recipient */}
              {(selectedOrder.recipient_name || selectedOrder.recipient_phone) && (
                <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    Получатель
                    {selectedOrder.is_surprise && (
                      <Badge variant="secondary" className="gap-1">
                        <Gift className="h-3 w-3" /> Сюрприз
                      </Badge>
                    )}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Имя</p>
                      <p>{selectedOrder.recipient_name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Телефон</p>
                      <p>{selectedOrder.recipient_phone || '—'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Text */}
              {selectedOrder.card_text && (
                <div className="p-4 bg-pink-50 dark:bg-pink-950/20 rounded-lg space-y-2">
                  <h3 className="font-semibold">Текст открытки</h3>
                  <p className="text-sm italic">"{selectedOrder.card_text}"</p>
                </div>
              )}

              {/* Delivery */}
              <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  {selectedOrder.delivery_type === 'pickup' ? (
                    <>
                      <Store className="h-4 w-4" /> Самовывоз
                    </>
                  ) : (
                    <>
                      <Truck className="h-4 w-4" /> Доставка
                    </>
                  )}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedOrder.delivery_type !== 'pickup' && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Адрес</p>
                      <p>{selectedOrder.delivery_address}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Дата</p>
                    <p>{selectedOrder.delivery_date}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Время</p>
                    <p>
                      {selectedOrder.delivery_type === 'pickup' 
                        ? selectedOrder.pickup_time 
                        : selectedOrder.delivery_time || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comment */}
              {selectedOrder.comment && (
                <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                  <h3 className="font-semibold">Комментарий</h3>
                  <p className="text-sm">{selectedOrder.comment}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;