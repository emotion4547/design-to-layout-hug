import { PageLayout } from '@/components/PageLayout';
import { Phone, MapPin, Mail, Clock, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

import mapScreenshot from '@/assets/map-screenshot.jpg';

const contactInfo = [
  {
    icon: Phone,
    label: 'Телефон',
    value: '+7 995 918 49 56',
    href: 'tel:+79959184956',
  },
  {
    icon: MapPin,
    label: 'Адрес',
    value: 'г. Сергиев Посад\nул. Инженерная д.8\nТЦ "Престиж", 2ой этаж',
    href: 'https://yandex.ru/maps/-/CHQoiDYT',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'ftftsp88@gmail.com',
    href: 'mailto:ftftsp88@gmail.com',
  },
  {
    icon: Clock,
    label: 'Режим работы',
    value: 'Ежедневно с 9:15 до 21:00',
    href: null,
  },
];

const legalInfo = {
  inn: '504227643663',
  ogrn: '322508100047543',
  account: '40802810900003026016',
  bank: 'АО "Тинькофф Банк"',
  bik: '044525974',
};

const VKIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.12-5.339-3.202-2.17-3.04-2.763-5.32-2.763-5.785 0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.847 2.492 2.272 4.678 2.865 4.678.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.747c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.27-1.422 2.18-3.609 2.18-3.609.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.356 4.031-2.356 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const ContactsPage = () => {
  return (
    <PageLayout>
      {/* Page Header */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Контакты
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Flowers and Toys — лучший сервис в городе
          </p>
        </div>
      </section>

      {/* Map Section */}
      <section className="pb-12">
        <div className="container">
          <div className="aspect-[16/9] md:aspect-[21/9] rounded-lg overflow-hidden">
            <img 
              src={mapScreenshot} 
              alt="Карта расположения магазина МУРАШКИ"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Contact Info Grid */}
      <section className="pb-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((item) => (
              <div 
                key={item.label}
                className="p-6 bg-secondary/50 rounded-lg"
              >
                <item.icon className="h-6 w-6 mb-3 text-foreground/70" />
                <p className="text-sm text-muted-foreground mb-1">{item.label}:</p>
                {item.href ? (
                  <a 
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="font-medium text-foreground hover:text-foreground/80 transition-colors whitespace-pre-line"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="font-medium whitespace-pre-line">{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="py-12 bg-secondary/30">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
            <div>
              <h3 className="text-xl font-bold mb-2">Мы в социальных сетях</h3>
              <p className="text-muted-foreground">Подписывайтесь и следите за новинками</p>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href="https://vk.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors"
              >
                <VKIcon />
              </a>
              <a 
                href="https://t.me" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors"
              >
                <TelegramIcon />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Отзывы</h2>
            <p className="text-muted-foreground mb-8">
              Отзыв на Яндекс Картах 1 место!<br />
              Вы можете посмотреть или оставить свой отзыв на Flowers & Toys
            </p>
            
            <div className="flex items-center justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-2 text-lg font-bold">4.9</span>
              <span className="text-muted-foreground ml-1">от более чем 100 отзывов</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="https://yandex.ru/maps/-/CHQoiDYT" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Посмотреть отзывы
                </Button>
              </a>
              <a 
                href="https://yandex.ru/maps/-/CHQoiDYT" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="gap-2">
                  Оставить отзыв
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Info */}
      <section className="py-12 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-semibold mb-4">Реквизиты</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">ИНН:</p>
                <p className="font-medium">{legalInfo.inn}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ОГРН:</p>
                <p className="font-medium">{legalInfo.ogrn}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Р/С:</p>
                <p className="font-medium">{legalInfo.account}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Банк:</p>
                <p className="font-medium">{legalInfo.bank}</p>
              </div>
              <div>
                <p className="text-muted-foreground">БИК банка:</p>
                <p className="font-medium">{legalInfo.bik}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default ContactsPage;
