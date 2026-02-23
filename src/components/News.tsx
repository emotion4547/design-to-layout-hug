import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useNews } from '@/hooks/useNews';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import bouquet1 from '@/assets/products/bouquet-1.jpg';
import bouquet2 from '@/assets/products/bouquet-2.jpg';
import bouquet3 from '@/assets/products/bouquet-3.jpg';

// Fallback items when no news in database
const fallbackItems = [
  {
    id: '1',
    title: 'Новогодняя коллекция уже доступна!',
    excerpt: 'Встречайте праздники с нашими новыми букетами и композициями',
    date: '25.12.2025',
    image: bouquet1,
  },
  {
    id: '2',
    title: 'Новинки в ассортименте',
    excerpt: 'Добавили новые авторские букеты к праздникам',
    date: '22.12.2025',
    image: bouquet2,
  },
  {
    id: '3',
    title: 'Праздничная атмосфера в вашем доме',
    excerpt: 'Создайте уют с нашими праздничными композициями',
    date: '04.12.2025',
    image: bouquet3,
  },
];

export const News = () => {
  const { data: newsFromDb, isLoading } = useNews({ limit: 3 });

  const hasDbNews = newsFromDb && newsFromDb.length > 0;

  const displayItems = hasDbNews
    ? newsFromDb.map((item) => ({
        id: item.id,
        title: item.title,
        excerpt: item.excerpt || '',
        date: item.published_at
          ? format(new Date(item.published_at), 'dd.MM.yyyy', { locale: ru })
          : '',
        image: item.image_url || bouquet1,
        slug: item.slug,
      }))
    : fallbackItems;

  return (
    <section id="news" className="py-16 md:py-20 bg-secondary/30">
      <div className="container">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Моменты
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Узнайте интересное и актуальное из нашей работы
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {displayItems.map((item) => (
            <article 
              key={item.id}
              className="group bg-background rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <p className="text-xs text-muted-foreground mb-2">{item.date}</p>
                <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-foreground/80 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <Link to="/news">
            <Button variant="outline" className="px-8">
              Все моменты
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
