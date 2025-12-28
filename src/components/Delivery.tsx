import { MapPin, Clock, Truck, CheckCircle } from 'lucide-react';

const deliveryOptions = [
  {
    icon: MapPin,
    title: 'Самовывоз',
    description: 'Вы всегда можете забежать к нам в салон г. Сергиев Посад ул. Инженерная д.8 ТЦ "Престиж" 2ой этаж.',
  },
  {
    icon: Clock,
    title: 'Доставка по городу',
    description: 'Всегда с 9:15 до 21:00. Бесплатная доставка по городу от определенной суммы заказа.',
  },
  {
    icon: Truck,
    title: 'Доставка за город',
    description: 'Мы осуществляем доставку по всему Сергиево-Посадскому городскому округу, стоимость зависит от суммы заказа и удаленности.',
  },
  {
    icon: CheckCircle,
    title: 'Качество доставки',
    description: 'Наши штатные курьеры всегда оперативно, аккуратно и вовремя доставят ваш букет в лучшем виде прямо в руки.',
  },
];

export const Delivery = () => {
  return (
    <section id="delivery" className="py-16 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Наша доставка
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Мы осуществляем доставку лучших букетов из цветов по г. Сергиев Посад 
            и всему городскому округу.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deliveryOptions.map((option) => (
            <div 
              key={option.title}
              className="p-6 border border-border rounded-lg"
            >
              <option.icon className="h-8 w-8 mb-4 text-foreground/80" />
              <h3 className="font-semibold text-lg mb-2">{option.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {option.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
