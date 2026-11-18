import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  addons?: { id: string; name: string; price: number }[];
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Корзина хранится в браузере покупателя.
 *
 * Раньше она жила только в памяти страницы и пропадала при перезагрузке,
 * а в новой вкладке была пустой. Покупатель, который полчаса выбирал букеты
 * и открывал их в соседних вкладках, доходил до оформления с пустой или
 * неполной корзиной — так в Метрике и выглядели визиты с десятком
 * добавлений в корзину и без заказа.
 *
 * Корзина живёт неделю: цены и наличие меняются, и через месяц собранный
 * когда-то заказ скорее запутает, чем поможет.
 */
const STORAGE_KEY = 'vezubuket-cart';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const isCartItem = (x: unknown): x is CartItem => {
  const i = x as CartItem;
  return (
    !!i &&
    typeof i.id === 'string' &&
    typeof i.name === 'string' &&
    typeof i.price === 'number' &&
    typeof i.quantity === 'number' &&
    i.quantity > 0
  );
};

function parseStored(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as { items?: unknown; savedAt?: number };
    if (!Array.isArray(data.items)) return [];
    if (typeof data.savedAt === 'number' && Date.now() - data.savedAt > MAX_AGE_MS) return [];
    return data.items.filter(isCartItem);
  } catch {
    return [];
  }
}

// Хранилище бывает недоступно (частный режим, запрет в настройках) —
// тогда корзина просто работает как раньше, в памяти страницы.
function loadCart(): CartItem[] {
  try {
    return parseStored(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    if (items.length === 0) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, savedAt: Date.now() }));
  } catch {
    /* нет доступа к хранилищу — не страшно */
  }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  // Корзина одна на все вкладки: добавили букет в одной — он виден в другой.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(parseStored(e.newValue));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(i => i.id === item.id);
      if (existingIndex >= 0) {
        // Новый объект, а не правка старого: изменение «на месте» React
        // может не заметить, и счётчик в шапке не обновится.
        return prev.map((i, idx) => (idx === existingIndex ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalPrice = items.reduce((sum, item) => {
    const addonsPrice = item.addons?.reduce((a, addon) => a + addon.price, 0) || 0;
    return sum + (item.price + addonsPrice) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
