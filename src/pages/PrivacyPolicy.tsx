import { PageLayout } from '@/components/PageLayout';
import { SEO, BreadcrumbSchema } from '@/components/SEO';

const PrivacyPolicy = () => {
  return (
    <PageLayout>
      <SEO
        title="Политика обработки персональных данных"
        description="Политика обработки персональных данных магазина Бутон в тон. Информация о сборе, хранении и использовании ваших данных."
        url="/privacy"
      />
      <BreadcrumbSchema items={[
        { name: 'Главная', url: '/' },
        { name: 'Политика конфиденциальности', url: '/privacy' },
      ]} />
      
      <section className="py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
            Политика обработки персональных данных
          </h1>
          
          <div className="prose prose-lg max-w-none text-foreground/80">
            <p className="text-muted-foreground mb-6">
              Дата последнего обновления: 29 декабря 2025 г.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">1. Общие положения</h2>
            <p className="mb-4">
              Настоящая Политика конфиденциальности определяет порядок обработки и защиты ИП Момонт Регина Валерьевна (далее — «Оператор») персональных данных пользователей сайта butonvton.ru (далее — «Сайт»).
            </p>
            <p className="mb-4">
              Использование Сайта означает безоговорочное согласие пользователя с настоящей Политикой и указанными в ней условиями обработки его персональных данных.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">2. Персональные данные, которые мы собираем</h2>
            <p className="mb-4">В процессе использования Сайта мы можем собирать следующие персональные данные:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Имя и фамилия</li>
              <li>Номер телефона</li>
              <li>Адрес электронной почты</li>
              <li>Адрес доставки</li>
              <li>Данные о заказах</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">3. Цели сбора персональных данных</h2>
            <p className="mb-4">Персональные данные собираются и используются для:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Обработки и выполнения заказов</li>
              <li>Связи с клиентами по вопросам заказов</li>
              <li>Доставки товаров по указанному адресу</li>
              <li>Информирования об акциях и специальных предложениях (с согласия пользователя)</li>
              <li>Улучшения качества обслуживания</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">4. Защита персональных данных</h2>
            <p className="mb-4">
              Оператор принимает необходимые организационные и технические меры для защиты персональных данных от неправомерного доступа, уничтожения, изменения, блокирования, копирования, распространения, а также от иных неправомерных действий третьих лиц.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">5. Передача данных третьим лицам</h2>
            <p className="mb-4">
              Оператор не передаёт персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством РФ, а также для выполнения заказа (курьерские службы).
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">6. Права пользователя</h2>
            <p className="mb-4">Пользователь имеет право:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Получить информацию о своих персональных данных</li>
              <li>Требовать уточнения, блокирования или уничтожения своих данных</li>
              <li>Отозвать согласие на обработку персональных данных</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">7. Контактная информация</h2>
            <p className="mb-4">
              По всем вопросам, связанным с обработкой персональных данных, вы можете обратиться по телефону: 8 964 456 00 66 или по электронной почте: info@butonvton.ru
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default PrivacyPolicy;
