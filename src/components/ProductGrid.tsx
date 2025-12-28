import { useState, useMemo } from 'react';
import { ProductCard } from './ProductCard';
import { CategoryTabs } from './CategoryTabs';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

import bouquet1 from '@/assets/products/bouquet-1.jpg';
import bouquet2 from '@/assets/products/bouquet-2.jpg';
import bouquet3 from '@/assets/products/bouquet-3.jpg';
import bouquet4 from '@/assets/products/bouquet-4.jpg';
import bouquet5 from '@/assets/products/bouquet-5.jpg';
import bouquet6 from '@/assets/products/bouquet-6.jpg';
import bouquet7 from '@/assets/products/bouquet-7.jpg';
import bouquet8 from '@/assets/products/bouquet-8.jpg';

const fallbackImages: Record<string, string> = {
  '/products/bouquet-1.jpg': bouquet1,
  '/products/bouquet-2.jpg': bouquet2,
  '/products/bouquet-3.jpg': bouquet3,
  '/products/bouquet-4.jpg': bouquet4,
  '/products/bouquet-5.jpg': bouquet5,
  '/products/bouquet-6.jpg': bouquet6,
  '/products/bouquet-7.jpg': bouquet7,
  '/products/bouquet-8.jpg': bouquet8,
};

export const ProductGrid = () => {
  const [activeCategories, setActiveCategories] = useState<string[]>(['all']);
  const [visibleCount, setVisibleCount] = useState(8);

  // Filter out 'all' to get actual category IDs for the query
  const categoryIdsForQuery = activeCategories.filter(id => id !== 'all');

  const { data: products = [], isLoading, error } = useProducts({
    categoryIds: categoryIdsForQuery.length > 0 ? categoryIdsForQuery : undefined,
  });

  // Map products with fallback images
  const mappedProducts = useMemo(() => {
    return products.map(product => ({
      ...product,
      image: product.image_url ? (fallbackImages[product.image_url] || product.image_url) : bouquet1,
      oldPrice: product.old_price,
    }));
  }, [products]);

  const visibleProducts = mappedProducts.slice(0, visibleCount);
  const hasMore = visibleCount < mappedProducts.length;

  const loadMore = () => {
    setVisibleCount(prev => prev + 4);
  };

  return (
    <section id="catalog" className="py-12">
      <CategoryTabs 
        activeCategories={activeCategories} 
        onCategoryChange={(ids) => {
          setActiveCategories(ids);
          setVisibleCount(8);
        }}
        multiSelect
      />
      
      <div className="container py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">Ошибка загрузки товаров</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            {visibleProducts.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Товары не найдены</p>
              </div>
            )}

            {hasMore && (
              <div className="flex justify-center mt-12">
                <Button 
                  variant="outline" 
                  onClick={loadMore}
                  className="px-8"
                >
                  Загрузить ещё
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};