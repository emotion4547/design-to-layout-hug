import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSetting, getAllSettings, updateSetting } from '@/services/settings';

const SETTINGS_CACHE_PREFIX = 'setting_cache_';
const ALL_SETTINGS_CACHE_KEY = 'all_settings_cache';

const getCachedSetting = (key: string): string | null => {
  try {
    return localStorage.getItem(SETTINGS_CACHE_PREFIX + key);
  } catch {
    return null;
  }
};

const saveCachedSetting = (key: string, value: string | null) => {
  try {
    if (value) {
      localStorage.setItem(SETTINGS_CACHE_PREFIX + key, value);
    } else {
      localStorage.removeItem(SETTINGS_CACHE_PREFIX + key);
    }
  } catch {}
};

const getCachedAllSettings = (): Record<string, string> | null => {
  try {
    const cached = localStorage.getItem(ALL_SETTINGS_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const saveCachedAllSettings = (settings: Record<string, string>) => {
  try {
    localStorage.setItem(ALL_SETTINGS_CACHE_KEY, JSON.stringify(settings));
  } catch {}
};

export const useSetting = (key: string) => {
  return useQuery({
    queryKey: ['setting', key],
    queryFn: async () => {
      const value = await getSetting(key);
      saveCachedSetting(key, value);
      return value;
    },
    placeholderData: () => getCachedSetting(key),
  });
};

export const useAllSettings = () => {
  return useQuery({
    queryKey: ['all-settings'],
    queryFn: async () => {
      const settings = await getAllSettings();
      saveCachedAllSettings(settings);
      return settings;
    },
    placeholderData: () => getCachedAllSettings() ?? undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      updateSetting(key, value),
    onSuccess: (_, { key, value }) => {
      saveCachedSetting(key, value);
      queryClient.invalidateQueries({ queryKey: ['setting', key] });
      queryClient.invalidateQueries({ queryKey: ['all-settings'] });
    },
  });
};
