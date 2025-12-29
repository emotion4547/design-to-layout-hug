import { useState } from 'react';
import { X, Heart, ShoppingBag, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useCart } from '@/contexts/CartContext';
import { useProduct } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface QuickViewModalProps {
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickViewModal = ({ productId, open, onOpenChange }: QuickViewModalProps) => {
  const { data: product, isLoading } = useProduct(productId);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
    }, quantity);
    toast({
      title: "Добавлено в корзину",
      description: `${product.name} (${quantity} шт.)`,
    });
    onOpenChange(false);
  };

  const handleToggleFavorite = () => {
    if (!product) return;
    toggleFavorite({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      oldPrice: product.old_price || undefined,
      image: product.image_url,
    });
  };

  const images = product?.images?.length ? product.images : [product?.image_url];
  const isLiked = product ? isFavorite(product.id) : false;

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">
          {product?.name || 'Просмотр товара'}
        </DialogTitle>
        
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6 p-6">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ) : product ? (
          <div className="grid md:grid-cols-2">
            {/* Image Section */}
            <div className="relative aspect-square bg-secondary">
              <img
                src={images[currentImageIndex] || ''}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  
                  {/* Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-colors",
                          index === currentImageIndex ? "bg-foreground" : "bg-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
              
              {/* Discount Badge */}
              {product.old_price && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-accent text-white text-sm font-medium rounded-full">
                  -{Math.round((1 - product.price / product.old_price) * 100)}%
                </span>
              )}
            </div>
            
            {/* Content Section */}
            <div className="p-6 flex flex-col">
              {/* Category */}
              {product.categories && (
                <span className="text-sm text-muted-foreground mb-2">
                  {product.categories.name}
                </span>
              )}
              
              {/* Title */}
              <h2 className="text-2xl font-bold mb-3">{product.name}</h2>
              
              {/* Prices */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(product.price)} ₽
                </span>
                {product.old_price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.old_price)} ₽
                  </span>
                )}
              </div>
              
              {/* Description */}
              {product.description && (
                <p className="text-muted-foreground mb-6 line-clamp-4">
                  {product.description}
                </p>
              )}
              
              {/* Size */}
              {product.size && (
                <p className="text-sm text-muted-foreground mb-4">
                  Размер: {product.size}
                </p>
              )}
              
              {/* Stock Status */}
              <div className="mb-6">
                {product.in_stock ? (
                  <span className="text-sm text-green-600 font-medium">В наличии</span>
                ) : (
                  <span className="text-sm text-destructive font-medium">Нет в наличии</span>
                )}
              </div>
              
              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium">Количество:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-secondary transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-secondary transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 mt-auto">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  className="flex-1"
                  size="lg"
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  В корзину
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleToggleFavorite}
                  className={cn(isLiked && "text-accent border-accent")}
                >
                  <Heart className={cn("h-5 w-5", isLiked && "fill-accent")} />
                </Button>
              </div>
              
              {/* View Full Page Link */}
              <Link
                to={`/catalog/${product.id}`}
                onClick={() => onOpenChange(false)}
                className="text-sm text-primary hover:underline mt-4 text-center"
              >
                Посмотреть полную страницу товара →
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            Товар не найден
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
