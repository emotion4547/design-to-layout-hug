import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import bouquet1 from '@/assets/products/bouquet-1.jpg';
import bouquet2 from '@/assets/products/bouquet-2.jpg';
import bouquet3 from '@/assets/products/bouquet-3.jpg';
import bouquet4 from '@/assets/products/bouquet-4.jpg';
import bouquet5 from '@/assets/products/bouquet-5.jpg';
import bouquet6 from '@/assets/products/bouquet-6.jpg';
import bouquet7 from '@/assets/products/bouquet-7.jpg';
import bouquet8 from '@/assets/products/bouquet-8.jpg';

const categories = [
  { id: 'all', name: 'Все' },
  { id: 'aromatic', name: 'Ароматные' },
  { id: 'new-year', name: 'Новогодние композиции' },
  { id: 'mono', name: 'Монобукеты' },
  { id: 'author', name: 'Авторские букеты' },
  { id: 'edible', name: 'Съедобные букеты' },
  { id: 'wedding', name: 'Свадебные букеты' },
  { id: 'box', name: 'Цветы в коробках / корзинах' },
  { id: 'gifts', name: 'Подарки' },
  { id: 'balloons', name: 'Сеты из воздушных шаров' },
  { id: 'vases', name: 'Вазы' },
  { id: 'certificates', name: 'Сертификаты' },
  { id: 'toys', name: 'Игрушки' },
];

const products = [
  {
    id: '1',
    name: 'Небесный букет-комплимент с ароматной маттиолой',
    description: 'Изысканный букет из свежих розовых пионов с зеленью',
    price: 1850,
    image: bouquet1,
    category: 'aromatic',
  },
  {
    id: '2',
    name: 'Комплимент в нежных оттенках с герберами',
    description: 'Нежный букет из роз и ранункулюсов в пастельных тонах',
    price: 2500,
    image: bouquet2,
    category: 'mono',
  },
  {
    id: '3',
    name: 'Мини 3 кустовых розы',
    description: 'Яркий букет из тюльпанов разных оттенков',
    price: 2150,
    image: bouquet3,
    category: 'mono',
  },
  {
    id: '4',
    name: 'Красивый букет с розами',
    description: 'Классический букет из красных роз премиум-класса',
    price: 6500,
    image: bouquet4,
    category: 'author',
  },
  {
    id: '5',
    name: 'Пионы розовые',
    description: 'Букет из полевых цветов с лавандой и ромашками',
    price: 3950,
    image: bouquet5,
    category: 'mono',
  },
  {
    id: '6',
    name: 'Герберы микс',
    description: 'Яркий букет из подсолнухов и хризантем',
    price: 2990,
    image: bouquet6,
    category: 'mono',
  },
  {
    id: '7',
    name: 'Персиковая роза с ароматной маттиолой',
    description: 'Авторская композиция из садовых роз',
    price: 6350,
    image: bouquet7,
    category: 'aromatic',
  },
  {
    id: '8',
    name: 'Сборный букет с 30-ти эустом',
    description: 'Монобукет из белых пионов с эвкалиптом',
    price: 36350,
    image: bouquet8,
    category: 'author',
  },
  {
    id: '9',
    name: 'Классический сборный розовый',
    description: 'Сборный букет в нежных тонах',
    price: 3350,
    image: bouquet1,
    category: 'author',
  },
  {
    id: '10',
    name: 'Нежный сборный букет с кустовой',
    description: 'Букет с кустовыми розами',
    price: 3400,
    image: bouquet2,
    category: 'author',
  },
  {
    id: '11',
    name: 'Пышный букет с розами и гортензией',
    description: 'Роскошный букет с гортензией',
    price: 11500,
    image: bouquet3,
    category: 'author',
  },
  {
    id: '12',
    name: 'Букет с кустовыми розами',
    description: 'Элегантный букет с кустовыми розами',
    price: 3950,
    image: bouquet4,
    category: 'mono',
  },
];

const MIN_PRICE = 0;
const MAX_PRICE = 50000;

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || 'all';
  
  const [activeCategory, setActiveCategory] = useState(categoryFromUrl);
  const [visibleCount, setVisibleCount] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([MIN_PRICE, MAX_PRICE]);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  // Sync with URL category
  useEffect(() => {
    setActiveCategory(categoryFromUrl);
    setVisibleCount(12);
  }, [categoryFromUrl]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesCategory && matchesSearch && matchesPrice;
    });

    // Sort
    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [activeCategory, searchQuery, priceRange, sortBy]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const hasActiveFilters = priceRange[0] !== MIN_PRICE || priceRange[1] !== MAX_PRICE || sortBy !== 'default';

  const resetFilters = () => {
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setSortBy('default');
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
          step={100}
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

      {/* Sorting */}
      <div className="space-y-3">
        <h3 className="font-medium">Сортировка</h3>
        <div className="space-y-2">
          {[
            { id: 'default', label: 'По умолчанию' },
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
      {/* Page Header */}
      <section className="py-8 md:py-12 bg-background">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <span>Главная</span>
            <span className="mx-2">/</span>
            <span className="text-foreground">Каталог</span>
          </nav>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Каталог
          </h1>

          {/* Search & Filter Toggle */}
          <div className="flex gap-3 max-w-md">
            <div className="relative flex-1">
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
            
            {/* Mobile Filter Button */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden relative">
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
          {(searchQuery || hasActiveFilters || activeCategory !== 'all') && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                  Поиск: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-primary">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {activeCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                  {categories.find(c => c.id === activeCategory)?.name}
                  <button onClick={() => setActiveCategory('all')} className="ml-1 hover:text-primary">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
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
                  {sortBy === 'price-asc' ? 'Сначала дешевые' : 'Сначала дорогие'}
                  <button onClick={() => setSortBy('default')} className="ml-1 hover:text-primary">
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
              <nav className="space-y-1 mb-8">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setVisibleCount(12);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors",
                      activeCategory === category.id
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-foreground/80 hover:bg-secondary"
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </nav>

              {/* Desktop Filters */}
              <div className="hidden lg:block border-t border-border pt-6">
                <FiltersContent />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Results count */}
              <p className="text-sm text-muted-foreground mb-4">
                Найдено: {filteredProducts.length} товаров
              </p>

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
                    setActiveCategory('all');
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
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Catalog;
