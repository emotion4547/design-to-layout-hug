import { useEffect, useState } from 'react';

/**
 * Падающие лепестки на обложке.
 *
 * Раньше на каждом лепестке висели две анимации сразу — покачивание и
 * вращение, — и обе меняли transform. Конфликтующие анимации одного свойства
 * браузер не отдаёт видеокарте и считает их в основном потоке: замер находил
 * 49 таких элементов. Поэтому теперь каждый уровень двигает ровно одно:
 * внешний падает, средний качается, внутренний вращается.
 */

interface Petal {
  id: number;
  left: number;
  size: number;
  fallDuration: number;
  swayDuration: number;
  spinDuration: number;
  delay: number;
  opacity: number;
  color: string;
}

/** На узком экране лепестков меньше: пользы от них столько же, а рисовать дешевле. */
const countFor = (width: number) => (width < 640 ? 10 : 18);

export const FallingPetals = () => {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    // Тем, кто просил систему не анимировать, ничего не показываем.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const count = countFor(window.innerWidth);
    const items: Petal[] = Array.from({ length: count }, (_, id) => ({
      id,
      left: Math.random() * 100,
      size: 10 + Math.random() * 14,
      fallDuration: 5 + Math.random() * 4,
      swayDuration: 3 + Math.random() * 4,
      spinDuration: 7 + Math.random() * 6,
      delay: -(Math.random() * 8),
      opacity: 0.4 + Math.random() * 0.4,
      color: `hsl(350, ${50 + Math.random() * 20}%, ${70 + Math.random() * 15}%)`,
    }));

    setPetals(items);
  }, []);

  if (petals.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute top-0"
          style={{
            left: `${petal.left}%`,
            opacity: petal.opacity,
            willChange: 'transform',
            animation: `petalFall ${petal.fallDuration}s linear ${petal.delay}s infinite`,
          }}
        >
          <div
            style={{
              willChange: 'transform',
              animation: `petalSway ${petal.swayDuration}s ease-in-out ${petal.delay}s infinite`,
            }}
          >
            <svg
              width={petal.size}
              height={petal.size}
              viewBox="0 0 24 24"
              aria-hidden="true"
              style={{
                display: 'block',
                willChange: 'transform',
                animation: `petalSpin ${petal.spinDuration}s linear ${petal.delay}s infinite`,
              }}
            >
              <ellipse cx="12" cy="10" rx="7" ry="10" fill={petal.color} />
            </svg>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes petalFall {
          0%   { transform: translate3d(0, -20px, 0); }
          100% { transform: translate3d(0, calc(100vh + 30px), 0); }
        }
        @keyframes petalSway {
          0%, 100% { transform: translate3d(0, 0, 0); }
          25%      { transform: translate3d(30px, 0, 0); }
          75%      { transform: translate3d(-30px, 0, 0); }
        }
        @keyframes petalSpin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="petalFall"], [style*="petalSway"], [style*="petalSpin"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
