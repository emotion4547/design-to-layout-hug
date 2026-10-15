import { ProductCard } from '@/components/ProductCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import type { ProductWithCategory } from '@/services/products';

interface ProductRowProps {
  title: string;
  products: ProductWithCategory[] | undefined;
}

// Одна горизонтальная строка товаров под описанием: на телефоне листается пальцем,
// на компьютере — стрелками. Пока товаров нет, строка не рисуется вовсе.
export const ProductRow = ({ title, products }: ProductRowProps) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="mt-12 md:mt-16" aria-label={title}>
      <h2 className="text-xl md:text-2xl font-bold mb-6">{title}</h2>
      <Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
        <CarouselContent>
          {products.map((p) => (
            <CarouselItem key={p.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
              <ProductCard
                id={p.id}
                name={p.name}
                description={p.description || ''}
                price={p.price}
                oldPrice={p.old_price ?? undefined}
                image={p.image_url}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {products.length > 2 && (
          <>
            <CarouselPrevious className="hidden md:flex -left-4" />
            <CarouselNext className="hidden md:flex -right-4" />
          </>
        )}
      </Carousel>
    </section>
  );
};
