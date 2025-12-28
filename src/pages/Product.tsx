import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Heart, Minus, Plus, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useToast } from '@/hooks/use-toast';

import bouquet1 from '@/assets/products/bouquet-1.jpg';
import bouquet2 from '@/assets/products/bouquet-2.jpg';
import bouquet3 from '@/assets/products/bouquet-3.jpg';
import bouquet4 from '@/assets/products/bouquet-4.jpg';
import bouquet5 from '@/assets/products/bouquet-5.jpg';
import bouquet6 from '@/assets/products/bouquet-6.jpg';
import bouquet7 from '@/assets/products/bouquet-7.jpg';
import bouquet8 from '@/assets/products/bouquet-8.jpg';

// Mock product data
const productsData: Record<string, {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  images: string[];
  article: string;
  size: string;
  category: string;
}> = {
  '1': {
    id: '1',
    name: 'Небесный букет-комплимент с ароматной маттиолой',
    description: 'Изысканный букет из свежих розовых пионов с зеленью. Идеально подойдет для признания в любви или в качестве комплимента.',
    price: 1850,
    images: [bouquet1, bouquet2, bouquet3],
    article: 'FT1396',
    size: '20-25см',
    category: 'Ароматные',
  },
  '2': {
    id: '2',
    name: 'Комплимент в нежных оттенках с герберами',
    description: 'Нежный букет из роз и ранункулюсов в пастельных тонах. Прекрасный выбор для любого торжества.',
    price: 2500,
    images: [bouquet2, bouquet1, bouquet4],
    article: 'FT1397',
    size: '25-30см',
    category: 'Монобукеты',
  },
  '3': {
    id: '3',
    name: 'Мини 3 кустовых розы',
    description: 'Яркий букет из тюльпанов разных оттенков. Миниатюрный и элегантный.',
    price: 2150,
    images: [bouquet3, bouquet5, bouquet6],
    article: 'FT1398',
    size: '15-20см',
    category: 'Монобукеты',
  },
  '4': {
    id: '4',
    name: 'Красивый букет с розами',
    description: 'Классический букет из красных роз премиум-класса. Символ любви и страсти.',
    price: 6500,
    images: [bouquet4, bouquet7, bouquet8],
    article: 'FT1399',
    size: '35-40см',
    category: 'Авторские букеты',
  },
  '5': {
    id: '5',
    name: 'Пионы розовые',
    description: 'Букет из полевых цветов с лавандой и ромашками.',
    price: 3950,
    images: [bouquet5, bouquet1, bouquet2],
    article: 'FT1400',
    size: '30-35см',
    category: 'Монобукеты',
  },
  '6': {
    id: '6',
    name: 'Герберы микс',
    description: 'Яркий букет из подсолнухов и хризантем.',
    price: 2990,
    images: [bouquet6, bouquet3, bouquet4],
    article: 'FT1401',
    size: '25-30см',
    category: 'Монобукеты',
  },
  '7': {
    id: '7',
    name: 'Персиковая роза с ароматной маттиолой',
    description: 'Авторская композиция из садовых роз.',
    price: 6350,
    images: [bouquet7, bouquet5, bouquet6],
    article: 'FT1402',
    size: '30-35см',
    category: 'Ароматные',
  },
  '8': {
    id: '8',
    name: 'Сборный букет с 30-ти эустом',
    description: 'Монобукет из белых пионов с эвкалиптом.',
    price: 36350,
    images: [bouquet8, bouquet7, bouquet1],
    article: 'FT1403',
    size: '45-50см',
    category: 'Авторские букеты',
  },
};

// Addon options
const addons = [
  { id: 'rafaello', name: 'Конфеты Rafaello', price: 850 },
  { id: 'card', name: 'Открытка ручной работы', price: 250 },
  { id: 'balloons', name: 'Воздушные шары в ассортименте', price: 500 },
  { id: 'heart-balloons', name: 'Фигурные шары сердца', price: 750 },
];

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();

  const product = id ? productsData[id] : null;
  const isLiked = product ? isFavorite(product.id) : false;

  if (!product) {
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

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
      image: product.images[0],
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
      description: product.description,
      price: product.price,
      image: product.images[0],
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
                  src={product.images[selectedImage]}
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
              <div className="flex gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "w-20 h-20 rounded-xl overflow-hidden border-2 transition-all",
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
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Арт: {product.article}</p>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
                <p className="text-muted-foreground">{product.description}</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">{formatPrice(product.price)} ₽</span>
                {product.oldPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.oldPrice)} ₽
                  </span>
                )}
              </div>

              {/* Size */}
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Размер</p>
                <p className="font-medium">{product.size}</p>
              </div>

              {/* Addons */}
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
