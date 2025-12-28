import { Package, Gift, Clock, Heart } from 'lucide-react';

const features = [
  {
    icon: Package,
    title: 'Сервис',
    description: 'Обязательно согласовываем букет, привозим его в коробке, учитываем пожелания и гарантия на букет 24 часа.',
  },
  {
    icon: Gift,
    title: 'Упаковка',
    description: 'Каждый букет мы упаковываем в красивую транспортировочную коробку.',
  },
  {
    icon: Clock,
    title: 'Забота',
    description: 'Нам важно, чтобы букет вас порадовал, поэтому цветы отпаиваю, питаю по технологии и цветочек подольше стоял.',
  },
  {
    icon: Heart,
    title: 'Подарок',
    description: 'К каждому букету мы прикладываем открытку, инструкцию по уходу, подкормку.',
  },
];

export const Features = () => {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Чем мы<br />уникальны?
          </h2>
          <p className="text-muted-foreground max-w-2xl text-base md:text-lg leading-relaxed">
            Наша мастерская в г. Сергиев Посад на улице Инженерная 8 предоставляет 
            лучший сервис по доставке свежих цветов, съедобных букетов и подарков!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="group p-6 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
            >
              <feature.icon className="h-8 w-8 mb-4 text-foreground/70 group-hover:text-foreground transition-colors" />
              <h3 className="font-semibold text-lg mb-3">{feature.title}</h3>
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
