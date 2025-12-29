import heroImage from '@/assets/hero-flowers.jpg';

export const Hero = () => {
  return (
    <section className="pt-4 pb-4 md:pt-6 md:pb-6">
      <div className="container">
        {/* Hero background with image */}
        <div 
          className="relative rounded-3xl overflow-hidden bg-cover bg-center py-20 md:py-28 lg:py-36"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          {/* Subtle gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center gap-4 px-8">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2 text-white drop-shadow-lg">
                Бутон в тон
              </h1>
              <p className="text-base md:text-lg text-white/90 drop-shadow-md">
                букеты, наполненные чувствами
              </p>
            </div>
            <div className="mt-2">
              <p className="text-xl md:text-2xl lg:text-3xl font-medium text-white leading-tight mb-2 drop-shadow-lg">
                лучший сервис по доставке
              </p>
              <p className="text-base md:text-lg text-white/90 leading-relaxed drop-shadow-md">
                цветов и съедобных букетов в городе Новороссийск
              </p>
            </div>
          </div>
        </div>
        
        {/* Scrolling tagline */}
        <div className="relative overflow-hidden py-4 mt-6 border-y border-border bg-primary rounded-full">
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
