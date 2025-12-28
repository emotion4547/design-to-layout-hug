import { Phone, MapPin } from 'lucide-react';

const footerLinks = {
  main: [
    { name: 'Главная', href: '/' },
    { name: 'Каталог', href: '#catalog' },
    { name: 'Акции', href: '#promotions' },
    { name: 'Новости', href: '#news' },
  ],
  info: [
    { name: 'Доставка', href: '#delivery' },
    { name: 'О нас', href: '#about' },
    { name: 'Контакты', href: '#contacts' },
  ],
  legal: [
    { name: 'Политика обработки персональных данных', href: '/privacy' },
    { name: 'Возврат товара', href: '/return' },
  ],
};

export const Footer = () => {
  return (
    <footer id="contacts" className="py-12 bg-background border-t border-border">
      <div className="container">
        {/* Brand Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">МУРАШКИ</h2>
          <p className="text-muted-foreground">букеты, наполненные чувствами</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Main Links */}
          <div>
            <h3 className="font-semibold mb-4">Навигация</h3>
            <ul className="space-y-2">
              {footerLinks.main.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h3 className="font-semibold mb-4">Информация</h3>
            <ul className="space-y-2">
              {footerLinks.info.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Мы всегда на связи!</h3>
            <div className="space-y-3">
              <a 
                href="tel:+79959184956" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-4 w-4" />
                +7 995 918 49 56
              </a>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  г. Сергиев Посад<br />
                  ул. Инженерная д.8<br />
                  ТЦ "Престиж" 2ой этаж
                </span>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Документы</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} МУРАШКИ. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
};
