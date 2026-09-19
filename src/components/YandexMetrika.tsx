import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { YANDEX_METRIKA_ID, reachGoal, GOALS } from "@/lib/metrika";

/** Сколько ждём заголовок новой страницы, прежде чем отправить как есть. */
const TITLE_WAIT_MS = 2000;

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void;
  }
}

/**
 * Метрика засчитывает просмотр только при первой загрузке страницы — переходы
 * react-router она не видит. Здесь мы отправляем 'hit' на каждую смену URL.
 *
 * Отправку задерживаем до момента, когда обновится <title>: страницы грузятся
 * через React.lazy, и сразу после смены маршрута заголовок ещё старый.
 */
export const YandexMetrika = () => {
  const { pathname, search } = useLocation();
  // init в index.html уже засчитал первый просмотр — не дублируем его.
  const isFirstHit = useRef(true);
  const prevUrl = useRef<string>();

  useEffect(() => {
    const url = window.location.origin + pathname + search;

    if (isFirstHit.current) {
      isFirstHit.current = false;
      prevUrl.current = url;
      return;
    }

    const referer = prevUrl.current;
    const titleBefore = document.title;
    prevUrl.current = url;

    let done = false;
    const send = () => {
      if (done) return;
      done = true;
      observer.disconnect();
      clearTimeout(timer);
      window.ym?.(YANDEX_METRIKA_ID, "hit", url, { referer, title: document.title });
    };

    const observer = new MutationObserver(() => {
      if (document.title !== titleBefore) send();
    });
    const titleEl = document.querySelector("title");
    if (titleEl) {
      observer.observe(titleEl, { childList: true, characterData: true, subtree: true });
    }

    // Заголовок может и не поменяться — тогда отправляем по таймауту.
    const timer = setTimeout(send, TITLE_WAIT_MS);

    // Уходим с маршрута раньше, чем успели отправить — досылаем, чтобы просмотр не потерялся.
    return () => send();
  }, [pathname, search]);

  // Клик по телефону — цель phone_click. Слушаем страницу одним обработчиком,
  // а не вешаем его на каждую ссылку: номер выводится в подвале, в плавающей
  // кнопке, на «Доставке» и в «Контактах», и при добавлении пятого места про
  // цель бы просто забыли. Перехват на погружении — чтобы сработало даже там,
  // где обработчик ссылки останавливает всплытие.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest?.('a[href^="tel:"]');
      if (link) reachGoal(GOALS.phoneClick, { href: link.getAttribute('href') });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
};
