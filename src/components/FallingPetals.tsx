import { useEffect, useState } from 'react';

interface Petal {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  swayDuration: number;
  rotation: number;
}

export const FallingPetals = () => {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const items: Petal[] = [];
    const count = 25;

    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        left: Math.random() * 100,
        size: 10 + Math.random() * 14,
        duration: 6 + Math.random() * 5,
        delay: Math.random() * 6,
        opacity: 0.4 + Math.random() * 0.4,
        swayDuration: 3 + Math.random() * 4,
        rotation: Math.random() * 360,
      });
    }

    setPetals(items);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute"
          style={{
            left: `${petal.left}%`,
            opacity: petal.opacity,
            animation: `petalFall ${petal.duration}s ease-in-out ${petal.delay}s infinite`,
          }}
        >
          <svg
            width={petal.size}
            height={petal.size}
            viewBox="0 0 24 24"
            style={{
              animation: `petalSway ${petal.swayDuration}s ease-in-out ${petal.delay}s infinite, petalSpin ${petal.duration * 1.5}s linear ${petal.delay}s infinite`,
              transform: `rotate(${petal.rotation}deg)`,
            }}
          >
            <ellipse
              cx="12"
              cy="10"
              rx="7"
              ry="10"
              fill={`hsl(350, ${50 + Math.random() * 20}%, ${70 + Math.random() * 15}%)`}
            />
          </svg>
        </div>
      ))}
      <style>{`
        @keyframes petalFall {
          0% {
            transform: translateY(-10px);
            opacity: 0.8;
          }
          2% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh + 30px));
            opacity: 0;
          }
        }
        @keyframes petalSway {
          0%, 100% {
            transform: translateX(0) rotate(0deg);
          }
          25% {
            transform: translateX(30px) rotate(15deg);
          }
          75% {
            transform: translateX(-30px) rotate(-15deg);
          }
        }
        @keyframes petalSpin {
          0% {
            transform: rotateY(0deg) rotateZ(0deg);
          }
          100% {
            transform: rotateY(360deg) rotateZ(180deg);
          }
        }
      `}</style>
    </div>
  );
};
