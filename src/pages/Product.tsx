import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Heart, Minus, Plus, ShoppingBag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useToast } from '@/hooks/use-toast';
import { useProduct } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';

import bouquet1 from '@/assets/products/bouquet-1.jpg';
import bouquet2 from '@/assets/products/bouquet-2.jpg';
import bouquet3 from '@/assets/products/bouquet-3.jpg';
import bouquet4 from '@/assets/products/bouquet-4.jpg';
import bouquet5 from '@/assets/products/bouquet-5.jpg';
import bouquet6 from '@/assets/products/bouquet-6.jpg';
import bouquet7 from '@/assets/products/bouquet-7.jpg';
import bouquet8 from '@/assets/products/bouquet-8.jpg';

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

interface CategoryAddon {
  id: string;
  name: string;
  price: number;
}

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [addons, setAddons] = useState<CategoryAddon[]>([]);
  
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  
  const { data: product, isLoading, error } = useProduct(id);
  const isLiked = product ? isFavorite(product.id) : false;

  // Fetch addons based on product's category
  useEffect(() => {
    const fetchAddons = async () => {
      if (!product?.category_id) {
        setAddons([]);
        return;
      }

      const { data } = await supabase
        .from('category_addons')
        .select('id, name, price')
        .eq('category_id', product.category_id)
        .eq('is_active', true)
        .order('sort_order');

      if (data) {
        setAddons(data);
      }
    };

    fetchAddons();
  }, [product?.category_id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const getProductImage = (imageUrl: string | null) => {
    if (!imageUrl) return bouquet1;
    return fallbackImages[imageUrl] || imageUrl;
  };

  const getProductImages = () => {
    if (!product) return [bouquet1];
    if (product.images && product.images.length > 0) {
      return product.images.map(img => fallbackImages[img] || img);
    }
    return [getProductImage(product.image_url)];
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (error || !product) {
    return (
      <PageLayout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Товар не найден</h1>
          <Link to="/catalog">
            <Button>Вернуться в каталог</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  const productImages = getProductImages();

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const selectedAddonItems = addons.filter(addon => selectedAddons.includes(addon.id));
  const totalAddonsPrice = selectedAddonItems.reduce((sum, addon) => sum + addon.price, 0);
  const totalPrice = (product.price + totalAddonsPrice) * quantity;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: productImages[0],
      addons: selectedAddonItems,
    }, quantity);
    
    toast({
      title: "Добавлено в корзину",
      description: `${product.name} (${quantity} шт.)`,
    });
  };

  const handleToggleFavorite = () => {
    toggleFavorite({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      image: productImages[0],
    });
  };

  return (
    <PageLayout>
      <section className="py-8 md:py-12">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Главная</Link>
            <span className="mx-2">/</span>
            <Link to="/catalog" className="hover:text-foreground">Каталог</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary">
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleToggleFavorite}
                  className="absolute top-4 right-4 p-3 rounded-full bg-background/80 backdrop-blur-sm transition-all hover:bg-background hover:scale-110"
                >
                  <Heart
                    className={cn(
                      "h-6 w-6 transition-colors",
                      isLiked ? "fill-accent text-accent" : "text-foreground/60"
                    )}
                  />
                </button>
              </div>

              {/* Thumbnails */}
              {productImages.length > 1 && (
                <div className="flex gap-3">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all",
                        selectedImage === index 
                          ? "border-primary" 
                          : "border-transparent hover:border-border"
                      )}
                    >
                      <img
                        src={image}
                        alt={`${product.name} - фото ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                {product.article && (
                  <p className="text-sm text-muted-foreground mb-2">Арт: {product.article}</p>
                )}
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
                {product.description && (
                  <p className="text-muted-foreground">{product.description}</p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">{formatPrice(product.price)} ₽</span>
                {product.old_price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.old_price)} ₽
                  </span>
                )}
              </div>

              {/* Size */}
              {product.size && (
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Размер</p>
                  <p className="font-medium">{product.size}</p>
                </div>
              )}

              {/* Addons */}
              {addons.length > 0 && (
                <div className="space-y-3">
                  <p className="font-medium">Дополнительно:</p>
                  {addons.map((addon) => (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-lg border transition-all text-left",
                        selectedAddons.includes(addon.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className={cn(
                        selectedAddons.includes(addon.id) ? "font-medium" : ""
                      )}>
                        {addon.name}
                      </span>
                      <span className="text-sm text-muted-foreground">+{formatPrice(addon.price)} ₽</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="space-y-4 pt-4 border-t border-border">
                {/* Quantity Selector */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Количество:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Total & Add to Cart */}
                <div className="flex items-center gap-4">
                  <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart}>
                    <ShoppingBag className="h-5 w-5" />
                    Добавить в корзину
                  </Button>
                  <span className="text-xl font-bold">{formatPrice(totalPrice)} ₽</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Product;
