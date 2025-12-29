import { PageLayout } from '@/components/PageLayout';
import { MapPin, Clock, Truck, CheckCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const deliveryZones = [
  {
    icon: MapPin,
    title: 'Самовывоз',
    description: 'Вы всегда можете забрать заказ самостоятельно в удобное время.',
    price: 'Бесплатно',
  },
  {
    icon: Clock,
    title: 'Доставка по городу',
    description: 'Ежедневно с 9:00 до 21:00. Бесплатная доставка по городу от определённой суммы заказа.',
    price: 'от 0 ₽',
  },
  {
    icon: Truck,
    title: 'Доставка за город',
    description: 'Мы осуществляем доставку по всему Новороссийску и пригороду, стоимость зависит от суммы заказа и удалённости.',
    price: 'от 200 ₽',
  },
  {
    icon: CheckCircle,
    title: 'Качество доставки',
    description: 'Наши курьеры всегда оперативно, аккуратно и вовремя доставят ваш букет в лучшем виде прямо в руки.',
    price: null,
  },
];

const deliveryDetails = [
  'Доставка осуществляется ежедневно с 9:00 до 21:00',
  'Бесплатная доставка по городу от суммы заказа 3000₽',
  'Доставка за город рассчитывается индивидуально',
  'Возможна срочная доставка за 30 минут',
  'Курьер позвонит за 15-30 минут до прибытия',
  'Оплата при получении или онлайн',
];

const DeliveryPage = () => {
  return (
    <PageLayout>
      {/* Page Header */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Наша доставка
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Мы осуществляем доставку лучших букетов из цветов по г. Новороссийск и пригороду.
          </p>
        </div>
      </section>

      {/* Delivery Options Grid */}
      <section className="pb-16">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {deliveryZones.map((zone) => (
              <div 
                key={zone.title}
                className="group p-6 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
              >
                <zone.icon className="h-8 w-8 mb-4 text-foreground/70 group-hover:text-foreground transition-colors" />
                <h3 className="font-semibold text-lg mb-2">{zone.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {zone.description}
                </p>
                {zone.price && (
                  <p className="text-sm font-semibold text-foreground">
                    {zone.price}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Details */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Условия доставки
            </h2>
            <ul className="space-y-4">
              {deliveryDetails.map((detail, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-foreground/60 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/90">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Delivery Map Area */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Зона доставки
          </h2>
          <div className="aspect-[16/9] md:aspect-[21/9] bg-secondary/50 rounded-lg flex items-center justify-center">
            <div className="text-center p-8">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4 text-lg font-medium">
                Доставка по г. Новороссийск и пригороду
              </p>
              <p className="text-sm text-muted-foreground">
                Для уточнения стоимости доставки в ваш район — свяжитесь с нами
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
            <div>
              <h3 className="text-2xl font-bold mb-2">Остались вопросы?</h3>
              <p className="text-muted-foreground">Позвоните нам, и мы всё расскажем</p>
            </div>
            <a href="tel:89644560066">
              <Button size="lg" className="gap-2">
                <Phone className="h-5 w-5" />
                8 964 456 00 66
              </Button>
            </a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default DeliveryPage;
