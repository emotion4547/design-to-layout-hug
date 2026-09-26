import { useRef, useState, useEffect } from 'react';

/**
 * Виджет отзывов Яндекса. Раньше сюда был вписан идентификатор 44543137069 —
 * чужой срез: он отдавал «113 отзывов, 7 оценок» и пустые серые звёзды, хотя
 * у карточки 134 отзыва, 152 оценки и рейтинг 5,0. Идентификатор должен
 * совпадать с номером организации на Яндекс Картах.
 */
const YandexReviews = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 text-foreground">
          Отзывы наших клиентов
        </h2>
        <div ref={ref} className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-lg border border-border" style={{ minHeight: 600 }}>
          {visible && (
            <iframe
              className="w-full"
              style={{ height: 600, border: 'none' }}
              src="https://yandex.ru/maps-reviews-widget/128104040065?comments"
              title="Отзывы на Яндекс.Картах"
              allowFullScreen
              loading="lazy"
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default YandexReviews;
