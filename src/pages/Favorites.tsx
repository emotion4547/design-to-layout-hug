import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/contexts/FavoritesContext';
import { ProductCard } from '@/components/ProductCard';
import { Heart } from 'lucide-react';
import { SEO } from '@/components/SEO';

const Favorites = () => {
  const { favorites } = useFavorites();

  if (favorites.length === 0) {
    return (
      <PageLayout>
        <SEO
          title="Избранное"
          description="Ваш список избранных товаров в магазине Везу букет"
          url="/favorites"
          noindex
        />
        <section className="py-16">
          <div className="container text-center">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Избранное пусто</h1>
            <p className="text-muted-foreground mb-6">
              Добавляйте понравившиеся товары, нажимая на сердечко
            </p>
            <Link to="/catalog">
              <Button>Перейти в каталог</Button>
            </Link>
          </div>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEO
        title="Избранное"
        description="Ваш список избранных товаров в магазине Везу букет"
        url="/favorites"
        noindex
      />
      <section className="py-8 md:py-12">
        <div className="container">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Главная</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Избранное</span>
          </nav>

          <h1 className="text-2xl md:text-3xl font-bold mb-8">
            Избранное ({favorites.length})
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {favorites.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                name={item.name}
                description={item.description}
                price={item.price}
                oldPrice={item.oldPrice}
                image={item.image}
              />
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Favorites;
