import heroFlowers from '@/assets/hero-flowers.jpg';

const bonusPoints = [
  'никаких баллов - бонусная система 1 бонус - 1 рубль',
  'оплатить можно 15% от суммы заказа в любой день, за исключением праздничных',
  'всегда с вами - бонусы привязаны к номеру телефона',
  'приятный подарок - приветственные бонусы при регистрации',
  'система имеет несколько уровней начисления',
  'бонусы не сгорают 6 месяцев с момента последнего начисления',
];

export const BonusSystem = () => {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Left column - Image with overlay */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
            <img 
              src={heroFlowers} 
              alt="Цветочный магазин" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                Бонусная система
              </h2>
              <p className="text-white/90 text-sm md:text-base leading-relaxed">
                Порадуй своих близких, а затем порадуй себя
              </p>
            </div>
          </div>

          {/* Right column - Bullet list */}
          <div className="py-4">
            <ul className="space-y-5">
              {bonusPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3 text-base md:text-lg">
                  <span className="text-foreground mt-1.5 text-sm">•</span>
                  <span className="text-foreground leading-relaxed">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
