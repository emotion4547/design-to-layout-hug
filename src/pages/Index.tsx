import { PageLayout } from '@/components/PageLayout';
import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { Features } from '@/components/Features';
import { BonusSystem } from '@/components/BonusSystem';
import { Delivery } from '@/components/Delivery';
import { News } from '@/components/News';
import { SEO } from '@/components/SEO';

const Index = () => {
  return (
    <PageLayout>
      <SEO
        title="Главная"
        description="Доставка воздушных шаров с гелием. Латексные и фольгированные шары, фигуры, цифры, наборы. Оформление праздников. Быстрая доставка по городу."
        keywords="воздушные шары, шары с гелием, доставка шаров, фольгированные шары, латексные шары, фигуры из шаров, оформление праздников"
        url="/"
      />
      <Hero />
      <ProductGrid />
      <Features />
      <BonusSystem />
      <Delivery />
      <News />
    </PageLayout>
  );
};

export default Index;
