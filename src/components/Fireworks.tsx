import { useEffect, useState, useCallback } from 'react';

interface Spark {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
  life: number;
}

interface Firework {
  id: number;
  x: number;
  y: number;
  sparks: Spark[];
  startTime: number;
}

const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#00d2d3', '#ff9f43', '#fff'];

export const Fireworks = () => {
  const [fireworks, setFireworks] = useState<Firework[]>([]);

  const createFirework = useCallback(() => {
    const x = 20 + Math.random() * 60; // 20-80% of width
    const y = 20 + Math.random() * 40; // 20-60% of height
    const sparkCount = 20 + Math.floor(Math.random() * 15);
    const baseColor = colors[Math.floor(Math.random() * colors.length)];

    const sparks: Spark[] = [];
    for (let i = 0; i < sparkCount; i++) {
      sparks.push({
        id: i,
        x: 0,
        y: 0,
        color: baseColor,
        size: 2 + Math.random() * 3,
        angle: (i / sparkCount) * 360,
        speed: 2 + Math.random() * 3,
        life: 1,
      });
    }

    const newFirework: Firework = {
      id: Date.now() + Math.random(),
      x,
      y,
      sparks,
      startTime: Date.now(),
    };

    setFireworks(prev => [...prev.slice(-5), newFirework]);
  }, []);

  useEffect(() => {
    // Initial firework
    createFirework();

    // Create new fireworks periodically
    const interval = setInterval(() => {
      createFirework();
    }, 2000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [createFirework]);

  // Remove old fireworks
  useEffect(() => {
    const cleanup = setInterval(() => {
      setFireworks(prev => prev.filter(fw => Date.now() - fw.startTime < 2000));
    }, 500);

    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
      {fireworks.map((firework) => (
        <div
          key={firework.id}
          className="absolute"
          style={{
            left: `${firework.x}%`,
            top: `${firework.y}%`,
          }}
        >
          {firework.sparks.map((spark) => (
            <div
              key={spark.id}
              className="absolute rounded-full"
              style={{
                width: `${spark.size}px`,
                height: `${spark.size}px`,
                backgroundColor: spark.color,
                boxShadow: `0 0 ${spark.size * 2}px ${spark.color}`,
                animation: `fireworkExplode 1.5s ease-out forwards`,
                transform: `rotate(${spark.angle}deg)`,
                '--angle': `${spark.angle}deg`,
                '--speed': spark.speed,
              } as React.CSSProperties}
            />
          ))}
        </div>
      ))}
      <style>{`
        @keyframes fireworkExplode {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(
              calc(cos(var(--angle)) * var(--speed) * 30px),
              calc(sin(var(--angle)) * var(--speed) * 30px + 20px)
            ) scale(0.3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
