const bonusPoints = [
  { prefix: 'никаких баллов', text: '— бонусная система работает в процентах' },
  { prefix: 'оплатить можно', text: '15% от суммы заказа в любой день, за 3х — 30%' },
  { prefix: 'всегда с вами', text: '— бонусы привязаны к номеру телефона' },
  { prefix: 'приятный подарок', text: '— приветственные бонусы уже ждут вас' },
  { prefix: 'система имеет несколько уровней', text: '— чем больше покупок, тем больше бонусов' },
  { prefix: 'бонусы не сгорают', text: '6 месяцев с момента последнего пополнения' },
];

export const BonusSystem = () => {
  return (
    <section className="py-16 md:py-20 bg-secondary/30">
      <div className="container">
        <div className="max-w-4xl">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Бонусная система
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Порадуй своих близких и получай бонусы за каждую покупку!
            </p>
          </div>

          <ul className="space-y-4">
            {bonusPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-3 text-base">
                <span className="text-foreground/40 mt-1">•</span>
                <span className="text-foreground/90 leading-relaxed">
                  <strong className="font-semibold">{point.prefix}</strong> {point.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
