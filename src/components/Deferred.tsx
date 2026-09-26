import { useEffect, useState, type ReactNode } from 'react';

/**
 * Откладывает содержимое до момента, когда браузер освободится.
 *
 * Всплывающие сообщения, баннер согласия и счётчик не нужны в первом кадре,
 * но React рисует их вместе со всем остальным и удлиняет первую отрисовку.
 * Здесь они монтируются после того, как главное уже показано.
 */
export const Deferred = ({ children }: { children: ReactNode }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const idle = window.requestIdleCallback;
    if (typeof idle === 'function') {
      const id = idle(() => setReady(true), { timeout: 2000 });
      return () => window.cancelIdleCallback?.(id);
    }
    // Safari до 17 не знает requestIdleCallback — там просто следующий тик.
    const t = setTimeout(() => setReady(true), 200);
    return () => clearTimeout(t);
  }, []);

  return ready ? <>{children}</> : null;
};
