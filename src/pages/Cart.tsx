import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createOrder } from '@/services/orders';

const TIME_SLOTS = [
  '9:00 - 11:00',
  '11:00 - 13:00',
  '13:00 - 15:00',
  '15:00 - 17:00',
  '17:00 - 19:00',
  '19:00 - 21:00',
];

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCheckout, setIsCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    isSurprise: false,
    recipientName: '',
    recipientPhone: '',
    cardText: '',
    deliveryType: 'delivery' as 'delivery' | 'pickup',
    address: '',
    date: '',
    time: '',
    pickupTime: '',
    comment: '',
    email: '',
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createOrder({
        senderName: formData.senderName,
        senderPhone: formData.senderPhone,
        isSurprise: formData.isSurprise,
        recipientName: formData.recipientName,
        recipientPhone: formData.recipientPhone,
        cardText: formData.cardText || undefined,
        deliveryType: formData.deliveryType,
        deliveryAddress: formData.deliveryType === 'delivery' ? formData.address : 'Самовывоз',
        deliveryDate: formData.date,
        deliveryTime: formData.deliveryType === 'delivery' ? formData.time : undefined,
        pickupTime: formData.deliveryType === 'pickup' ? formData.pickupTime : undefined,
        comment: formData.comment || undefined,
        customerEmail: formData.email || undefined,
        items,
        totalPrice,
      });

      toast({
        title: "Заказ оформлен!",
        description: "Мы свяжемся с вами для подтверждения заказа.",
      });
      clearCart();
      setIsCheckout(false);
      navigate('/');
    } catch (error) {
      console.error('Order error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось оформить заказ. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isCheckout) {
    return (
      <PageLayout>
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
      <section className="py-8 md:py-12">
        <div className="container">
          <nav className="text-sm text-muted-foreground mb-6">
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
                      <span>К оплате</span>
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
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
              {/* Sender Info */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b border-border pb-2">Отправитель</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Имя (Отправитель) *</Label>
                    <Input
                      required
                      value={formData.senderName}
                      onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                      placeholder="Введите имя"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Телефон (Отправитель) *</Label>
                    <Input
                      required
                      type="tel"
                      value={formData.senderPhone}
                      onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                      placeholder="+7 (___) ___-__-__"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">
                      На этот телефон мы пришлем фото готового букета
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isSurprise"
                    checked={formData.isSurprise}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, isSurprise: checked as boolean })
                    }
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="isSurprise" className="text-sm cursor-pointer">
                    Будет сюрприз (до последнего не раскроем, что это доставка цветов и от кого)
                  </Label>
                </div>
              </div>

              {/* Recipient Info */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b border-border pb-2">Получатель</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Имя (Получатель)</Label>
                    <Input
                      value={formData.recipientName}
                      onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                      placeholder="Введите имя получателя"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Телефон (Получатель)</Label>
                    <Input
                      type="tel"
                      value={formData.recipientPhone}
                      onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                      placeholder="+7 (___) ___-__-__"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">
                      Контакт человека, которому вы хотите отправить букет
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Текст для открытки</Label>
                  <Textarea
                    value={formData.cardText}
                    onChange={(e) => setFormData({ ...formData, cardText: e.target.value })}
                    placeholder="Введите текст для открытки (бесплатно)"
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Delivery Options */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b border-border pb-2">Доставка</h2>
                <p className="text-sm text-muted-foreground">
                  При указании адреса, стоимость доставки вам рассчитает наш менеджер
                </p>

                <RadioGroup
                  value={formData.deliveryType}
                  onValueChange={(value) => setFormData({ ...formData, deliveryType: value as 'delivery' | 'pickup' })}
                  className="space-y-3"
                  disabled={isSubmitting}
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="cursor-pointer">Самовывоз</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="delivery" id="delivery" />
                    <Label htmlFor="delivery" className="cursor-pointer">Нужна доставка</Label>
                  </div>
                </RadioGroup>

                {formData.deliveryType === 'delivery' && (
                  <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                    <div className="space-y-2">
                      <Label>Адрес доставки *</Label>
                      <Input
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Город, улица, дом, квартира"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Дата доставки *</Label>
                        <Input
                          required
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Время доставки</Label>
                        <Select
                          value={formData.time}
                          onValueChange={(value) => setFormData({ ...formData, time: value })}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите время" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                {slot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {formData.deliveryType === 'pickup' && (
                  <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Дата самовывоза *</Label>
                        <Input
                          required
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Время самовывоза *</Label>
                        <Select
                          value={formData.pickupTime}
                          onValueChange={(value) => setFormData({ ...formData, pickupTime: value })}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите время" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                {slot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b border-border pb-2">Дополнительно</h2>
                
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Комментарий к заказу</Label>
                  <Textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="Дополнительные пожелания к заказу..."
                    rows={4}
                    disabled={isSubmitting}
                  />
                </div>
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
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Оформление...
                    </>
                  ) : (
                    'Подтвердить заказ'
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