import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'new-year', name: 'Новогодняя коллекция' },
  { id: 'all', name: 'Все товары' },
  { id: 'mono', name: 'Монобукеты' },
  { id: 'author', name: 'Авторские букеты' },
  { id: 'edible', name: 'Съедобные букеты' },
  { id: 'wedding', name: 'Свадебные букеты' },
  { id: 'gifts', name: 'Подарки' },
];

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative py-4 border-b border-border">
      <div className="container relative">
        {/* Scroll buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex bg-background/80 backdrop-blur-sm"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div
          ref={scrollRef}
          className="flex items-center gap-1 overflow-x-auto scrollbar-hide px-8 md:px-12"
        >
          {categories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "flex-shrink-0 px-4 py-2 text-sm transition-colors whitespace-nowrap",
                activeCategory === category.id
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {category.name}
              {index < categories.length - 1 && (
                <span className="ml-4 text-border">|</span>
              )}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex bg-background/80 backdrop-blur-sm"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
