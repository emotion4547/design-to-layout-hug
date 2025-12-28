export const Hero = () => {
  return (
    <section className="pt-8 pb-4 md:pt-12 md:pb-6 bg-background">
      <div className="container">
        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left column - Logo and tagline */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3">
              Бутон в тон
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              букеты, наполненные чувствами
            </p>
          </div>
          
          {/* Right column - Offer text */}
          <div className="text-center md:text-left">
            <p className="text-xl md:text-2xl lg:text-3xl font-medium text-foreground leading-tight mb-2">
              лучший сервис по доставке
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              цветов и съедобных букетов в городе Новороссийск
            </p>
          </div>
        </div>
        
        {/* Scrolling tagline */}
        <div className="relative overflow-hidden py-4 mt-6 border-y border-border bg-primary">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="mx-4 text-sm text-primary-foreground font-medium flex items-center gap-2">
                <span>🌸</span> готовый букет с доставкой за 30 минут <span>🌸</span> онлайн витрина
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
