import { Clock, Leaf, Heart, Star } from 'lucide-react';

const features = [
  {
    icon: Clock,
    title: 'Сервис',
    description: 'Обязательно согласовываем букеты перед отправкой. Заботимся о каждом цветочке и поэтому даем гарантию на каждый букет 24 часа.',
  },
  {
    icon: Leaf,
    title: 'Упаковка',
    description: 'Каждый букет упаковывается в защитную пленку или транспортировочную коробку.',
  },
  {
    icon: Heart,
    title: 'Забота',
    description: 'Нам важно, чтобы букет вас радовал дольше, поэтому цветы доставляются в воде.',
  },
  {
    icon: Star,
    title: 'Подарок',
    description: 'К каждому букету мы прикладываем в подарок открытку, инструкцию по уходу, подкормку для цветов и промокод на следующую покупку.',
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
