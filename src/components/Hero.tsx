export const Hero = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container text-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
          Бутон в тон
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8">
          букеты, наполненные чувствами
        </p>
        <div className="max-w-3xl mx-auto">
          <p className="text-base md:text-lg text-foreground/80 leading-relaxed mb-4">
            лучший сервис по доставке цветов и съедобных букетов
          </p>
          <p className="text-base md:text-lg text-foreground/80">
            в городе Новороссийск
          </p>
        </div>
        
        {/* Scrolling tagline */}
        <div className="relative overflow-hidden py-6 mt-10 border-y border-border">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="mx-6 text-sm text-muted-foreground font-medium">
                онлайн витрина готовый букет с доставкой за 30 минут
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
