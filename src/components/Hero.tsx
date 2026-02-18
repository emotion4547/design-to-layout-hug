import heroImageDefault from '@/assets/hero-flowers.jpg';
import logoImage from '@/assets/logo.png';
import { CollectionCards } from './CollectionCards';
import { Snowfall } from './Snowfall';
import { Confetti } from './Confetti';
import { Fireworks } from './Fireworks';
import { useSetting } from '@/hooks/useSettings';

export const Hero = () => {
  const { data: snowEnabled } = useSetting('snow_enabled');
  const { data: confettiEnabled } = useSetting('confetti_enabled');
  const { data: fireworksEnabled } = useSetting('fireworks_enabled');
  const { data: heroImageUrl } = useSetting('hero_image_url');
  
  const showSnow = snowEnabled === 'true';
  const showConfetti = confettiEnabled === 'true';
  const showFireworks = fireworksEnabled === 'true';
  
  // Use custom hero image if set, otherwise use default
  const heroImage = heroImageUrl && heroImageUrl.trim() !== '' ? heroImageUrl : heroImageDefault;

  return (
    <section className="pt-4 pb-8 md:pt-6 md:pb-12">
      <div className="container">
        {/* Hero background with image */}
        <div 
          className="relative rounded-3xl overflow-hidden bg-cover bg-center py-20 md:py-28 lg:py-36"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          {/* Effects */}
          {showSnow && <Snowfall />}
          {showConfetti && <Confetti />}
          {showFireworks && <Fireworks />}
          
          {/* Subtle gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center gap-4 px-8">
            <div className="flex flex-col items-center gap-3">
              <img src={logoImage} alt="Везу букет" className="h-24 w-24 md:h-32 md:w-32 rounded-full object-cover shadow-xl" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2 text-white drop-shadow-lg">
                Везу букет
              </h1>
              <p className="text-base md:text-lg text-white/90 drop-shadow-md">
                свежие цветы с доставкой
              </p>
            </div>
            <div className="mt-2">
              <p className="text-xl md:text-2xl lg:text-3xl font-medium text-white leading-tight mb-2 drop-shadow-lg">
                букеты на любой повод
              </p>
              <p className="text-base md:text-lg text-white/90 leading-relaxed drop-shadow-md">
                с любовью в каждом лепестке
              </p>
            </div>
          </div>
        </div>
        
        {/* Collection Cards */}
        <CollectionCards />
      </div>
    </section>
  );
};
