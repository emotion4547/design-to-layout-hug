import { useState } from 'react';
import { MessageCircle, X, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAllSettings } from '@/hooks/useSettings';

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

const VKIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.12-5.339-3.202-2.17-3.04-2.763-5.32-2.763-5.785 0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.847 2.492 2.272 4.678 2.865 4.678.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.747c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.27-1.422 2.18-3.609 2.18-3.609.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.356 4.031-2.356 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const MaxIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
  </svg>
);

interface ContactLink {
  url: string;
  icon: React.ReactNode;
  label: string;
  bgColor: string;
}

export const FloatingContactButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: settings } = useAllSettings();

  if (settings?.floating_button_enabled === 'false') return null;

  const phoneUrl = settings?.phone;
  const telegramUrl = settings?.telegram_url;
  const whatsappUrl = settings?.whatsapp_url;
  const vkUrl = settings?.vk_url;
  const instagramUrl = settings?.instagram_url;
  const maxUrl = settings?.max_url;
  const phoneEnabled = settings?.floating_phone_enabled;
  const whatsappEnabled = settings?.floating_whatsapp_enabled;
  const telegramEnabled = settings?.floating_telegram_enabled;
  const vkEnabled = settings?.floating_vk_enabled;
  const instagramEnabled = settings?.floating_instagram_enabled;
  const maxEnabled = settings?.floating_max_enabled;

  const isOn = (val: string | undefined | null) => val !== 'false';

  const links: ContactLink[] = [];

  if (phoneUrl && isOn(phoneEnabled)) {
    const phone = phoneUrl.replace(/[^\d+]/g, '');
    links.push({
      url: `tel:${phone}`,
      icon: <Phone className="h-5 w-5" />,
      label: 'Позвонить',
      bgColor: 'bg-green-500 hover:bg-green-600',
    });
  }

  if (whatsappUrl && isOn(whatsappEnabled)) {
    links.push({
      url: whatsappUrl,
      icon: <WhatsAppIcon />,
      label: 'WhatsApp',
      bgColor: 'bg-[#25D366] hover:bg-[#1da851]',
    });
  }

  if (telegramUrl && isOn(telegramEnabled)) {
    links.push({
      url: telegramUrl,
      icon: <TelegramIcon />,
      label: 'Telegram',
      bgColor: 'bg-[#0088cc] hover:bg-[#006daa]',
    });
  }

  if (vkUrl && isOn(vkEnabled)) {
    links.push({
      url: vkUrl,
      icon: <VKIcon />,
      label: 'ВКонтакте',
      bgColor: 'bg-[#4C75A3] hover:bg-[#3b6090]',
    });
  }

  if (instagramUrl && isOn(instagramEnabled)) {
    links.push({
      url: instagramUrl,
      icon: <InstagramIcon />,
      label: 'Instagram',
      bgColor: 'bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#dc2743] hover:opacity-90',
    });
  }

  if (maxUrl && isOn(maxEnabled)) {
    links.push({
      url: maxUrl,
      icon: <MaxIcon />,
      label: 'Макс',
      bgColor: 'bg-[#7B68EE] hover:bg-[#6a5acd]',
    });
  }

  if (links.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <div className={cn(
        "flex flex-col gap-2 transition-all duration-300",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        {links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target={link.url.startsWith('tel:') ? undefined : '_blank'}
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-3 text-white rounded-full pl-4 pr-5 py-2.5 shadow-lg transition-all duration-200 text-sm font-medium",
              link.bgColor
            )}
          >
            {link.icon}
            {link.label}
          </a>
        ))}
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300",
          isOpen
            ? "bg-muted-foreground rotate-0"
            : "bg-primary hover:scale-110"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
};
