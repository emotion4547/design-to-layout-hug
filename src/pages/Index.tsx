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
        description="Доставка свежих цветов и букетов в Новороссийске. Авторские композиции, съедобные букеты, подарки. Быстрая доставка по городу. Закажите онлайн!"
        keywords="цветы Новороссийск, доставка цветов, букеты Новороссийск, купить цветы, заказать букет, авторские букеты, съедобные букеты"
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
