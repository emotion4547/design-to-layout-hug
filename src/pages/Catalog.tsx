import { RichText } from '@/components/RichText';
import { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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
import {
  tagBouquet,
  roseBucket,
  FLOWER_RULES,
  COLOR_RULES,
  ROSE_COUNT_OPTIONS,
  type BouquetTags,
} from '@/lib/bouquetTags';

type TagKey = 'flower' | 'color' | 'roses';

// Fallback images for products without image_url
import bouquet1 from '@/assets/products/bouquet-1.webp';
import bouquet2 from '@/assets/products/bouquet-2.webp';
import bouquet3 from '@/assets/products/bouquet-3.webp';
import bouquet4 from '@/assets/products/bouquet-4.webp';
import bouquet5 from '@/assets/products/bouquet-5.webp';
import bouquet6 from '@/assets/products/bouquet-6.webp';
import bouquet7 from '@/assets/products/bouquet-7.webp';
import bouquet8 from '@/assets/products/bouquet-8.webp';

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

/**
 * Ценовые сегменты — готовые диапазоны цены, чтобы не двигать ползунок.
 * Это пресеты поверх обычного фильтра цены: клик ставит диапазон, а ползунок и
 * поля ниже показывают его и позволяют подправить. Границы включают оба конца,
 * как они сформулированы в названиях: «до 3 000», «3 000–7 000», «более 7 000».
 */
const PRICE_SEGMENTS = [
  { id: 'compliment', title: 'Комплимент', hint: 'до 3 000 ₽', range: [MIN_PRICE, 3000] },
  { id: 'occasion', title: 'Особый повод', hint: '3 000–7 000 ₽', range: [3000, 7000] },
  { id: 'luxury', title: 'Роскошный подарок', hint: 'более 7 000 ₽', range: [7000, MAX_PRICE] },
] as const;

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Страница категории — тот же каталог, но с постоянным адресом вида
  // /category/bukety: его можно продвигать под запрос «купить букет
  // в Новороссийске», а фильтр ?category= поисковик не индексирует.
  const { slug: categorySlug } = useParams<{ slug?: string }>();
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

  // Фильтры по составу и цвету живут прямо в адресе страницы
  // (/catalog?flower=roses&color=red): на такой адрес можно вести рекламу
  // и делиться им — человек сразу видит нужную подборку.
  const readTag = (key: TagKey, allowed: { id: string }[]) => {
    const v = searchParams.get(key);
    return v && allowed.some((o) => o.id === v) ? v : null;
  };
  const flower = readTag('flower', FLOWER_RULES);
  const color = readTag('color', COLOR_RULES);
  const roses = readTag('roses', ROSE_COUNT_OPTIONS);

  const setTag = (key: TagKey, value: string | null) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
    setVisibleCount(12);
  };
  const toggleTag = (key: TagKey, current: string | null, value: string) =>
    setTag(key, current === value ? null : value);

  // Fetch categories from database
  const { data: dbCategories = [], isLoading: categoriesLoading } = useCategories({ activeOnly: true });
  const { data: productCounts } = useProductCounts();
  
  // Build categories list with "All" option
  const categories = useMemo(() => [
    { id: 'all', slug: 'all', name: 'Все' },
    ...dbCategories,
  ], [dbCategories]);

  // Категория из адреса /category/<слаг> важнее фильтра в query-параметре.
  const routeCategory = useMemo(
    () => (categorySlug ? dbCategories.find((c) => c.slug === categorySlug) : undefined),
    [categorySlug, dbCategories]
  );

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
    setActiveCategories([routeCategory?.id ?? categoryFromUrl]);
    setSearchQuery(searchFromUrl);
    setVisibleCount(12);
  }, [categoryFromUrl, searchFromUrl, routeCategory?.id]);

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

  // Метки считаются из названия и описания — см. src/lib/bouquetTags.ts.
  const taggedProducts = useMemo(
    () => mappedProducts.map((product) => ({ ...product, tags: tagBouquet(product) })),
    [mappedProducts],
  );

  // Товар проходит все фильтры по меткам, кроме, возможно, одного: так для
  // каждого варианта считается, сколько товаров останется, если его выбрать.
  const passes = (tags: BouquetTags, skip?: TagKey) =>
    (skip === 'flower' || !flower || tags.flowers.includes(flower)) &&
    (skip === 'color' || !color || tags.colors.includes(color)) &&
    (skip === 'roses' || !roses || roseBucket(tags.roseCount) === roses);

  const filteredProducts = taggedProducts.filter((p) => passes(p.tags));

  const countWhere = (skip: TagKey, test: (tags: BouquetTags) => boolean) =>
    taggedProducts.reduce((n, p) => n + (passes(p.tags, skip) && test(p.tags) ? 1 : 0), 0);

  const flowerOptions = FLOWER_RULES.map((o) => ({
    ...o,
    count: countWhere('flower', (t) => t.flowers.includes(o.id)),
  }));
  const colorOptions = COLOR_RULES.map((o) => ({
    ...o,
    count: countWhere('color', (t) => t.colors.includes(o.id)),
  }));
  const roseOptions = ROSE_COUNT_OPTIONS.map((o) => ({
    ...o,
    count: countWhere('roses', (t) => roseBucket(t.roseCount) === o.id),
  }));

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  // Сегмент считается выбранным, пока диапазон цены в точности совпадает с его границами.
  const activeSegment = PRICE_SEGMENTS.find(
    (seg) => seg.range[0] === priceRange[0] && seg.range[1] === priceRange[1],
  );

  const hasActiveFilters = priceRange[0] !== MIN_PRICE || priceRange[1] !== MAX_PRICE || sortBy !== 'default' || !inStockOnly || withDiscountOnly || !!roses;
  const hasTagFilters = !!(flower || color || roses);

  const resetFilters = () => {
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setSortBy('default');
    setInStockOnly(true);
    setWithDiscountOnly(false);
    if (hasTagFilters) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          (['flower', 'color', 'roses'] as const).forEach((k) => next.delete(k));
          return next;
        },
        { replace: true },
      );
    }
  };

  const chipClass = (selected: boolean, disabled = false) =>
    cn(
      'shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors',
      selected
        ? 'bg-primary text-primary-foreground border-primary font-medium'
        : 'bg-background text-foreground/80 border-border hover:border-primary/50',
      disabled && 'opacity-40 pointer-events-none',
    );

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Сколько роз — так и ищут: «25 роз», «101 роза». */}
      {roseOptions.some((o) => o.count > 0) && (
        <div className="space-y-3">
          <h3 className="font-medium">Сколько роз</h3>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Сколько роз">
            {roseOptions.map((o) => (
              <button
                key={o.id}
                type="button"
                aria-pressed={roses === o.id}
                onClick={() => toggleTag('roses', roses, o.id)}
                className={chipClass(roses === o.id, o.count === 0 && roses !== o.id)}
              >
                {o.label}
                <span className="text-xs opacity-70">{o.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ценовой сегмент */}
      <div className="space-y-3">
        <h3 className="font-medium">Ценовой сегмент</h3>
        <div className="space-y-2" role="group" aria-label="Ценовой сегмент">
          {PRICE_SEGMENTS.map((seg) => {
            const selected = activeSegment?.id === seg.id;
            return (
              <button
                key={seg.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setPriceRange(selected ? [MIN_PRICE, MAX_PRICE] : [seg.range[0], seg.range[1]])}
                className={cn(
                  'w-full flex flex-col items-start gap-0.5 px-4 py-2.5 rounded-lg border text-left text-sm transition-colors',
                  selected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:border-primary/50',
                )}
              >
                <span className="font-medium">{seg.title}</span>
                <span className={cn('text-xs', selected ? 'opacity-90' : 'text-muted-foreground')}>{seg.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

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
        title={routeCategory ? routeCategory.name : 'Каталог цветов и букетов'}
        description={
          routeCategory
            ? `${routeCategory.name} с доставкой по Новороссийску от 1 часа. Живые фото, оплата онлайн, доставка в день заказа.`
            : 'Букеты, композиции в коробках и цветочные корзины с доставкой по Новороссийску от 1 часа. Более 60 позиций, живые фото, оплата онлайн.'
        }
        keywords={
          routeCategory
            ? `${routeCategory.name.toLowerCase()} Новороссийск, купить ${routeCategory.name.toLowerCase()}, доставка цветов Новороссийск`
            : 'каталог цветов, купить букет Новороссийск, авторские букеты, монобукеты, съедобные букеты, цветочные композиции'
        }
        url={routeCategory ? `/category/${routeCategory.slug}` : '/catalog'}
      />
      <BreadcrumbSchema items={
        routeCategory
          ? [
              { name: 'Главная', url: '/' },
              { name: 'Каталог', url: '/catalog' },
              { name: routeCategory.name, url: `/category/${routeCategory.slug}` },
            ]
          : [
              { name: 'Главная', url: '/' },
              { name: 'Каталог', url: '/catalog' },
            ]
      } />
      {/* Page Header */}
      <section className="pt-5 pb-4 md:py-12 bg-background">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-3 md:mb-6" aria-label="Хлебные крошки">
            <span>Главная</span>
            <span className="mx-2">/</span>
            <span className="text-foreground">Каталог</span>
          </nav>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4">
            {routeCategory ? routeCategory.name : 'Каталог'}
          </h1>

          {/* Вводный текст нужен странице категории: без него это «тонкое
              содержимое» — та же сетка товаров, что и в общем каталоге. */}
          {routeCategory && (
            <RichText
              html={
                routeCategory.description ||
                `${routeCategory.name} с доставкой по Новороссийску от 1 часа. Собираем в день заказа из свежих цветов, присылаем фото букета перед отправкой.`
              }
              className="text-muted-foreground max-w-2xl mb-6"
            />
          )}

          {/* Search & Sort & Filter Toggle */}
          {/* На телефоне здесь одна строка: поиск и кнопка фильтров. Сортировка
              переехала в строку «Найдено…» над сеткой — три строки подряд
              отодвигали первый букет за край экрана. */}
          <div className="flex gap-3">
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
              <SelectTrigger className="hidden sm:flex sm:w-[200px]">
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
          {(searchQuery || hasActiveFilters || hasTagFilters || activeCategoryNames.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { key: 'flower' as const, label: FLOWER_RULES.find((o) => o.id === flower)?.label },
                { key: 'color' as const, label: COLOR_RULES.find((o) => o.id === color)?.label },
                { key: 'roses' as const, label: ROSE_COUNT_OPTIONS.find((o) => o.id === roses)?.label },
              ]
                .filter((c) => c.label)
                .map((c) => (
                  <span key={c.key} className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                    {c.label}
                    <button onClick={() => setTag(c.key, null)} className="ml-1 hover:text-primary" aria-label={`Убрать фильтр «${c.label}»`}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
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
                  {activeSegment
                    ? `${activeSegment.title}: ${activeSegment.hint}`
                    : `${formatPrice(priceRange[0])} — ${formatPrice(priceRange[1])} ₽`}
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
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            {/* Sidebar - Categories & Filters (Desktop) */}
            <aside className="lg:w-64 shrink-0 min-w-0">
              {/* Categories.
                  На телефоне — одна строка с прокруткой вбок, на большом экране —
                  прежний столбец. Столбцом на телефоне категории занимали
                  пол-экрана, и букеты начинались только после прокрутки. */}
              {categoriesLoading ? (
                <div className="flex gap-2 overflow-hidden lg:block lg:space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-9 w-28 shrink-0 rounded-full lg:h-10 lg:w-full lg:rounded-lg" />
                  ))}
                </div>
              ) : (
                <nav
                  aria-label="Категории"
                  className="flex gap-2 overflow-x-auto -mx-6 px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:block lg:space-y-1 lg:mx-0 lg:px-0 lg:pb-0 lg:mb-8 lg:overflow-visible"
                >
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
                          "shrink-0 whitespace-nowrap text-left px-3.5 py-2 rounded-full border text-sm transition-colors flex items-center gap-2",
                          "lg:w-full lg:whitespace-normal lg:px-4 lg:py-2.5 lg:rounded-lg lg:border-0",
                          isActive
                            ? "bg-primary text-primary-foreground font-medium border-primary"
                            : "text-foreground/80 hover:bg-secondary border-border"
                        )}
                      >
                        {category.id !== 'all' && (
                          <span className={cn(
                            "w-4 h-4 rounded border hidden lg:flex items-center justify-center",
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
            <div className="flex-1 min-w-0">
              {/* Быстрые фильтры: какие цветы и какой цвет. Стоят над товарами
                  и на телефоне, и на компьютере — выбор в одно касание, без
                  шторки фильтров. Варианты, по которым ничего не найдётся,
                  не показываются. */}
              <div className="space-y-2 mb-3 sm:mb-4">
                <div
                  role="group"
                  aria-label="Цветы в букете"
                  className="flex gap-2 overflow-x-auto -mx-6 px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:px-0 lg:flex-wrap lg:overflow-visible"
                >
                  {/* Выбранный вариант встаёт первым: в ленте с прокруткой вбок
                      иначе он может оказаться за краем экрана. */}
                  {flowerOptions
                    .filter((o) => o.count > 0 || flower === o.id)
                    .sort((x, y) => Number(y.id === flower) - Number(x.id === flower))
                    .map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        aria-pressed={flower === o.id}
                        onClick={() => toggleTag('flower', flower, o.id)}
                        className={chipClass(flower === o.id)}
                      >
                        {o.label}
                        <span className="text-xs opacity-70">{o.count}</span>
                      </button>
                    ))}
                </div>
                <div
                  role="group"
                  aria-label="Цвет букета"
                  className="flex gap-2 overflow-x-auto -mx-6 px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:px-0 lg:flex-wrap lg:overflow-visible"
                >
                  {colorOptions
                    .filter((o) => o.count > 0 || color === o.id)
                    .sort((x, y) => Number(y.id === color) - Number(x.id === color))
                    .map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        aria-pressed={color === o.id}
                        onClick={() => toggleTag('color', color, o.id)}
                        className={chipClass(color === o.id)}
                      >
                        <span
                          aria-hidden="true"
                          className="h-3.5 w-3.5 rounded-full border border-black/15"
                          style={{ backgroundColor: o.swatch }}
                        />
                        {o.label}
                        <span className="text-xs opacity-70">{o.count}</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Results count + сортировка для телефона */}
              <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
                <p className="text-sm text-muted-foreground whitespace-nowrap">
                  {isLoading ? 'Загрузка...' : (
                    <>
                      <span className="hidden sm:inline">Найдено: </span>
                      {filteredProducts.length} товаров
                    </>
                  )}
                </p>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                  <SelectTrigger className="sm:hidden h-9 w-auto shrink-0 gap-1.5 px-3 text-sm" aria-label="Сортировка">
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Сортировка" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="default">По популярности</SelectItem>
                    <SelectItem value="newest">По новизне</SelectItem>
                    <SelectItem value="price-asc">Сначала дешевые</SelectItem>
                    <SelectItem value="price-desc">Сначала дорогие</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
