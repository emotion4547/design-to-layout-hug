import { Phone, MapPin } from 'lucide-react';

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

const footerLinks = {
  main: [
    { name: 'Главная', href: '/' },
    { name: 'Каталог', href: '#catalog' },
  ],
  info: [
    { name: 'Акции', href: '#promotions' },
    { name: 'Новости', href: '#news' },
    { name: 'Доставка', href: '#delivery' },
    { name: 'Контакты', href: '#contacts' },
  ],
  legal: [
    { name: 'Мы всегда на связи!', href: '#' },
    { name: 'О нас', href: '#about' },
  ],
};

export const Footer = () => {
  return (
    <footer id="contacts" className="bg-[hsl(195,35%,32%)] text-white">
      <div className="container py-12">
        {/* Brand Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="text-white/90">
              <svg viewBox="0 0 40 40" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 35V20M20 20C20 20 12 15 12 10C12 6 15 4 20 8C25 4 28 6 28 10C28 15 20 20 20 20Z" />
                <path d="M15 25C10 23 8 18 10 14M25 25C30 23 32 18 30 14" />
                <path d="M20 8C20 8 18 4 14 4M20 8C20 8 22 4 26 4" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-wide">МУРАШКИ</h2>
              <p className="text-sm text-white/70">букеты, наполненные чувствами</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Navigation Links */}
          <div>
            <ul className="space-y-2">
              {footerLinks.main.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ul className="space-y-2">
              {footerLinks.info.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <a 
              href="tel:+79959184956" 
              className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
            >
              <Phone className="h-4 w-4" />
              +7 995 918 49 56
            </a>
            <div className="flex items-start gap-2 text-sm text-white/80">
              <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                г. Сергиев Посад<br />
                ул. Инженерная д.8<br />
                ТЦ "Престиж" 2ой этаж
              </span>
            </div>
          </div>
        </div>

        {/* Social & Legal */}
        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a 
              href="https://vk.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 text-white/90 hover:bg-white/20 hover:text-white transition-colors"
            >
              <VKIcon />
            </a>
            <a 
              href="https://t.me" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 text-white/90 hover:bg-white/20 hover:text-white transition-colors"
            >
              <TelegramIcon />
            </a>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/60">
            <a href="/privacy" className="hover:text-white/90 transition-colors">
              Политика обработки персональных данных
            </a>
            <a href="/return" className="hover:text-white/90 transition-colors">
              Возврат товара
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
