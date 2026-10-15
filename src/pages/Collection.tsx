import { RichText } from '@/components/RichText';
import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCollection, useCollectionProducts, useCollections } from '@/hooks/useCollections';
import { stripHtml } from '@/lib/plainText.mjs';
import { SEO, BreadcrumbSchema } from '@/components/SEO';

// Fallback images
import bouquet1 from '@/assets/products/bouquet-1.webp';

const CollectionPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [visibleCount, setVisibleCount] = useState(24);

  const { data: collection, isLoading: collectionLoading } = useCollection(slug || '');
  const { data: collectionProducts, isLoading: productsLoading } = useCollectionProducts(collection?.id || '');
  const { data: allCollections } = useCollections(true);
  const otherCollections = (allCollections ?? []).filter((c) => c.slug !== slug);

  const products = useMemo(() => {
    if (!collectionProducts) return [];
    return collectionProducts
      .filter(cp => cp.products)
      .map(cp => {
        const product = cp.products as any;
        return {
          id: product.id,
          name: product.name,
          description: '',
          price: product.price,
          oldPrice: product.old_price,
          image: product.image_url || bouquet1,
          in_stock: product.in_stock,
        };
      });
  }, [collectionProducts]);

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  if (collectionLoading) {
    return (
      <PageLayout>
        <section className="py-8 md:py-12">
          <div className="container">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>
        </section>
      </PageLayout>
    );
  }

  if (!collection) {
    return (
      <PageLayout>
        <section className="py-16 md:py-24">
          <div className="container text-center">
            <h1 className="text-2xl font-bold mb-4">Подборка не найдена</h1>
            <p className="text-muted-foreground mb-6">
              Возможно, подборка была удалена или перемещена
            </p>
            <Button asChild>
              <Link to="/catalog">Перейти в каталог</Link>
            </Button>
          </div>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* seo_title и seo_description — заголовок и описание для выдачи: у страницы
          под запрос они отличаются от H1 и от текста над товарами. */}
      <SEO
        title={collection.seo_title || collection.name}
        description={
          collection.seo_description ||
          stripHtml(collection.description) ||
          `Коллекция ${collection.name} в магазине Везу букет`
        }
        image={collection.image_url || undefined}
        url={`/collection/${collection.slug}`}
      />
      <BreadcrumbSchema items={[
        { name: 'Главная', url: '/' },
        { name: collection.name, url: `/collection/${collection.slug}` },
      ]} />
      {/* Header with background */}
      <section className="relative overflow-hidden">
        {collection.image_url ? (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${collection.image_url})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/30" />
        )}
        
        <div className="container relative py-12 md:py-20">
          {/* Breadcrumb */}
          <nav className="text-sm mb-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground">Главная</Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link to="/catalog" className="text-muted-foreground hover:text-foreground">Каталог</Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <span className="text-foreground">{collection.name}</span>
          </nav>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {collection.name}
          </h1>
          
          <RichText html={collection.description} className="text-lg text-muted-foreground max-w-2xl" />
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 md:py-12">
        <div className="container">
          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-6">
            {productsLoading ? 'Загрузка...' : `${products.length} товаров в подборке`}
          </p>

          {productsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">В этой подборке пока нет товаров</p>
              <Button asChild variant="outline">
                <Link to="/catalog">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Перейти в каталог
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-12">
                  <Button 
                    variant="outline" 
                    onClick={() => setVisibleCount(prev => prev + 12)}
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

      {/* Текст под товарами: отвечает на вопросы покупателя и даёт странице
          содержание, по которому её можно найти. Выводится через RichText —
          он пропускает только разрешённые теги и проверяет адреса ссылок. */}
      {collection.seo_text && (
        <section className="pb-8 md:pb-12">
          <div className="container">
            <RichText
              html={collection.seo_text}
              className="max-w-3xl leading-relaxed text-foreground/90 [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1.5 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
            />
          </div>
        </section>
      )}

      {/* Другие подборки: ссылки между посадочными страницами помогают и
          покупателю, и поисковику добраться до каждой из них. */}
      {otherCollections.length > 0 && (
        <section className="pb-12 md:pb-16">
          <div className="container">
            <h2 className="text-xl md:text-2xl font-bold mb-4">Другие подборки</h2>
            <ul className="flex flex-wrap gap-2">
              {otherCollections.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/collection/${c.slug}`}
                    className="inline-block px-4 py-2 rounded-full border border-border text-sm hover:border-primary/50 transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </PageLayout>
  );
};

export default CollectionPage;
