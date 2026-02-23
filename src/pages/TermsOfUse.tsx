import { PageLayout } from '@/components/PageLayout';
import { SEO, BreadcrumbSchema } from '@/components/SEO';

const TermsOfUse = () => {
  return (
    <PageLayout>
      <SEO
        title="Пользовательское соглашение"
        description="Условия использования сайта Везу букет. Правила пользования сайтом и оформления заказов."
        url="/terms"
      />
      <BreadcrumbSchema items={[
        { name: 'Главная', url: '/' },
        { name: 'Пользовательское соглашение', url: '/terms' },
      ]} />
      
      <section className="py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
            Пользовательское соглашение
          </h1>
          
          <div className="prose prose-lg max-w-none text-foreground/80">
            <p className="text-muted-foreground mb-6">
              Дата последнего обновления: 29 декабря 2025 г.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">1. Общие положения</h2>
            <p className="mb-4">
              Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между ИП Момонт Регина Валерьевна (далее — «Продавец») и пользователем сайта butonvton.ru (далее — «Покупатель»).
            </p>
            <p className="mb-4">
              Использование сайта означает полное и безоговорочное согласие Покупателя с условиями настоящего Соглашения.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">2. Предмет соглашения</h2>
            <p className="mb-4">
              Продавец осуществляет продажу цветов, букетов, подарков и сопутствующих товаров через интернет-магазин butonvton.ru. Покупатель имеет возможность ознакомиться с ассортиментом, оформить заказ и получить товар.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">3. Оформление заказа</h2>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Заказ считается оформленным после заполнения всех обязательных полей формы заказа</li>
              <li>После оформления заказа Покупатель получает подтверждение по телефону или email</li>
              <li>Продавец оставляет за собой право связаться с Покупателем для уточнения деталей заказа</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">4. Цены и оплата</h2>
            <p className="mb-4">
              Все цены на сайте указаны в российских рублях и включают НДС (при применимости). Продавец оставляет за собой право изменять цены без предварительного уведомления.
            </p>
            <p className="mb-4">Способы оплаты:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Наличными при получении</li>
              <li>Банковской картой при получении</li>
              <li>Онлайн-оплата на сайте</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">5. Доставка</h2>
            <p className="mb-4">
              Условия и стоимость доставки указаны на странице «Доставка». Продавец не несёт ответственности за задержки доставки, вызванные обстоятельствами непреодолимой силы.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">6. Качество товара</h2>
            <p className="mb-4">
              Продавец гарантирует свежесть цветов в момент доставки. Срок жизни букета зависит от условий содержания и ухода.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">7. Интеллектуальная собственность</h2>
            <p className="mb-4">
              Все материалы сайта (тексты, изображения, логотипы) являются собственностью Продавца и защищены законодательством об авторском праве.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">8. Контактная информация</h2>
            <p className="mb-4">
              ИП Момонт Регина Валерьевна<br />
              ИНН: 490911638830<br />
              Телефон: 8 964 456 00 66<br />
              Email: info@butonvton.ru
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default TermsOfUse;
