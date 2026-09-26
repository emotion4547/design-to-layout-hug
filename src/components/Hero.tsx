import heroImageDefault from '@/assets/hero-flowers.webp';
import logoImage from '@/assets/logo.png';
import { CollectionCards } from './CollectionCards';
import { Snowfall } from './Snowfall';
import { Confetti } from './Confetti';
import { Fireworks } from './Fireworks';
import { FallingPetals } from './FallingPetals';
import { useAllSettings } from '@/hooks/useSettings';

export const Hero = () => {
  const { data: settings } = useAllSettings();
  
  const showSnow = settings?.snow_enabled === 'true';
  const showConfetti = settings?.confetti_enabled === 'true';
  const showFireworks = settings?.fireworks_enabled === 'true';
  const showPetals = settings?.petals_enabled === 'true';
  
  const heroImage = settings?.hero_image_url?.trim() ? settings.hero_image_url : heroImageDefault;

  return (
    <section className="pt-4 pb-8 md:pt-6 md:pb-12">
      <div className="container">
        {/* Hero background with image */}
        <div className="relative rounded-3xl overflow-hidden py-20 md:py-28 lg:py-36">
          {/* Обложка — обычная картинка, а не фон в стиле. Фоновое изображение
              браузер находит только после того, как построит стили: это давало
              1360 мс простоя перед началом загрузки. Тег в готовой разметке
              предзагрузчик видит сразу, и простой упал до 280 мс.

              fetchpriority="high" здесь был и оказался вреден: он ставил
              картинку в очереди выше таблицы стилей, а её ожидание и есть
              первая отрисовка. FCP вырос с 2,7 до 4,5 с и не вернулся, когда
              картинку облегчили со 130 до 35 КБ, — значит дело было в порядке
              загрузки, а не в весе. Картинка видна в первом экране, браузер
              и сам поднимет ей приоритет после разбора стилей. */}
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Effects */}
          {showSnow && <Snowfall />}
          {showConfetti && <Confetti />}
          {showFireworks && <Fireworks />}
          {showPetals && <FallingPetals />}
          
          {/* Subtle gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center gap-4 px-8">
            <div className="flex flex-col items-center gap-3">
              <img
                src={logoImage}
                alt="Везу букет"
                width={256}
                height={256}
                // Логотип первого экрана — обычно он и есть LCP-элемент.
                fetchPriority="high"
                className="h-24 w-24 md:h-32 md:w-32 rounded-full object-cover shadow-xl"
              />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2 text-white drop-shadow-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                Везу букет
              </h1>
              <p className="text-lg md:text-xl text-white/90 drop-shadow-md italic leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                с любовью в каждом букете
              </p>
            </div>
            <div className="mt-2">
              <p className="text-xl md:text-2xl lg:text-3xl font-medium text-white leading-tight mb-2 drop-shadow-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                букеты на любой повод
              </p>
              <p className="text-base md:text-lg text-white/90 leading-relaxed drop-shadow-md italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
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
