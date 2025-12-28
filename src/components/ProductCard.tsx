import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/contexts/FavoritesContext';
import { QuickViewModal } from '@/components/QuickViewModal';

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
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const isLiked = isFavorite(id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({ id, name, description, price, oldPrice, image });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  return (
    <>
      <article className="group animate-fade-in">
        {/* Image Container */}
        <Link to={`/product/${id}`} className="block relative aspect-[3/4] overflow-hidden bg-secondary rounded-2xl mb-4">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {/* Like Button */}
            <button
              onClick={handleToggleFavorite}
              className="p-2 rounded-full bg-background/80 backdrop-blur-sm transition-all hover:bg-background hover:scale-110"
              aria-label={isLiked ? "Убрать из избранного" : "Добавить в избранное"}
            >
              <Heart
                className={cn(
                  "h-5 w-5 transition-colors",
                  isLiked ? "fill-accent text-accent" : "text-foreground/60"
                )}
              />
            </button>
            
            {/* Quick View Button */}
            <button
              onClick={handleQuickView}
              className="p-2 rounded-full bg-background/80 backdrop-blur-sm transition-all hover:bg-background hover:scale-110 opacity-0 group-hover:opacity-100"
              aria-label="Быстрый просмотр"
            >
              <Eye className="h-5 w-5 text-foreground/60" />
            </button>
          </div>
          
          {/* Discount Badge */}
          {oldPrice && (
            <span className="absolute top-3 left-3 px-2 py-1 bg-accent text-white text-xs font-medium rounded-full">
              -{Math.round((1 - price / oldPrice) * 100)}%
            </span>
          )}
        </Link>

        {/* Content */}
        <Link to={`/product/${id}`} className="block space-y-2">
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

      {/* Quick View Modal */}
      <QuickViewModal
        productId={id}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </>
  );
};
