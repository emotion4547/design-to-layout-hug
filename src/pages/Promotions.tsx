import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

import promoBanner from '@/assets/promo-banner.jpg';
import bouquet1 from '@/assets/products/bouquet-1.jpg';
import bouquet2 from '@/assets/products/bouquet-2.jpg';

const promotions = [
  {
    id: '1',
    title: 'Комбо со скидкой 15%',
    description: 'Цветы + шары, цветы + шоколад, цветы + ваза — все комбо-наборы со скидкой. Выбери совместимые товары!',
    image: promoBanner,
    badge: '15%',
    link: '/catalog?promo=combo',
  },
  {
    id: '2',
    title: 'Welcome-скидка 10%',
    description: 'Новинка! Живые цветы для новых клиентов со скидкой 10% на первый заказ.',
    image: bouquet1,
    badge: '10%',
    link: '/catalog?promo=welcome',
  },
  {
    id: '3',
    title: 'Качество нашего сервиса',
    description: 'Гарантия свежести букета 24 часа. Бесплатная доставка от 3000₽.',
    image: bouquet2,
    badge: null,
    link: '/delivery',
  },
];

const Promotions = () => {
  return (
    <PageLayout>
      {/* Page Header */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Акции
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            букеты, наполненные чувствами
          </p>
        </div>
      </section>

      {/* Promotions Grid */}
      <section className="pb-16 md:pb-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {promotions.map((promo) => (
              <article 
                key={promo.id}
                className="group bg-secondary/50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={promo.image} 
                    alt={promo.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {promo.badge && (
                    <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-bold">
                      -{promo.badge}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="font-bold text-xl mb-3 group-hover:text-foreground/80 transition-colors">
                    {promo.title}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {promo.description}
                  </p>
                  <Button variant="outline" size="sm" className="group/btn">
                    Подробнее
                    <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-secondary/30">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Выбрать даты
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Закажите букет заранее и получите дополнительную скидку на доставку
          </p>
          <Button size="lg" className="px-8">
            Перейти в каталог
          </Button>
        </div>
      </section>
    </PageLayout>
  );
};

export default Promotions;
