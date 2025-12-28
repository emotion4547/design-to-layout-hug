import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';

import bouquet1 from '@/assets/products/bouquet-1.jpg';
import bouquet2 from '@/assets/products/bouquet-2.jpg';
import bouquet3 from '@/assets/products/bouquet-3.jpg';
import bouquet4 from '@/assets/products/bouquet-4.jpg';

const newsItems = [
  {
    id: '1',
    title: 'Новогодняя коллекция уже доступна!',
    excerpt: 'Встречайте праздники с нашими новыми букетами и композициями. Ёлочки из нобилиса, праздничные венки и зимние букеты.',
    date: '25.12.2025',
    image: bouquet1,
    category: 'Новинки',
  },
  {
    id: '2',
    title: 'Новинки в ассортименте',
    excerpt: 'Добавили новые авторские букеты к праздникам. Уникальные композиции от наших флористов.',
    date: '22.12.2025',
    image: bouquet2,
    category: 'Ассортимент',
  },
  {
    id: '3',
    title: 'Праздничная атмосфера в вашем доме',
    excerpt: 'Создайте уют с нашими праздничными композициями. Свечи, гирлянды и живые цветы.',
    date: '04.12.2025',
    image: bouquet3,
    category: 'Советы',
  },
  {
    id: '4',
    title: 'Как ухаживать за зимними букетами',
    excerpt: 'Полезные советы по уходу за букетами в холодное время года. Продлите жизнь вашим цветам.',
    date: '28.11.2025',
    image: bouquet4,
    category: 'Советы',
  },
  {
    id: '5',
    title: 'Открытие нового сезона',
    excerpt: 'Мы рады представить обновлённую коллекцию осенних букетов с яркими красками.',
    date: '15.11.2025',
    image: bouquet1,
    category: 'Новости',
  },
  {
    id: '6',
    title: 'Благодарим наших клиентов',
    excerpt: 'Спасибо всем, кто выбирает нас! Более 1000 довольных клиентов за этот год.',
    date: '01.11.2025',
    image: bouquet2,
    category: 'Новости',
  },
];

const NewsPage = () => {
  return (
    <PageLayout>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {newsItems.map((item) => (
              <article 
                key={item.id}
                className="group bg-background rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                    {item.category}
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-xs text-muted-foreground mb-2">{item.date}</p>
                  <h2 className="font-bold text-lg mb-3 group-hover:text-foreground/80 transition-colors line-clamp-2">
                    {item.title}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                    {item.excerpt}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* Load More */}
          <div className="flex justify-center mt-12">
            <Button variant="outline" size="lg" className="px-8">
              Загрузить ещё
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default NewsPage;
