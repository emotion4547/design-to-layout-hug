import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { CategoryTabs } from './CategoryTabs';
import { Button } from '@/components/ui/button';

import bouquet1 from '@/assets/products/bouquet-1.jpg';
import bouquet2 from '@/assets/products/bouquet-2.jpg';
import bouquet3 from '@/assets/products/bouquet-3.jpg';
import bouquet4 from '@/assets/products/bouquet-4.jpg';
import bouquet5 from '@/assets/products/bouquet-5.jpg';
import bouquet6 from '@/assets/products/bouquet-6.jpg';
import bouquet7 from '@/assets/products/bouquet-7.jpg';
import bouquet8 from '@/assets/products/bouquet-8.jpg';

const products = [
  {
    id: '1',
    name: 'Нежность пионов',
    description: 'Изысканный букет из свежих розовых пионов с зеленью',
    price: 3000,
    oldPrice: 3500,
    image: bouquet1,
    category: 'new-year',
  },
  {
    id: '2',
    name: 'Розовое облако',
    description: 'Нежный букет из роз и ранункулюсов в пастельных тонах',
    price: 2550,
    image: bouquet2,
    category: 'new-year',
  },
  {
    id: '3',
    name: 'Весенняя свежесть',
    description: 'Яркий букет из тюльпанов разных оттенков',
    price: 2650,
    image: bouquet3,
    category: 'new-year',
  },
  {
    id: '4',
    name: 'Элегантная роза',
    description: 'Классический букет из красных роз премиум-класса',
    price: 3500,
    image: bouquet4,
    category: 'new-year',
  },
  {
    id: '5',
    name: 'Полевое настроение',
    description: 'Букет из полевых цветов с лавандой и ромашками',
    price: 2500,
    image: bouquet5,
    category: 'gifts',
  },
  {
    id: '6',
    name: 'Солнечный день',
    description: 'Яркий букет из подсолнухов и хризантем',
    price: 6400,
    image: bouquet6,
    category: 'edible',
  },
  {
    id: '7',
    name: 'Романтика роз',
    description: 'Авторская композиция из садовых роз',
    price: 3300,
    image: bouquet7,
    category: 'author',
  },
  {
    id: '8',
    name: 'Нежные пионы',
    description: 'Монобукет из белых пионов с эвкалиптом',
    price: 3600,
    image: bouquet8,
    category: 'mono',
  },
];

export const ProductGrid = () => {
  const [activeCategory, setActiveCategory] = useState('new-year');
  const [visibleCount, setVisibleCount] = useState(8);

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const loadMore = () => {
    setVisibleCount(prev => prev + 4);
  };

  return (
    <section id="catalog" className="py-12">
      <CategoryTabs 
        activeCategory={activeCategory} 
        onCategoryChange={(id) => {
          setActiveCategory(id);
          setVisibleCount(8);
        }} 
      />
      
      <div className="container py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

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
      </div>
    </section>
  );
};
