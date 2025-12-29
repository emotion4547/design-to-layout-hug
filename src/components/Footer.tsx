import { Link } from 'react-router-dom';
import { useSetting } from '@/hooks/useSettings';
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

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const MessengerIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
  </svg>
);

const footerLinks = {
  left: [
    { name: 'Главная', href: '/' },
    { name: 'Каталог', href: '/' },
    { name: 'Доставка', href: '/delivery' },
  ],
  right: [
    { name: 'Акции', href: '/promotions' },
    { name: 'Новости', href: '/news' },
    { name: 'О нас', href: '/contacts' },
    { name: 'Контакты', href: '/contacts' },
  ],
};

export const Footer = () => {
  // Get settings from database
  const { data: phone } = useSetting('phone');
  const { data: address } = useSetting('address');
  const { data: vkUrl } = useSetting('vk_url');
  const { data: telegramUrl } = useSetting('telegram_url');
  const { data: whatsappUrl } = useSetting('whatsapp_url');
  const { data: instagramUrl } = useSetting('instagram_url');

  // Format phone for tel: link
  const phoneLink = phone ? `tel:${phone.replace(/[^+\d]/g, '')}` : '#';

  return (
    <footer className="py-8 bg-background">
      <div className="container">
        {/* Main footer content with rounded corners */}
        <div className="bg-primary rounded-3xl px-8 md:px-12 py-10 text-primary-foreground">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Side - Logo & Contact */}
            <div>
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="text-white/90">
                  <svg viewBox="0 0 40 40" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 35V20M20 20C20 20 12 15 12 10C12 6 15 4 20 8C25 4 28 6 28 10C28 15 20 20 20 20Z" />
                    <path d="M15 25C10 23 8 18 10 14M25 25C30 23 32 18 30 14" />
                    <path d="M20 8C20 8 18 4 14 4M20 8C20 8 22 4 26 4" />
                  </svg>
                </div>
                <div>
                  <span className="text-2xl font-bold tracking-wide">Бутон в тон</span>
                  <p className="text-sm text-white/70">букеты, наполненные чувствами</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="text-xl font-medium italic mb-4">Мы всегда на связи!</h3>
                {phone && (
                  <p className="text-white/90">
                    <span className="text-white/70">Телефон:</span>{' '}
                    <a href={phoneLink} className="hover:text-white transition-colors">
                      {phone}
                    </a>
                  </p>
                )}
                {address && (
                  <p className="text-white/90">
                    <span className="text-white/70">Адрес:</span> {address}
                  </p>
                )}
              </div>
            </div>

            {/* Right Side - Navigation & Social */}
            <div className="lg:text-right">
              {/* Social Icons */}
              <div className="flex lg:justify-end gap-3 mb-8">
                {vkUrl && (
                  <a 
                    href={vkUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-full border border-white/30 text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <VKIcon />
                  </a>
                )}
                {instagramUrl && (
                  <a 
                    href={instagramUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-full border border-white/30 text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <MessengerIcon />
                  </a>
                )}
                {telegramUrl && (
                  <a 
                    href={telegramUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-full border border-white/30 text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <TelegramIcon />
                  </a>
                )}
                {whatsappUrl && (
                  <a 
                    href={whatsappUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-full border border-white/30 text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <WhatsAppIcon />
                  </a>
                )}
              </div>

              {/* Navigation Links */}
              <div className="flex flex-wrap lg:justify-end gap-x-12 gap-y-2 mb-8">
                <div className="space-y-2">
                  {footerLinks.left.map((link) => (
                    <Link 
                      key={link.name}
                      to={link.href}
                      className="block text-white/80 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
                <div className="space-y-2">
                  {footerLinks.right.map((link) => (
                    <Link 
                      key={link.name}
                      to={link.href}
                      className="block text-white/80 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Legal Links */}
              <div className="text-sm text-white/60 space-y-1">
                <a href="/privacy" className="hover:text-white/80 transition-colors underline block lg:inline">
                  Политика обработки персональных данных
                </a>
                <div className="lg:inline lg:mx-2 hidden">|</div>
                <a href="/terms" className="hover:text-white/80 transition-colors underline block lg:inline">
                  Пользование сайтом
                </a>
                <div className="lg:inline lg:mx-2 hidden">|</div>
                <a href="/return" className="hover:text-white/80 transition-colors underline block lg:inline">
                  Возврат товара
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
