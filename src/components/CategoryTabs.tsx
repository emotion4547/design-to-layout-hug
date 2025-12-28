import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryTabsProps {
  activeCategories: string[];
  onCategoryChange: (categoryIds: string[]) => void;
  multiSelect?: boolean;
}

export const CategoryTabs = ({ 
  activeCategories, 
  onCategoryChange, 
  multiSelect = false 
}: CategoryTabsProps) => {
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

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'all') {
      onCategoryChange(['all']);
      return;
    }

    if (multiSelect) {
      // Remove 'all' if selecting specific categories
      const currentCategories = activeCategories.filter(id => id !== 'all');
      
      if (currentCategories.includes(categoryId)) {
        // Remove category
        const newCategories = currentCategories.filter(id => id !== categoryId);
        onCategoryChange(newCategories.length > 0 ? newCategories : ['all']);
      } else {
        // Add category
        onCategoryChange([...currentCategories, categoryId]);
      }
    } else {
      onCategoryChange([categoryId]);
    }
  };

  const isActive = (categoryId: string) => {
    if (categoryId === 'all') {
      return activeCategories.includes('all') || activeCategories.length === 0;
    }
    return activeCategories.includes(categoryId);
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
          className="flex items-center overflow-x-auto scrollbar-hide lg:mx-8 gap-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {allCategories.map((category) => {
            const active = isActive(category.id);
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={cn(
                  "flex-shrink-0 px-4 py-2 text-sm transition-all whitespace-nowrap rounded-full border",
                  active
                    ? "bg-primary text-primary-foreground border-primary font-medium"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-1.5">
                  {multiSelect && active && category.id !== 'all' && (
                    <Check className="h-3 w-3" />
                  )}
                  {category.name}
                </span>
              </button>
            );
          })}
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