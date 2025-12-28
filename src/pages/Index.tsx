import { PageLayout } from '@/components/PageLayout';
import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { Features } from '@/components/Features';
import { BonusSystem } from '@/components/BonusSystem';
import { Delivery } from '@/components/Delivery';
import { News } from '@/components/News';

const Index = () => {
  return (
    <PageLayout>
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
