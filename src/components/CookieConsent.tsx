import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'cookie-consent-accepted';
const COOKIE_DISMISSED_KEY = 'cookie-consent-dismissed';

/**
 * Хранилище бывает недоступно: частный режим, запрет в настройках браузера.
 * Тогда полоска просто покажется ещё раз — сайт из-за этого падать не должен.
 */
const read = (storage: 'local' | 'session', key: string) => {
  try {
    return (storage === 'local' ? localStorage : sessionStorage).getItem(key);
  } catch {
    return null;
  }
};

const write = (storage: 'local' | 'session', key: string) => {
  try {
    (storage === 'local' ? localStorage : sessionStorage).setItem(key, 'true');
  } catch {
    /* нет доступа к хранилищу — не страшно */
  }
};

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    if (read('local', COOKIE_CONSENT_KEY) || read('session', COOKIE_DISMISSED_KEY)) return;
    // Show banner after a short delay for better UX
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    write('local', COOKIE_CONSENT_KEY);
    setIsVisible(false);
  };

  // Крестик — не согласие: запоминаем только до конца визита, чтобы полоска
  // не всплывала заново после каждой перезагрузки страницы.
  const handleClose = () => {
    write('session', COOKIE_DISMISSED_KEY);
    setIsVisible(false);
  };

  // На оформлении заказа полоска на телефоне ложилась прямо на кнопку
  // «Отправить заявку». Там её не показываем — вернётся на других страницах.
  if (!isVisible || pathname.startsWith('/cart')) return null;

  // Узкая полоска, а не окно: на телефоне прежнее окно закрывало нижнюю
  // половину экрана — ровно там, где цена и кнопка «В корзину».
  // Справа оставлено место под круглую кнопку связи (right-24), чтобы
  // полоска её не перекрывала; прижата к самому низу, чтобы не ложиться
  // на кнопки «В корзину» в первом ряду каталога.
  return (
    <aside
      aria-label="Использование файлов cookie"
      className="fixed bottom-3 left-3 right-24 z-50 md:bottom-6 md:left-6 md:right-auto md:max-w-md animate-in slide-in-from-bottom duration-300"
    >
      <div className="flex items-center gap-2 bg-card border border-border rounded-2xl shadow-lg pl-3 pr-1.5 py-1.5">
        <p className="flex-1 text-xs leading-snug text-muted-foreground">
          Используем cookie и Яндекс Метрику.{' '}
          <Link to="/privacy" className="text-primary underline underline-offset-2 whitespace-nowrap">
            Подробнее
          </Link>
        </p>
        <Button size="sm" onClick={handleAccept} className="h-8 px-3 shrink-0" aria-label="Принять cookie">
          Ок
        </Button>
        <button
          onClick={handleClose}
          className="p-1.5 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Закрыть"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};
