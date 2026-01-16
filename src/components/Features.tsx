import { Clock, Leaf, Heart, Star } from 'lucide-react';

const features = [
  {
    icon: Clock,
    title: 'Сервис',
    description: 'Быстрая доставка в день заказа. Отправляем фото перед доставкой. Гарантия на все шары 24 часа.',
  },
  {
    icon: Leaf,
    title: 'Качество',
    description: 'Используем только качественный гелий и шары от проверенных производителей.',
  },
  {
    icon: Heart,
    title: 'Забота',
    description: 'Аккуратная упаковка и бережная доставка. Шары прибудут в идеальном состоянии.',
  },
  {
    icon: Star,
    title: 'Подарок',
    description: 'К каждому заказу прилагаем ленту, грузик и открытку в подарок.',
  },
];

export const Features = () => {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-10">
          Чем мы уникальны?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="flex flex-col items-start"
            >
              <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mb-6">
                <feature.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="font-medium text-xl italic mb-3">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
