import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Search, SlidersHorizontal, X, Loader2, Check, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useProductCounts } from '@/hooks/useProductCounts';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO, BreadcrumbSchema } from '@/components/SEO';

// Fallback images for products without image_url
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

const MIN_PRICE = 0;
const MAX_PRICE = 50000;

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || 'all';
  const searchFromUrl = searchParams.get('search') || '';
  
  const [activeCategories, setActiveCategories] = useState<string[]>([categoryFromUrl]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [priceRange, setPriceRange] = useState<[number, number]>([MIN_PRICE, MAX_PRICE]);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'newest'>('default');
  const [inStockOnly, setInStockOnly] = useState(true);
  const [withDiscountOnly, setWithDiscountOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Fetch categories from database
  const { data: dbCategories = [], isLoading: categoriesLoading } = useCategories({ activeOnly: true });
  const { data: productCounts } = useProductCounts();
  
  // Build categories list with "All" option
  const categories = useMemo(() => [
    { id: 'all', slug: 'all', name: 'Все' },
    ...dbCategories,
  ], [dbCategories]);

  // Get active category names for display
  const activeCategoryNames = useMemo(() => {
    if (activeCategories.includes('all') || activeCategories.length === 0) {
      return [];
    }
    return activeCategories
      .map(id => categories.find(c => c.id === id)?.name)
      .filter(Boolean) as string[];
  }, [categories, activeCategories]);

  // Filter out 'all' to get actual category IDs for the query
  const categoryIdsForQuery = activeCategories.filter(id => id !== 'all');

  // Fetch products from database
  const { data: products = [], isLoading, error } = useProducts({
    categoryIds: categoryIdsForQuery.length > 0 ? categoryIdsForQuery : undefined,
    search: searchQuery || undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    sortBy,
    inStockOnly,
    withDiscountOnly,
  });

  // Sync with URL params
  useEffect(() => {
    setActiveCategories([categoryFromUrl]);
    setSearchQuery(searchFromUrl);
    setVisibleCount(12);
  }, [categoryFromUrl, searchFromUrl]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

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

  const hasActiveFilters = priceRange[0] !== MIN_PRICE || priceRange[1] !== MAX_PRICE || sortBy !== 'default' || !inStockOnly || withDiscountOnly;

  const resetFilters = () => {
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setSortBy('default');
    setInStockOnly(true);
    setWithDiscountOnly(false);
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-4">
        <h3 className="font-medium">Цена, ₽</h3>
        <Slider
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={50}
          className="mt-2"
        />
        <div className="flex items-center gap-3">
          <Input
            type="number"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
            className="text-center"
            min={MIN_PRICE}
            max={priceRange[1]}
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="number"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="text-center"
            min={priceRange[0]}
            max={MAX_PRICE}
          />
        </div>
      </div>

      {/* Additional Filters */}
      <div className="space-y-3">
        <h3 className="font-medium">Наличие</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm">Только в наличии</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={withDiscountOnly}
              onChange={(e) => setWithDiscountOnly(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm">Со скидкой</span>
          </label>
        </div>
      </div>

      {/* Sorting */}
      <div className="space-y-3">
        <h3 className="font-medium">Сортировка</h3>
        <div className="space-y-2">
          {[
            { id: 'default', label: 'По популярности' },
            { id: 'newest', label: 'По новизне' },
            { id: 'price-asc', label: 'Сначала дешевые' },
            { id: 'price-desc', label: 'Сначала дорогие' },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setSortBy(option.id as typeof sortBy)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                sortBy === option.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={resetFilters} className="w-full">
          Сбросить фильтры
        </Button>
      )}
    </div>
  );

  return (
    <PageLayout>
      <SEO
        title="Каталог цветов и букетов"
        description="Большой выбор букетов и цветочных композиций в Новороссийске. Авторские букеты, монобукеты, съедобные букеты, подарки. Быстрая доставка."
        keywords="каталог цветов, купить букет Новороссийск, авторские букеты, монобукеты, съедобные букеты, цветочные композиции"
        url="/catalog"
      />
      <BreadcrumbSchema items={[
        { name: 'Главная', url: '/' },
        { name: 'Каталог', url: '/catalog' },
      ]} />
      {/* Page Header */}
      <section className="py-8 md:py-12 bg-background">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6" aria-label="Хлебные крошки">
            <span>Главная</span>
            <span className="mx-2">/</span>
            <span className="text-foreground">Каталог</span>
          </nav>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Каталог
          </h1>

          {/* Search & Sort & Filter Toggle */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text"
                placeholder="Поиск по названию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Sorting Select */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">По популярности</SelectItem>
                <SelectItem value="newest">По новизне</SelectItem>
                <SelectItem value="price-asc">Сначала дешевые</SelectItem>
                <SelectItem value="price-desc">Сначала дорогие</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Mobile Filter Button */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden relative shrink-0">
                  <SlidersHorizontal className="h-4 w-4" />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Фильтры</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FiltersContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active filters chips */}
          {(searchQuery || hasActiveFilters || activeCategoryNames.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                  Поиск: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-primary">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {activeCategoryNames.map((name, index) => (
                <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                  {name}
                  <button 
                    onClick={() => {
                      const categoryId = categories.find(c => c.name === name)?.id;
                      if (categoryId) {
                        const newCategories = activeCategories.filter(id => id !== categoryId);
                        setActiveCategories(newCategories.length > 0 ? newCategories : ['all']);
                      }
                    }} 
                    className="ml-1 hover:text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {(priceRange[0] !== MIN_PRICE || priceRange[1] !== MAX_PRICE) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                  {formatPrice(priceRange[0])} — {formatPrice(priceRange[1])} ₽
                  <button onClick={() => setPriceRange([MIN_PRICE, MAX_PRICE])} className="ml-1 hover:text-primary">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {sortBy !== 'default' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                  {sortBy === 'price-asc' ? 'Сначала дешевые' : sortBy === 'price-desc' ? 'Сначала дорогие' : 'По новизне'}
                  <button onClick={() => setSortBy('default')} className="ml-1 hover:text-primary">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {!inStockOnly && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                  Включая не в наличии
                  <button onClick={() => setInStockOnly(true)} className="ml-1 hover:text-primary">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {withDiscountOnly && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                  Со скидкой
                  <button onClick={() => setWithDiscountOnly(false)} className="ml-1 hover:text-primary">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16 md:pb-20">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Categories & Filters (Desktop) */}
            <aside className="lg:w-64 shrink-0">
              {/* Categories */}
              {categoriesLoading ? (
                <div className="space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <nav className="space-y-1 mb-8">
                  {categories.map((category) => {
                    const isActive = category.id === 'all' 
                      ? activeCategories.includes('all') || activeCategories.length === 0
                      : activeCategories.includes(category.id);
                    const count = category.id === 'all' 
                      ? productCounts?.total 
                      : productCounts?.byCategoryId[category.id];
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          if (category.id === 'all') {
                            setActiveCategories(['all']);
                          } else {
                            const currentCategories = activeCategories.filter(id => id !== 'all');
                            if (currentCategories.includes(category.id)) {
                              const newCategories = currentCategories.filter(id => id !== category.id);
                              setActiveCategories(newCategories.length > 0 ? newCategories : ['all']);
                            } else {
                              setActiveCategories([...currentCategories, category.id]);
                            }
                          }
                          setVisibleCount(12);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2",
                          isActive
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-foreground/80 hover:bg-secondary"
                        )}
                      >
                        {category.id !== 'all' && (
                          <span className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center",
                            isActive ? "bg-primary-foreground border-primary-foreground" : "border-current"
                          )}>
                            {isActive && <Check className="h-3 w-3 text-primary" />}
                          </span>
                        )}
                        <span className="flex-1">{category.name}</span>
                        {count !== undefined && (
                          <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                            isActive 
                              ? "bg-primary-foreground/20" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              )}

              {/* Desktop Filters */}
              <div className="hidden lg:block border-t border-border pt-6">
                <FiltersContent />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Results count */}
              <p className="text-sm text-muted-foreground mb-4">
                {isLoading ? 'Загрузка...' : `Найдено: ${mappedProducts.length} товаров`}
              </p>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-destructive mb-4">Ошибка загрузки товаров</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Попробовать снова
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {visibleProducts.map((product) => (
                      <ProductCard key={product.id} {...product} />
                    ))}
                  </div>

                  {visibleProducts.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">Товары не найдены</p>
                      <Button variant="outline" onClick={() => {
                        setSearchQuery('');
                        setActiveCategories(['all']);
                        resetFilters();
                      }}>
                        Сбросить все фильтры
                      </Button>
                    </div>
                  )}

                  {hasMore && (
                    <div className="flex justify-center mt-12">
                      <Button 
                        variant="outline" 
                        onClick={() => setVisibleCount(prev => prev + 8)}
                        className="px-8"
                      >
                        Загрузить ещё
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Catalog;
