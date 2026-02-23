const YandexReviews = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-foreground">
          Отзывы наших клиентов
        </h2>
        <div className="w-full flex justify-center">
          <iframe
            style={{
              width: '100%',
              maxWidth: 900,
              height: 600,
              border: 'none',
              borderRadius: 16,
            }}
            src="https://yandex.ru/maps-reviews-widget/44543137069?comments"
            title="Отзывы на Яндекс.Картах"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
};

export default YandexReviews;
