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
        title="Главная"
        description="Доставка свежих цветов и букетов в Новороссийске. Розы, тюльпаны, авторские композиции, букеты в шляпных коробках. Быстрая доставка по городу."
        keywords="доставка цветов, букеты, розы, тюльпаны, цветочный магазин, заказать букет, доставка букетов, Новороссийск"
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
