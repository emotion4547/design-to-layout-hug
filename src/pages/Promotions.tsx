import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { ChevronRight, Loader2 } from 'lucide-react';
import { usePromotions } from '@/hooks/usePromotions';
import { SEO, BreadcrumbSchema } from '@/components/SEO';

import promoCombo from '@/assets/promo-combo.jpg';
import promoWelcome from '@/assets/promo-welcome.jpg';
import bouquet3 from '@/assets/products/bouquet-3.jpg';

const fallbackImages: Record<string, string> = {
  '/promotions/combo.jpg': promoCombo,
  '/promotions/welcome.jpg': promoWelcome,
  '/promotions/service.jpg': bouquet3,
};

// Static fallback data
const staticPromotions = [
  {
    id: '1',
    title: 'Комбо со скидкой 15%',
    description: 'Цветы + шары, цветы + шоколад, цветы + ваза — все комбо-наборы со скидкой. Выбери совместимые товары!',
    image_url: '/promotions/combo.jpg',
    badge: '15%',
    slug: 'combo-15',
  },
  {
    id: '2',
    title: 'Welcome-скидка 10%',
    description: 'Новинка! Живые цветы для новых клиентов со скидкой 10% на первый заказ.',
    image_url: '/promotions/welcome.jpg',
    badge: '10%',
    slug: 'welcome-10',
  },
  {
    id: '3',
    title: 'Качество нашего сервиса',
    description: 'Гарантия свежести букета 24 часа. Бесплатная доставка от 3000₽.',
    image_url: '/promotions/service.jpg',
    badge: null,
    slug: 'service-quality',
  },
];

const Promotions = () => {
  const { data: dbPromotions, isLoading, error } = usePromotions();
  
  // Use DB data if available, otherwise use static data
  const promotions = useMemo(() => {
    if (dbPromotions && dbPromotions.length > 0) {
      return dbPromotions;
    }
    return staticPromotions;
  }, [dbPromotions]);

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return promoCombo;
    return fallbackImages[imageUrl] || imageUrl;
  };

  return (
    <PageLayout>
      <SEO
        title="Акции и скидки"
        description="Актуальные акции и скидки на цветы и букеты в Новороссийске. Скидки до 15% на комбо-наборы. Welcome-скидка 10% для новых клиентов."
        keywords="акции на цветы Новороссийск, скидки на букеты, промокоды цветы, выгодные предложения цветы"
        url="/promotions"
      />
      <BreadcrumbSchema items={[
        { name: 'Главная', url: '/' },
        { name: 'Акции', url: '/promotions' },
      ]} />
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
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {promotions.map((promo) => (
                  <Link to={`/promotions/${promo.id}`} key={promo.id}>
                    <article className="group bg-secondary/50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow h-full">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
                        <img 
                          src={getImageUrl(promo.image_url)} 
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
                        <span className="inline-flex items-center text-sm font-medium text-primary group-hover:underline">
                          Подробнее
                          <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {promotions.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Акций пока нет</p>
                </div>
              )}
            </>
          )}
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
          <Link to="/catalog">
            <Button size="lg" className="px-8">
              Перейти в каталог
            </Button>
          </Link>
        </div>
      </section>
    </PageLayout>
  );
};

export default Promotions;
