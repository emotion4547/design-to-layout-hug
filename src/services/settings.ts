import { supabase } from '@/integrations/supabase/client';

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const getSetting = async (key: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) throw error;
  return data?.value ?? null;
};

export const getAllSettings = async (): Promise<Record<string, string>> => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value');

  if (error) throw error;
  const map: Record<string, string> = {};
  for (const row of data || []) {
    if (row.value !== null) {
      map[row.key] = row.value;
    }
  }
  return map;
};

export const updateSetting = async (key: string, value: string): Promise<void> => {
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value }, { onConflict: 'key' });

  if (error) throw error;
};
