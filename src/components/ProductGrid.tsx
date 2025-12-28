import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { CategoryTabs } from './CategoryTabs';
import { Button } from '@/components/ui/button';

import bouquet1 from '@/assets/products/bouquet-1.jpg';
import bouquet2 from '@/assets/products/bouquet-2.jpg';
import bouquet3 from '@/assets/products/bouquet-3.jpg';
import bouquet4 from '@/assets/products/bouquet-4.jpg';

const products = [
  {
    id: '1',
    name: 'Ёлочка из Нобилиса с игрушками',
    description: 'Натуральная ёлочка из нобилиса с праздничным декором и игрушками',
    price: 3000,
    oldPrice: 3500,
    image: bouquet1,
    category: 'new-year',
  },
  {
    id: '2',
    name: 'Ёлочка из натуральных материалов',
    description: 'Новогодняя композиция из натуральных веток с серебристым декором',
    price: 2550,
    image: bouquet2,
    category: 'new-year',
  },
  {
    id: '3',
    name: 'Ёлочка с натуральным наполнением',
    description: 'Праздничная ёлочка из натурального нобилиса с шишками',
    price: 2650,
    image: bouquet3,
    category: 'new-year',
  },
  {
    id: '4',
    name: 'Букет из натурального нобилиса',
    description: 'Изысканный букет с праздничным настроением',
    price: 3500,
    image: bouquet4,
    category: 'new-year',
  },
  {
    id: '5',
    name: 'Мишка со стойким голубым оленем',
    description: 'Мягкая игрушка с праздничным декором',
    price: 2500,
    image: bouquet1,
    category: 'gifts',
  },
  {
    id: '6',
    name: 'Новогодний букет с баранками',
    description: 'Оригинальный букет с баранками и елочными украшениями',
    price: 6400,
    image: bouquet2,
    category: 'edible',
  },
  {
    id: '7',
    name: 'Ёлочка в цветах работы',
    description: 'Авторская работа с серебристым декором',
    price: 3300,
    image: bouquet3,
    category: 'author',
  },
  {
    id: '8',
    name: 'Букет "Свежесть и радость"',
    description: 'Классический букет из свежих цветов',
    price: 3600,
    image: bouquet4,
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
