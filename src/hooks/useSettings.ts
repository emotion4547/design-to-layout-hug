import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSetting, updateSetting } from '@/services/settings';

const SETTINGS_CACHE_PREFIX = 'setting_cache_';

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

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      updateSetting(key, value),
    onSuccess: (_, { key, value }) => {
      saveCachedSetting(key, value);
      queryClient.invalidateQueries({ queryKey: ['setting', key] });
    },
  });
};
