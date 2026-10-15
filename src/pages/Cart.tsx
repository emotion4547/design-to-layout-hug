import { reachGoal, GOALS } from '@/lib/metrika';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createOrder } from '@/services/orders';
import { formatRuPhone, isCompleteRuPhone } from '@/lib/phone';
import { SEO } from '@/components/SEO';


const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCheckout, setIsCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Открытие непустой корзины — шаг воронки между «положил» и «оформил»:
  // именно здесь видно, сколько людей дошли до корзины и не оформили.
  // Шлём один раз за посещение, иначе правка количества товара насчитала бы
  // по цели на каждый щелчок.
  const cartCounted = useRef(false);
  useEffect(() => {
    if (cartCounted.current || items.length === 0) return;
    cartCounted.current = true;
    reachGoal(GOALS.viewCart, { total: totalPrice, positions: items.length });
  }, [items.length, totalPrice]);
  // В заявке только имя и телефон: остальное — адрес, дату, время, открытку —
  // менеджер уточняет по телефону. Длинная форма на телефоне отпугивала: за три
  // недели рекламы 83% посетителей смотрели букеты и ни один не оформил заказ.
  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    consentToDataProcessing: false,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.senderName.trim()) {
      toast({ title: "Ошибка", description: "Укажите ваше имя", variant: "destructive" });
      return;
    }
    if (!formData.senderPhone.trim()) {
      toast({ title: "Ошибка", description: "Укажите телефон", variant: "destructive" });
      return;
    }
    // Недобранный номер лучше поймать здесь: в заявке он выглядит настоящим,
    // а менеджер узнаёт о нём, только когда не может дозвониться.
    if (!isCompleteRuPhone(formData.senderPhone)) {
      toast({ title: "Ошибка", description: "Телефон неполный — нужно 10 цифр после +7", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      await createOrder({
        senderName: formData.senderName.trim(),
        senderPhone: formData.senderPhone.trim(),
        items,
        totalPrice,
      });

      // Цель шлём после того, как заказ создан. Раньше она уходила до записи
      // в базу, и упавшая заявка всё равно засчитывалась как покупка.
      reachGoal(GOALS.purchase, { total: totalPrice });

      toast({
        title: "Заявка принята!",
        description: "Менеджер перезвонит и уточнит детали заказа.",
      });
      clearCart();
      setIsCheckout(false);
      navigate('/');
    } catch (error: unknown) {
      const err = error as { message?: string; details?: string } | null;
      const errMsg = err?.message || err?.details || JSON.stringify(error);
      console.error('ORDER_ERROR:', errMsg);
      toast({
        title: "Ошибка оформления",
        description: `Не удалось отправить заявку: ${errMsg}. Позвоните нам, и мы оформим заказ по телефону.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isCheckout) {
    return (
      <PageLayout>
        <SEO
          title="Корзина"
          description="Ваша корзина покупок в магазине Везу букет"
          url="/cart"
          noindex
        />
        <section className="py-16">
          <div className="container text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Корзина пуста</h1>
            <p className="text-muted-foreground mb-6">
              Добавьте товары из каталога, чтобы оформить заказ
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
        title={isCheckout ? 'Оформление заказа' : 'Корзина'}
        description="Ваша корзина покупок в магазине Везу букет"
        url="/cart"
        noindex
      />
      <section className="py-8 md:py-12">
        <div className="container">
          <nav className="text-sm text-muted-foreground mb-6" aria-label="Хлебные крошки">
            <Link to="/" className="hover:text-foreground">Главная</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Корзина</span>
          </nav>

          <h1 className="text-2xl md:text-3xl font-bold mb-8">
            {isCheckout ? 'Оформление заказа' : 'Корзина'}
          </h1>

          {!isCheckout ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => {
                  const addonsPrice = item.addons?.reduce((a, addon) => a + addon.price, 0) || 0;
                  const itemTotal = (item.price + addonsPrice) * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 border border-border rounded-2xl"
                    >
                      <Link to={`/catalog/${item.id}`} className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-xl"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link to={`/catalog/${item.id}`}>
                          <h3 className="font-medium line-clamp-2 hover:text-primary transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        
                        {item.addons && item.addons.length > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            + {item.addons.map(a => a.name).join(', ')}
                          </p>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 rounded border border-border hover:bg-secondary"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 rounded border border-border hover:bg-secondary"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3">
                            <span className="font-bold whitespace-nowrap">{formatPrice(itemTotal)} ₽</span>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 p-6 bg-secondary/50 rounded-2xl space-y-4">
                  <h2 className="font-bold text-lg">Итого</h2>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Товары ({items.length})</span>
                    <span>{formatPrice(totalPrice)} ₽</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Доставка</span>
                    <span>Рассчитывается</span>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Сумма заказа</span>
                      <span>{formatPrice(totalPrice)} ₽</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full gap-2" 
                    size="lg"
                    onClick={() => setIsCheckout(true)}
                  >
                    Оформить заказ
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
              <p className="text-muted-foreground">
                Оставьте имя и телефон — менеджер перезвонит, уточнит адрес, дату и время
                доставки, текст открытки и подтвердит заказ.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="checkout-name">Ваше имя *</Label>
                  <Input
                    id="checkout-name"
                    required
                    autoComplete="name"
                    value={formData.senderName}
                    onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                    placeholder="Как вас зовут"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout-phone">Телефон *</Label>
                  <Input
                    id="checkout-phone"
                    required
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    maxLength={18}
                    value={formData.senderPhone}
                    onChange={(e) => setFormData({ ...formData, senderPhone: formatRuPhone(e.target.value) })}
                    placeholder="+7 (___) ___-__-__"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent"
                  checked={formData.consentToDataProcessing}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, consentToDataProcessing: checked === true })
                  }
                  disabled={isSubmitting}
                  className="mt-1"
                />
                <Label htmlFor="consent" className="text-sm text-muted-foreground font-normal cursor-pointer">
                  Я даю согласие на обработку персональных данных в соответствии с{' '}
                  <Link to="/privacy" className="text-primary hover:underline" target="_blank">
                    Политикой конфиденциальности
                  </Link>
                  {' '}и принимаю условия{' '}
                  <Link to="/terms" className="text-primary hover:underline" target="_blank">
                    Пользовательского соглашения
                  </Link>
                  {' *'}
                </Label>
              </div>

              {/* Summary & Submit */}
              <div className="p-4 bg-secondary/50 rounded-2xl">
                <div className="flex justify-between font-bold text-lg">
                  <span>К оплате</span>
                  <span>{formatPrice(totalPrice)} ₽</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCheckout(false)}
                  disabled={isSubmitting}
                >
                  Назад
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={isSubmitting || !formData.consentToDataProcessing}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Оформление...
                    </>
                  ) : (
                    'Отправить заявку'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default Cart;