import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/contexts/FavoritesContext';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
}

export const ProductCard = ({ id, name, description, price, oldPrice, image }: ProductCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isLiked = isFavorite(id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({ id, name, description, price, oldPrice, image });
  };

  return (
    <article className="group animate-fade-in">
      {/* Image Container */}
      <Link to={`/catalog/${id}`} className="block relative aspect-[3/4] overflow-hidden bg-secondary rounded-2xl mb-4">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Like Button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm transition-all hover:bg-background hover:scale-110"
          aria-label={isLiked ? "Убрать из избранного" : "Добавить в избранное"}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              isLiked ? "fill-accent text-accent" : "text-foreground/60"
            )}
          />
        </button>
      </Link>

      {/* Content */}
      <Link to={`/catalog/${id}`} className="block space-y-2">
        {/* Prices */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg">
            {formatPrice(price)} ₽
          </span>
          {oldPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(oldPrice)} ₽
            </span>
          )}
        </div>

        <h3 className="font-medium text-sm leading-tight line-clamp-2 text-foreground/90 group-hover:text-foreground transition-colors">
          {name}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>
      </Link>
    </article>
  );
};
