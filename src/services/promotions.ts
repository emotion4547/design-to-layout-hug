import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/database';

export type Promotion = Database['public']['Tables']['promotions']['Row'];
export type PromotionInsert = Database['public']['Tables']['promotions']['Insert'];
export type PromotionUpdate = Database['public']['Tables']['promotions']['Update'];

export async function getPromotions(options?: {
  limit?: number;
  offset?: number;
  activeOnly?: boolean;
}) {
  let query = supabase
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.activeOnly !== false) {
    query = query.eq('is_active', true);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 12) - 1);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching promotions:', error);
    throw error;
  }

  return data;
}

export async function getPromotionById(id: string) {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching promotion:', error);
    throw error;
  }

  return data;
}

export async function getPromotionBySlug(slug: string) {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching promotion:', error);
    throw error;
  }

  return data;
}

// Admin functions
export async function createPromotion(promotion: PromotionInsert) {
  const { data, error } = await supabase
    .from('promotions')
    .insert(promotion)
    .select()
    .single();

  if (error) {
    console.error('Error creating promotion:', error);
    throw error;
  }

  return data;
}

export async function updatePromotion(id: string, promotion: PromotionUpdate) {
  const { data, error } = await supabase
    .from('promotions')
    .update(promotion)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating promotion:', error);
    throw error;
  }

  return data;
}

export async function deletePromotion(id: string) {
  const { error } = await supabase
    .from('promotions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting promotion:', error);
    throw error;
  }
}

export async function getAllPromotions() {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all promotions:', error);
    throw error;
  }

  return data;
}
