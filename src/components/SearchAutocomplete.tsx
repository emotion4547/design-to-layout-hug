import { useState, useEffect, useRef } from 'react';
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
  variant?: 'desktop' | 'mobile';
}

export const SearchAutocomplete = ({
  value,
  onChange,
  onClose,
  onSubmit,
  inputRef,
  className,
  inputClassName,
  showCloseButton = false,
  variant = 'desktop',
}: SearchAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, image_url')
          .ilike('name', `%${value.trim()}%`)
          .limit(5);

        if (error) throw error;
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
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

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <Search className="h-5 w-5 text-white/60 shrink-0" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Поиск товаров..."
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
            className="p-1 text-white/60 hover:text-white shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && value.trim().length >= 2 && (
        <div className={cn(
          "absolute left-0 right-0 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-[200]",
          variant === 'desktop' ? "top-full mt-2" : "top-full mt-1"
        )}>
          {suggestions.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
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
      )}
    </div>
  );
};
