import { useState } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
}

export const ProductCard = ({ id, name, description, price, oldPrice, image }: ProductCardProps) => {
  const [isLiked, setIsLiked] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <article className="group animate-fade-in">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Like Button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-background"
          aria-label={isLiked ? "Убрать из избранного" : "Добавить в избранное"}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              isLiked ? "fill-accent text-accent" : "text-foreground/60"
            )}
          />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2">
          {name}
        </h3>
        
        {/* Prices */}
        <div className="flex items-center gap-3">
          {oldPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(oldPrice)} ₽
            </span>
          )}
          <span className="font-bold text-base">
            {formatPrice(price)} ₽
          </span>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">
          {description}
        </p>
      </div>
    </article>
  );
};
