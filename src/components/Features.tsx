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
    <section className="py-16 md:py-20 bg-background">
      <div className="container">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-light mb-6">
            Чем мы<br />уникальны?
          </h2>
          <p className="text-muted-foreground max-w-3xl text-base md:text-lg leading-relaxed">
            Наша мастерская в г. Новороссийск предоставляет качественный и современный сервис по доставке свежих цветов, свадебной флористике, съедобных букетов и подарков!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="flex flex-col items-start"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium text-xl mb-3">{feature.title}</h3>
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
