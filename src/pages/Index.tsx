import { PageLayout } from '@/components/PageLayout';
import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { Features } from '@/components/Features';
import { BonusSystem } from '@/components/BonusSystem';
import { Delivery } from '@/components/Delivery';
import { News } from '@/components/News';
import { SEO } from '@/components/SEO';
import { QuizPopup } from '@/components/QuizPopup';
import YandexReviews from '@/components/YandexReviews';

const Index = () => {
  return (
    <PageLayout>
      <SEO
        description="Доставка свежих цветов и букетов в Новороссийске. Розы, авторские композиции, букеты в шляпных коробках. Доставка от 1 часа. Заказ онлайн и по телефону."
        keywords="доставка цветов, букеты, розы, тюльпаны, цветочный магазин, заказать букет, доставка букетов, Новороссийск, купить букет Новороссийск, цветы с доставкой Новороссийск, заказать цветы онлайн, букет роз с доставкой, цветочный магазин Новороссийск"
        url="/"
      />
      <Hero />
      <ProductGrid />
      <Features />
      <YandexReviews />
      <BonusSystem />
      <Delivery />
      <News />
      <QuizPopup />
    </PageLayout>
  );
};

export default Index;
