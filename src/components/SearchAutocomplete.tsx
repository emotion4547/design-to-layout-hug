import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
  onSubmit: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  className?: string;
  inputClassName?: string;
  showCloseButton?: boolean;
}

type Anchor = { left: number; top: number; width: number; maxHeight: number };

export const SearchAutocomplete = ({
  value,
  onChange,
  onClose,
  onSubmit,
  inputRef,
  className,
  inputClassName,
  showCloseButton = false,
}: SearchAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isOpen = showSuggestions && value.trim().length >= 2;

  useEffect(() => {
    const fetchSuggestions = async () => {
      const searchTerm = value.trim();
      if (searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        // Use textSearch for better Cyrillic support, fallback to ilike
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, image_url')
          .eq('in_stock', true)
          .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .order('name')
          .limit(5);

        if (error) {
          console.error('Search error:', error);
          throw error;
        }
        setSuggestions(data || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [value]);

  // Обе строки поиска в шапке лежат внутри блоков, которые раскрываются
  // анимацией max-height и потому обязаны быть overflow-hidden. Подсказки
  // рисуются ниже поля, то есть ровно за границей такого блока, и срезались
  // целиком: список приходил с данными, но его никто никогда не видел.
  // Поэтому выпадашка уходит в портал на body и позиционируется fixed по
  // координатам поля — так её не может обрезать ни один предок.
  const updateAnchor = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setAnchor({
      left: rect.left,
      top: rect.bottom + 8,
      width: rect.width,
      // На телефоне поле оказывается почти внизу меню, поэтому высоту списка
      // ограничиваем тем, что реально осталось до нижнего края экрана.
      maxHeight: Math.max(160, window.innerHeight - rect.bottom - 24),
    });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;
    updateAnchor();
    window.addEventListener('resize', updateAnchor);
    window.addEventListener('scroll', updateAnchor, true);
    return () => {
      window.removeEventListener('resize', updateAnchor);
      window.removeEventListener('scroll', updateAnchor, true);
    };
  }, [isOpen, updateAnchor]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      // Портал лежит вне контейнера, и без этой проверки mousedown закрывал бы
      // список раньше, чем click успевал дойти до выбранного товара.
      if (dropdownRef.current?.contains(target)) return;
      setShowSuggestions(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProductClick = (productId: string) => {
    navigate(`/catalog/${productId}`);
    onChange('');
    setShowSuggestions(false);
    onClose?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit();
      setShowSuggestions(false);
    }
  };

  const dropdown = isOpen && anchor ? (
    <div
      ref={dropdownRef}
      style={{ position: 'fixed', left: anchor.left, top: anchor.top, width: anchor.width }}
      className="bg-background border border-border rounded-lg shadow-lg overflow-hidden z-[200]"
    >
      {suggestions.length > 0 ? (
        <div className="overflow-y-auto" style={{ maxHeight: anchor.maxHeight }}>
          {suggestions.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => handleProductClick(product.id)}
              className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left"
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="w-12 h-12 object-cover rounded-md shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {product.name}
                </p>
                <p className="text-sm text-primary font-semibold">
                  {product.price.toLocaleString('ru-RU')} ₽
                </p>
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full p-3 text-sm text-primary hover:bg-muted transition-colors border-t border-border"
          >
            Показать все результаты по запросу "{value}"
          </button>
        </div>
      ) : !isLoading ? (
        <div className="p-4 text-center text-sm text-muted-foreground">
          Ничего не найдено
        </div>
      ) : null}
    </div>
  ) : null;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={handleSubmit} role="search" className="flex items-center gap-3">
        {/* Настоящая кнопка отправки, а не просто иконка: без неё в форме не
            было ни одного submit-элемента, и запуск поиска держался на
            неявной отправке по Enter — она зависит от браузера и на
            экранной клавиатуре телефона срабатывает не всегда. */}
        <button
          type="submit"
          aria-label="Найти"
          className="shrink-0 text-white/60 hover:text-white transition-colors"
        >
          <Search className="h-5 w-5" />
        </button>
        <Input
          ref={inputRef}
          type="text"
          enterKeyHint="search"
          autoComplete="off"
          placeholder="Поиск товаров..."
          aria-label="Поиск товаров"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          className={cn(
            "flex-1 bg-transparent border-none text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0",
            inputClassName
          )}
        />
        {isLoading && (
          <Loader2 className="h-4 w-4 text-white/60 animate-spin shrink-0" />
        )}
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть поиск"
            className="p-1 text-white/60 hover:text-white shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {dropdown && createPortal(dropdown, document.body)}
    </div>
  );
};
