import { Star } from 'lucide-react';

const bonusPoints = [
  'Никаких баллов — бонусная система работает в процентах',
  'Оплатить можно 15% от суммы заказа в любой день, за 3х — 30%',
  'Всегда с вами — бонусы привязаны к номеру телефона',
  'Приятный подарок — приветственные бонусы уже ждут вас',
  'Система имеет несколько уровней — чем больше покупок, тем больше бонусов',
  'Бонусы не сгорают 6 месяцев с момента последнего пополнения',
];

export const BonusSystem = () => {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Бонусная система
            </h2>
            <p className="text-muted-foreground">
              Порадуй своих близких и получай бонусы за каждую покупку!
            </p>
          </div>

          <ul className="space-y-4">
            {bonusPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-3">
                <Star className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground/90 leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
