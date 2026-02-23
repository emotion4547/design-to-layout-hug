import { PageLayout } from '@/components/PageLayout';
import { SEO, BreadcrumbSchema } from '@/components/SEO';

const ReturnPolicy = () => {
  return (
    <PageLayout>
      <SEO
        title="Возврат товара"
        description="Условия возврата и обмена товаров в магазине Везу букет. Гарантия качества на все букеты."
        url="/return"
      />
      <BreadcrumbSchema items={[
        { name: 'Главная', url: '/' },
        { name: 'Возврат товара', url: '/return' },
      ]} />
      
      <section className="py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
            Возврат товара
          </h1>
          
          <div className="prose prose-lg max-w-none text-foreground/80">
            <p className="text-muted-foreground mb-6">
              Дата последнего обновления: 29 декабря 2025 г.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Гарантия свежести</h2>
            <p className="mb-4">
              Мы гарантируем свежесть всех цветов и букетов в момент доставки. Если вы получили букет ненадлежащего качества, мы заменим его бесплатно или вернём деньги.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Условия возврата цветов и букетов</h2>
            <p className="mb-4">
              В соответствии с Постановлением Правительства РФ №2463 от 31.12.2020, срезанные цветы и цветочные композиции относятся к товарам надлежащего качества, которые не подлежат обмену и возврату.
            </p>
            <p className="mb-4">Возврат или замена букета возможны в следующих случаях:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Букет доставлен с видимыми дефектами (увядшие цветы, повреждения)</li>
              <li>Состав букета не соответствует заказу</li>
              <li>Букет не был доставлен в указанное время по вине Продавца</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Как оформить возврат</h2>
            <ol className="list-decimal pl-6 mb-4 space-y-2">
              <li>Сфотографируйте полученный букет</li>
              <li>Свяжитесь с нами по телефону 8 964 456 00 66 или напишите на info@butonvton.ru в течение 2 часов после получения</li>
              <li>Опишите проблему и приложите фотографии</li>
              <li>Мы рассмотрим обращение в течение 24 часов</li>
            </ol>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Возврат сопутствующих товаров</h2>
            <p className="mb-4">
              Сопутствующие товары (вазы, игрушки, открытки) надлежащего качества могут быть возвращены в течение 14 дней при сохранении товарного вида и упаковки.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Возврат денежных средств</h2>
            <p className="mb-4">
              При одобрении возврата денежные средства возвращаются тем же способом, которым была произведена оплата:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>При оплате картой — на карту в течение 3-10 рабочих дней</li>
              <li>При оплате наличными — наличными или переводом по договорённости</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Отмена заказа</h2>
            <p className="mb-4">
              Вы можете отменить заказ бесплатно до начала его сборки. Если букет уже собран, может быть удержана стоимость материалов.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Контакты для обращений</h2>
            <p className="mb-4">
              Телефон: 8 964 456 00 66<br />
              Email: info@butonvton.ru<br />
              Время работы: ежедневно с 9:00 до 21:00
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default ReturnPolicy;
