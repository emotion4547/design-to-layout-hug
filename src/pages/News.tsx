import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, X } from 'lucide-react';
import { stripHtml } from '@/lib/plainText.mjs';
import { cn } from '@/lib/utils';
import { useNews } from '@/hooks/useNews';
import { SEO, BreadcrumbSchema } from '@/components/SEO';

import news1 from '@/assets/news/news-1.jpg';
import news2 from '@/assets/news/news-2.jpg';
import news3 from '@/assets/news/news-3.jpg';
import news4 from '@/assets/news/news-4.jpg';
import news5 from '@/assets/news/news-5.jpg';
import news6 from '@/assets/news/news-6.jpg';

const fallbackImages: Record<string, string> = {
  '/news/news-1.jpg': news1,
  '/news/news-2.jpg': news2,
  '/news/news-3.jpg': news3,
  '/news/news-4.jpg': news4,
  '/news/news-5.jpg': news5,
  '/news/news-6.jpg': news6,
};

const ALL = 'all';

/** Нижний регистр и «ё» как «е»: иначе «мед» не найдёт «мёд». */
const norm = (v: string) => v.toLowerCase().replace(/ё/g, 'е');

const NewsPage = () => {
  // Показываем сразу все: при шести карточках в разметке поисковик видел
  // ссылки лишь на шесть статей из двадцати, а остальные оставались без
  // единой внутренней ссылки — только в карте сайта. Кнопка «показать ещё»
  // вернётся сама, когда статей станет больше двадцати.
  const [visibleCount, setVisibleCount] = useState(20);
  const { data: dbNews, isLoading, error } = useNews();

  // Подставлять выдуманные новости, когда база молчит, нельзя: их адреса
  // никуда не ведут, а текст обещает то, чего нет. Пустой список честнее —
  // состояние «пока пусто» ниже уже предусмотрено.
  const allNews = useMemo(() => dbNews ?? [], [dbNews]);

  // Рубрика и запрос живут в адресе: так состояние переживает обновление
  // страницы, работает кнопка «назад» и подборкой можно поделиться ссылкой.
  // Канонический адрес при этом остаётся /news, поэтому лишние страницы
  // в индексе не заводятся.
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || ALL;
  const query = params.get('q') || '';

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value && value !== ALL) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
    setVisibleCount(20);
  };

  // Рубрики берём из самих статей, а не из заранее заданного списка: иначе
  // новая рубрика появилась бы в базе и не появилась бы в фильтре.
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of allNews) {
      if (!item.category) continue;
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ru'));
  }, [allNews]);

  // Текст статьи храним размеченным, поэтому перед поиском снимаем теги —
  // иначе запрос «розы» совпадал бы со словом внутри адреса ссылки.
  const haystacks = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of allNews) {
      map.set(item.id, norm([
        item.title,
        item.excerpt ?? '',
        item.category ?? '',
        stripHtml(item.content ?? ''),
      ].join(' ')));
    }
    return map;
  }, [allNews]);

  const filtered = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return allNews.filter((item) => {
      if (category !== ALL && item.category !== category) return false;
      if (!words.length) return true;
      const hay = haystacks.get(item.id) ?? '';
      // Все слова запроса должны найтись — так «уход розы» не выдаёт всё
      // подряд про уход и всё подряд про розы.
      return words.every((w) => hay.includes(w));
    });
  }, [allNews, category, query, haystacks]);

  const visibleNews = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const isFiltered = category !== ALL || query.trim().length > 0;

  const reset = () => {
    setParams(new URLSearchParams(), { replace: true });
    setVisibleCount(20);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return news1;
    return fallbackImages[imageUrl] || imageUrl;
  };

  return (
    <PageLayout>
      <SEO
        title="Новости и моменты"
        description="Новости магазина цветов Везу букет. Новые коллекции, полезные советы по уходу за цветами, актуальные события."
        keywords="новости цветочный магазин, советы уход за цветами, новые коллекции букетов Новороссийск"
        url="/news"
      />
      <BreadcrumbSchema items={[
        { name: 'Главная', url: '/' },
        { name: 'Новости', url: '/news' },
      ]} />
      {/* Page Header */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Моменты
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Узнайте интересное и актуальное из нашей работы
          </p>
        </div>
      </section>

      {/* Поиск и рубрики */}
      <section className="pb-8">
        <div className="container">
          <div className="flex flex-col gap-4">
            <div className="relative max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <label htmlFor="news-search" className="sr-only">Поиск по статьям</label>
              <Input
                id="news-search"
                type="text"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                placeholder="Поиск по статьям"
                value={query}
                onChange={(e) => setParam('q', e.target.value)}
                className="pl-9 pr-9"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setParam('q', null)}
                  aria-label="Очистить поиск"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Рубрики">
                <button
                  type="button"
                  onClick={() => setParam('category', null)}
                  aria-pressed={category === ALL}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-sm border transition-colors',
                    category === ALL
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:border-primary/50',
                  )}
                >
                  Все <span className="opacity-60">{allNews.length}</span>
                </button>
                {categories.map(([name, count]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setParam('category', category === name ? null : name)}
                    aria-pressed={category === name}
                    className={cn(
                      'px-4 py-1.5 rounded-full text-sm border transition-colors',
                      category === name
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:border-primary/50',
                    )}
                  >
                    {name} <span className="opacity-60">{count}</span>
                  </button>
                ))}
              </div>
            )}

            {isFiltered && !isLoading && (
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {filtered.length === 0
                  ? 'Ничего не нашлось'
                  : `Нашлось статей: ${filtered.length}`}
                <button
                  type="button"
                  onClick={reset}
                  className="ml-3 underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  сбросить
                </button>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="pb-16 md:pb-20">
        <div className="container">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {visibleNews.map((item) => (
                  <Link to={`/news/${item.slug ?? item.id}`} key={item.id}>
                    <article className="group bg-background rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-shadow h-full">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
                        <img 
                          src={getImageUrl(item.image_url)} 
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {item.category && (
                          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                            {item.category}
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <p className="text-xs text-muted-foreground mb-2">
                          {formatDate(item.published_at)}
                        </p>
                        <h2 className="font-bold text-lg mb-3 group-hover:text-foreground/80 transition-colors line-clamp-2">
                          {item.title}
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                          {item.excerpt}
                        </p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {visibleNews.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  {isFiltered ? (
                    <>
                      <p className="text-muted-foreground mb-4">
                        По этому запросу статей нет. Попробуйте другое слово или
                        посмотрите все рубрики.
                      </p>
                      <Button variant="outline" onClick={reset}>
                        Показать все статьи
                      </Button>
                    </>
                  ) : (
                    <p className="text-muted-foreground">Новостей пока нет</p>
                  )}
                </div>
              )}

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center mt-12">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="px-8"
                    onClick={() => setVisibleCount(prev => prev + 6)}
                  >
                    Загрузить ещё
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default NewsPage;
