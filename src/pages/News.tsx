import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useNews } from '@/hooks/useNews';
import { SEO, BreadcrumbSchema } from '@/components/SEO';

import news1 from '@/assets/news/news-1.jpg';
import news2 from '@/assets/news/news-2.jpg';
import news3 from '@/assets/news/news-3.jpg';
import news4 from '@/assets/news/news-4.jpg';
import news5 from '@/assets/news/news-5.jpg';
import news6 from '@/assets/news/news-6.jpg';

const fallbackImages: Record<string, string> = {
  '/news/news-1.jpg': news1,
  '/news/news-2.jpg': news2,
  '/news/news-3.jpg': news3,
  '/news/news-4.jpg': news4,
  '/news/news-5.jpg': news5,
  '/news/news-6.jpg': news6,
};

// Static fallback data
const staticNewsItems = [
  {
    id: '1',
    title: 'Новогодняя коллекция уже доступна!',
    excerpt: 'Встречайте праздники с нашими новыми букетами и композициями. Ёлочки из нобилиса, праздничные венки и зимние букеты.',
    published_at: '2025-12-25',
    image_url: '/news/news-1.jpg',
    category: 'Новинки',
  },
  {
    id: '2',
    title: 'Новинки в ассортименте',
    excerpt: 'Добавили новые авторские букеты к праздникам. Уникальные композиции от наших флористов.',
    published_at: '2025-12-22',
    image_url: '/news/news-2.jpg',
    category: 'Ассортимент',
  },
  {
    id: '3',
    title: 'Праздничная атмосфера в вашем доме',
    excerpt: 'Создайте уют с нашими праздничными композициями. Свечи, гирлянды и живые цветы.',
    published_at: '2025-12-04',
    image_url: '/news/news-3.jpg',
    category: 'Советы',
  },
  {
    id: '4',
    title: 'Как ухаживать за зимними букетами',
    excerpt: 'Полезные советы по уходу за букетами в холодное время года. Продлите жизнь вашим цветам.',
    published_at: '2025-11-28',
    image_url: '/news/news-4.jpg',
    category: 'Советы',
  },
  {
    id: '5',
    title: 'Открытие нового сезона',
    excerpt: 'Мы рады представить обновлённую коллекцию осенних букетов с яркими красками.',
    published_at: '2025-11-15',
    image_url: '/news/news-5.jpg',
    category: 'Новости',
  },
  {
    id: '6',
    title: 'Благодарим наших клиентов',
    excerpt: 'Спасибо всем, кто выбирает нас! Более 1000 довольных клиентов за этот год.',
    published_at: '2025-11-01',
    image_url: '/news/news-6.jpg',
    category: 'Новости',
  },
];

const NewsPage = () => {
  const [visibleCount, setVisibleCount] = useState(6);
  const { data: dbNews, isLoading, error } = useNews();
  
  // Use DB data if available, otherwise use static data
  const newsItems = useMemo(() => {
    if (dbNews && dbNews.length > 0) {
      return dbNews;
    }
    return staticNewsItems;
  }, [dbNews]);

  const visibleNews = newsItems.slice(0, visibleCount);
  const hasMore = visibleCount < newsItems.length;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return news1;
    return fallbackImages[imageUrl] || imageUrl;
  };

  return (
    <PageLayout>
      <SEO
        title="Новости и моменты"
        description="Новости магазина цветов Везу букет. Новые коллекции, полезные советы по уходу за цветами, актуальные события."
        keywords="новости цветочный магазин, советы уход за цветами, новые коллекции букетов Новороссийск"
        url="/news"
      />
      <BreadcrumbSchema items={[
        { name: 'Главная', url: '/' },
        { name: 'Новости', url: '/news' },
      ]} />
      {/* Page Header */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Моменты
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Узнайте интересное и актуальное из нашей работы
          </p>
        </div>
      </section>

      {/* News Grid */}
      <section className="pb-16 md:pb-20">
        <div className="container">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {visibleNews.map((item) => (
                  <Link to={`/news/${item.id}`} key={item.id}>
                    <article className="group bg-background rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-shadow h-full">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
                        <img 
                          src={getImageUrl(item.image_url)} 
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {item.category && (
                          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                            {item.category}
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <p className="text-xs text-muted-foreground mb-2">
                          {formatDate(item.published_at)}
                        </p>
                        <h2 className="font-bold text-lg mb-3 group-hover:text-foreground/80 transition-colors line-clamp-2">
                          {item.title}
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                          {item.excerpt}
                        </p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {visibleNews.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Новостей пока нет</p>
                </div>
              )}

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center mt-12">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="px-8"
                    onClick={() => setVisibleCount(prev => prev + 6)}
                  >
                    Загрузить ещё
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default NewsPage;
