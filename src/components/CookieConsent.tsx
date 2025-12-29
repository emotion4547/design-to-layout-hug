import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'cookie-consent-accepted';

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasConsent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="container">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-4 md:p-6 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 md:hidden p-1 text-muted-foreground hover:text-foreground"
              aria-label="Закрыть"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="flex-1 text-sm text-muted-foreground">
              <p className="mb-2">
                Мы используем файлы cookie для улучшения работы сайта и анализа трафика. 
                При заполнении форм обратной связи ваши данные (имя, телефон, email) 
                обрабатываются для выполнения заказов.
              </p>
              <p>
                На сайте используется Яндекс.Метрика и Яндекс.Директ для аналитики и рекламы.{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  Подробнее в Политике конфиденциальности
                </Link>
              </p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="hidden md:inline-flex"
              >
                Закрыть
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
              >
                Принять
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
