import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: categories, isLoading } = useCategories({ activeOnly: true });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Add "All products" option at the beginning
  const allCategories = [
    { id: 'all', slug: 'all', name: 'Все товары' },
    ...(categories || []),
  ];

  if (isLoading) {
    return (
      <div className="py-4">
        <div className="container">
          <div className="flex items-center gap-4 overflow-x-auto">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-32 flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="container relative">
        {/* Scroll buttons - Desktop */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 hidden lg:flex h-8 w-8 bg-background/80 backdrop-blur-sm shadow-sm"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div
          ref={scrollRef}
          className="flex items-center overflow-x-auto scrollbar-hide lg:mx-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {allCategories.map((category, index) => (
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
              {index < allCategories.length - 1 && (
                <span className="ml-4 text-border select-none">|</span>
              )}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 hidden lg:flex h-8 w-8 bg-background/80 backdrop-blur-sm shadow-sm"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};