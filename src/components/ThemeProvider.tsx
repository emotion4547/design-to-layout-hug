import { useEffect } from 'react';
import { useSetting } from '@/hooks/useSettings';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: primaryColor } = useSetting('primary_color');
  const { data: accentColor } = useSetting('accent_color');

  useEffect(() => {
    const root = document.documentElement;
    
    if (primaryColor) {
      root.style.setProperty('--primary', primaryColor);
      // Also update related colors for dark mode consistency
      root.style.setProperty('--sidebar-primary', primaryColor);
    }
    
    if (accentColor) {
      root.style.setProperty('--accent', accentColor);
      root.style.setProperty('--sidebar-accent', accentColor);
    }
  }, [primaryColor, accentColor]);

  return <>{children}</>;
};
