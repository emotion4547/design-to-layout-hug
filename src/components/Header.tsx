import { useState, useRef, useEffect } from 'react';
import logoImage from '@/assets/logo.png';
import { Search, Menu, X, ShoppingBag, Heart, ChevronDown } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { SearchAutocomplete } from '@/components/SearchAutocomplete';
import { useSetting } from '@/hooks/useSettings';
import { useCategories } from '@/hooks/useCategories';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigation = [
  { name: 'Каталог', href: '/catalog', hasDropdown: true },
  { name: 'Акции', href: '/promotions' },
  { name: 'Новости', href: '/news' },
  { name: 'Доставка', href: '/delivery' },
  { name: 'Контакты', href: '/contacts' },
];

const MaxIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
  </svg>
);

// Social icons as SVG components
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

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartPulse, setCartPulse] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const prevTotalItemsRef = useRef<number>(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { totalFavorites } = useFavorites();

  // Get social URLs from settings
  const { data: vkUrl } = useSetting('vk_url');
  const { data: telegramUrl } = useSetting('telegram_url');
  const { data: whatsappUrl } = useSetting('whatsapp_url');
  const { data: instagramUrl } = useSetting('instagram_url');
  const { data: maxUrl } = useSetting('max_url');

  const { data: categories } = useCategories({ activeOnly: true });
  const catalogCategories = [
    { id: 'all', name: 'Все товары', href: '/catalog' },
    ...(categories || []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      href: `/catalog?category=${cat.slug}`,
    })),
  ];

  // Trigger pulse animation when items are added to cart
  useEffect(() => {
    if (totalItems > prevTotalItemsRef.current) {
      setCartPulse(true);
      const timer = setTimeout(() => setCartPulse(false), 600);
      return () => clearTimeout(timer);
    }
    prevTotalItemsRef.current = totalItems;
  }, [totalItems]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);


  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full py-4">
      <div className="container">
        {/* Main header bar with rounded corners */}
        <nav className="bg-primary rounded-full px-6 py-3 flex items-center justify-between">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImage} alt="Везу букет" className="h-12 w-12 rounded-full object-cover" />
            <div className="text-white">
              <span className="text-xl font-bold tracking-wide font-['Playfair_Display']">Везу букет</span>
              <p className="text-xs text-white/70 -mt-0.5 font-['Cormorant_Garamond'] italic">с любовью в каждом букете</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navigation.map((item) => (
              item.hasDropdown ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center gap-1 text-sm transition-colors outline-none",
                        isActive(item.href) 
                          ? "text-white font-medium" 
                          : "text-white/80 hover:text-white"
                      )}
                    >
                      {item.name}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="start" 
                    className="w-56 bg-background border border-border shadow-lg z-[100]"
                  >
                    {catalogCategories.map((category) => (
                      <DropdownMenuItem key={category.id} asChild>
                        <Link 
                          to={category.href}
                          className="cursor-pointer"
                        >
                          {category.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-1 text-sm transition-colors",
                    isActive(item.href) 
                      ? "text-white font-medium" 
                      : "text-white/80 hover:text-white"
                  )}
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>

          {/* Desktop Right Side - Social + Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Social Icons */}
            <div className="flex items-center gap-1">
              {vkUrl && (
                <a 
                  href={vkUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/10 text-white/90 hover:bg-white/20 hover:text-white transition-colors"
                >
                  <VKIcon />
                </a>
              )}
              {telegramUrl && (
                <a 
                  href={telegramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/10 text-white/90 hover:bg-white/20 hover:text-white transition-colors"
                >
                  <TelegramIcon />
                </a>
              )}
              {whatsappUrl && (
                <a 
                  href={whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/10 text-white/90 hover:bg-white/20 hover:text-white transition-colors"
                >
                  <WhatsAppIcon />
                </a>
              )}
              {instagramUrl && (
                <a 
                  href={instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/10 text-white/90 hover:bg-white/20 hover:text-white transition-colors"
                >
                  <MessengerIcon />
                </a>
              )}
              {maxUrl && (
                <a 
                  href={maxUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/10 text-white/90 hover:bg-white/20 hover:text-white transition-colors"
                >
                  <MaxIcon />
                </a>
              )}
            </div>

            {/* Divider - only show if there are social links */}
            {(vkUrl || telegramUrl || whatsappUrl || instagramUrl) && (
              <div className="w-px h-6 bg-white/20 mx-2" />
            )}

            {/* Action Icons */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-white/90 hover:text-white transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
              <Link to="/favorites" className="relative p-2 text-white/90 hover:text-white transition-colors">
                <Heart className="h-5 w-5" />
                {totalFavorites > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalFavorites}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="relative p-2 text-white/90 hover:text-white transition-colors">
                <ShoppingBag className={cn(
                  "h-5 w-5 transition-transform",
                  cartPulse && "animate-[pulse_0.6s_ease-in-out]"
                )} />
                {totalItems > 0 && (
                  <span className={cn(
                    "absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center transition-transform",
                    cartPulse && "animate-[bounce_0.6s_ease-in-out]"
                  )}>
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Action Icons + Menu Button */}
          <div className="lg:hidden flex items-center gap-1">
            <Link to="/favorites" className="relative p-2 text-white/90 hover:text-white">
              <Heart className="h-5 w-5" />
              {totalFavorites > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalFavorites}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative p-2 text-white/90 hover:text-white">
              <ShoppingBag className={cn(
                "h-5 w-5 transition-transform",
                cartPulse && "animate-[pulse_0.6s_ease-in-out]"
              )} />
              {totalItems > 0 && (
                <span className={cn(
                  "absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center transition-transform",
                  cartPulse && "animate-[bounce_0.6s_ease-in-out]"
                )}>
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              className="p-2 text-white/90 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Desktop Search Bar */}
        <div
          className={cn(
            "hidden lg:block mt-2 overflow-hidden transition-all duration-300",
            searchOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="bg-primary rounded-full px-4 py-2">
            <SearchAutocomplete
              value={searchQuery}
              onChange={setSearchQuery}
              onClose={() => {
                setSearchOpen(false);
                setSearchQuery('');
              }}
              onSubmit={() => {
                if (searchQuery.trim()) {
                  navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchOpen(false);
                  setSearchQuery('');
                }
              }}
              inputRef={searchInputRef}
              showCloseButton
              variant="desktop"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "lg:hidden mt-2 bg-primary rounded-2xl overflow-hidden transition-all duration-300",
            mobileMenuOpen ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="p-4 space-y-3">
            {navigation.map((item) => (
              item.hasDropdown ? (
                <div key={item.name}>
                  <button
                    onClick={() => setMobileCatalogOpen(!mobileCatalogOpen)}
                    className={cn(
                      "w-full flex items-center justify-between py-2 border-b border-white/10",
                      isActive(item.href) 
                        ? "text-white font-medium" 
                        : "text-white/80"
                    )}
                  >
                    {item.name}
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      mobileCatalogOpen && "rotate-180"
                    )} />
                  </button>
                  
                  {/* Mobile Categories Submenu */}
                  <div className={cn(
                    "overflow-hidden transition-all duration-300",
                    mobileCatalogOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <div className="pl-4 py-2 space-y-1">
                      {catalogCategories.map((category) => (
                        <Link
                          key={category.id}
                          to={category.href}
                          className="block py-2 text-sm text-white/70 hover:text-white transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center justify-between py-2 border-b border-white/10",
                    isActive(item.href) 
                      ? "text-white font-medium" 
                      : "text-white/80"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )
            ))}
            
            {/* Social Icons - Mobile */}
            <div className="flex items-center gap-2 pt-3">
              {vkUrl && (
                <a href={vkUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 text-white/90">
                  <VKIcon />
                </a>
              )}
              {telegramUrl && (
                <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 text-white/90">
                  <TelegramIcon />
                </a>
              )}
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 text-white/90">
                  <WhatsAppIcon />
                </a>
              )}
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 text-white/90">
                  <MessengerIcon />
                </a>
              )}
              {maxUrl && (
                <a href={maxUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 text-white/90">
                  <MaxIcon />
                </a>
              )}
            </div>

            {/* Mobile Search */}
            <div className="pt-2">
              <SearchAutocomplete
                value={searchQuery}
                onChange={setSearchQuery}
                onClose={() => setMobileMenuOpen(false)}
                onSubmit={() => {
                  if (searchQuery.trim()) {
                    navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchQuery('');
                    setMobileMenuOpen(false);
                  }
                }}
                variant="mobile"
                inputClassName="bg-white/10 border-white/20"
              />
            </div>

            {/* Action Icons - Mobile */}
            <div className="flex items-center gap-2 pt-2">
              <Link 
                to="/favorites" 
                className="relative p-2 text-white/90 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart className="h-5 w-5" />
                {totalFavorites > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalFavorites}
                  </span>
                )}
              </Link>
              <Link 
                to="/cart" 
                className="relative p-2 text-white/90 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingBag className={cn(
                  "h-5 w-5 transition-transform",
                  cartPulse && "animate-[pulse_0.6s_ease-in-out]"
                )} />
                {totalItems > 0 && (
                  <span className={cn(
                    "absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center transition-transform",
                    cartPulse && "animate-[bounce_0.6s_ease-in-out]"
                  )}>
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
