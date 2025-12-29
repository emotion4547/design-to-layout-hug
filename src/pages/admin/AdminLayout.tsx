import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Newspaper, 
  Percent,
  FolderTree,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  Layers,
  Settings,
  Palette,
  Plug
} from 'lucide-react';

const navItems = [
  { 
    label: 'Обзор', 
    path: '/admin', 
    icon: LayoutDashboard,
    end: true 
  },
  { 
    label: 'Товары', 
    path: '/admin/products', 
    icon: Package 
  },
  { 
    label: 'Категории', 
    path: '/admin/categories', 
    icon: FolderTree 
  },
  { 
    label: 'Подборки', 
    path: '/admin/collections', 
    icon: Layers 
  },
  { 
    label: 'Заказы', 
    path: '/admin/orders', 
    icon: ShoppingCart 
  },
  { 
    label: 'Новости', 
    path: '/admin/news', 
    icon: Newspaper 
  },
  { 
    label: 'Акции', 
    path: '/admin/promotions', 
    icon: Percent 
  },
  { 
    label: 'Дизайн', 
    path: '/admin/design', 
    icon: Palette 
  },
  { 
    label: 'Интеграции', 
    path: '/admin/integrations', 
    icon: Plug 
  },
  { 
    label: 'Настройки', 
    path: '/admin/settings', 
    icon: Settings 
  },
];

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();

  const isActive = (path: string, end?: boolean) => {
    if (end) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-secondary rounded-lg"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <h1 className="font-bold">Админ-панель</h1>
        <Link to="/" className="p-2 hover:bg-secondary rounded-lg">
          <ChevronLeft className="h-5 w-5" />
        </Link>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-background border-r border-border z-40 transition-transform lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-border hidden lg:block">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm">На сайт</span>
          </Link>
          <h1 className="text-xl font-bold mt-4">Админ-панель</h1>
        </div>

        <nav className="p-4 mt-16 lg:mt-0 flex flex-col h-[calc(100%-4rem)] lg:h-[calc(100%-6rem)]">
          <div className="flex-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors",
                  isActive(item.path, item.end)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
          
          <div className="border-t border-border pt-4 mt-4">
            <div className="px-4 py-2 text-sm text-muted-foreground truncate">
              {user?.email}
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Выйти</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
