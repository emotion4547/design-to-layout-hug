import { useLayoutEffect } from 'react';
import { useSetting } from '@/hooks/useSettings';

const CACHE_KEY = 'theme_cache';

interface ThemeCache {
  primary?: string;
  accent?: string;
}

const getCachedTheme = (): ThemeCache => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveCachedTheme = (cache: ThemeCache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
};

const applyColors = (primaryColor?: string | null, accentColor?: string | null) => {
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

// Apply cached theme IMMEDIATELY on module load (before React renders)
const cached = getCachedTheme();
if (cached.primary || cached.accent) {
  applyColors(cached.primary, cached.accent);
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: primaryColor, isSuccess: primaryLoaded } = useSetting('primary_color');
  const { data: accentColor, isSuccess: accentLoaded } = useSetting('accent_color');

  useLayoutEffect(() => {
    if (primaryLoaded || accentLoaded) {
      applyColors(primaryColor, accentColor);
      // Update cache for next visit
      const newCache: ThemeCache = {};
      if (primaryColor) newCache.primary = primaryColor;
      if (accentColor) newCache.accent = accentColor;
      saveCachedTheme(newCache);
    }
  }, [primaryColor, accentColor, primaryLoaded, accentLoaded]);

  return <>{children}</>;
};
