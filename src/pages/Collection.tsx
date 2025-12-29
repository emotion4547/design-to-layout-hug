import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCollection, useCollectionProducts } from '@/hooks/useCollections';
import { SEO, BreadcrumbSchema } from '@/components/SEO';

// Fallback images
import bouquet1 from '@/assets/products/bouquet-1.jpg';

const CollectionPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [visibleCount, setVisibleCount] = useState(12);

  const { data: collection, isLoading: collectionLoading } = useCollection(slug || '');
  const { data: collectionProducts, isLoading: productsLoading } = useCollectionProducts(collection?.id || '');

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
      <SEO
        title={collection.name}
        description={collection.description || `Коллекция ${collection.name} в магазине Бутон в тон`}
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
          
          {collection.description && (
            <p className="text-lg text-muted-foreground max-w-2xl">
              {collection.description}
            </p>
          )}
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
      </section>
    </PageLayout>
  );
};

export default CollectionPage;
