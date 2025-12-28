export const Hero = () => {
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
          МУРАШКИ
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-6">
          букеты, наполненные чувствами
        </p>
        <p className="text-base md:text-lg text-foreground/80 max-w-2xl mx-auto mb-8">
          лучший сервис по доставке цветов и съедобных букетов
          <br />
          в городе Сергиев Посад
        </p>
        
        {/* Scrolling tagline */}
        <div className="relative overflow-hidden py-4 border-y border-border">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="mx-8 text-sm text-muted-foreground">
                онлайн витрина • готовый букет с доставкой за 30 минут • свежие цветы каждый день
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
