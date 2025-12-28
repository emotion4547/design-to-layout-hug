import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Newspaper, Percent, Loader2 } from 'lucide-react';
import { getAllProducts } from '@/services/products';
import { getAllNews } from '@/services/news';
import { getAllPromotions } from '@/services/promotions';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: getAllProducts,
  });

  const { data: news, isLoading: loadingNews } = useQuery({
    queryKey: ['admin', 'news'],
    queryFn: getAllNews,
  });

  const { data: promotions, isLoading: loadingPromotions } = useQuery({
    queryKey: ['admin', 'promotions'],
    queryFn: getAllPromotions,
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const stats = [
    {
      title: 'Товары',
      value: products?.length ?? 0,
      icon: Package,
      loading: loadingProducts,
    },
    {
      title: 'Заказы',
      value: orders?.length ?? 0,
      icon: ShoppingCart,
      loading: loadingOrders,
    },
    {
      title: 'Новости',
      value: news?.length ?? 0,
      icon: Newspaper,
      loading: loadingNews,
    },
    {
      title: 'Акции',
      value: promotions?.length ?? 0,
      icon: Percent,
      loading: loadingPromotions,
    },
  ];

  const recentOrders = orders?.slice(0, 5) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Обзор</h1>
        <p className="text-muted-foreground">Статистика магазина</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {stat.loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Последние заказы</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingOrders ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Заказов пока нет
            </p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.total_price.toLocaleString('ru-RU')} ₽</p>
                    <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
