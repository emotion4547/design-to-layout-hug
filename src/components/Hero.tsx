import heroLogo from '@/assets/hero-logo.png';

export const Hero = () => {
  return (
    <section className="pt-8 pb-4 md:pt-12 md:pb-6 bg-background">
      <div className="container">
        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left column - Logo and tagline */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img 
              src={heroLogo} 
              alt="Бутон в тон - букеты цветов" 
              className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain"
            />
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2">
                Бутон в тон
              </h1>
              <p className="text-base md:text-lg text-muted-foreground">
                букеты, наполненные чувствами
              </p>
            </div>
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
