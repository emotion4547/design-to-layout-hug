import { useEffect, useLayoutEffect } from 'react';
import { useSetting } from '@/hooks/useSettings';

const applyColors = (primaryColor: string | null | undefined, accentColor: string | null | undefined) => {
  const root = document.documentElement;
  
  if (primaryColor) {
    root.style.setProperty('--primary', primaryColor);
    root.style.setProperty('--ring', primaryColor);
    root.style.setProperty('--sidebar-primary', primaryColor);
  }
  
  if (accentColor) {
    root.style.setProperty('--accent', accentColor);
    root.style.setProperty('--sidebar-accent', accentColor);
  }
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: primaryColor, isSuccess: primaryLoaded } = useSetting('primary_color');
  const { data: accentColor, isSuccess: accentLoaded } = useSetting('accent_color');

  // Use layoutEffect to apply colors before browser paint
  useLayoutEffect(() => {
    if (primaryLoaded || accentLoaded) {
      applyColors(primaryColor, accentColor);
    }
  }, [primaryColor, accentColor, primaryLoaded, accentLoaded]);

  return <>{children}</>;
};
