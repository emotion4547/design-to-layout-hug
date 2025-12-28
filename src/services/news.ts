import { supabase } from '@/integrations/supabase/client';

export interface News {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  category: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type NewsInsert = Omit<News, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type NewsUpdate = Partial<NewsInsert>;

export async function getNews(options?: {
  limit?: number;
  offset?: number;
  category?: string;
}) {
  let query = supabase
    .from('news')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (options?.category) {
    query = query.eq('category', options.category);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 12) - 1);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching news:', error);
    throw error;
  }

  return data as News[];
}

export async function getNewsById(id: string) {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching news:', error);
    throw error;
  }

  return data as News | null;
}

export async function getNewsBySlug(slug: string) {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching news:', error);
    throw error;
  }

  return data as News | null;
}

// Admin functions
export async function createNews(news: NewsInsert) {
  const { data, error } = await supabase
    .from('news')
    .insert(news)
    .select()
    .single();

  if (error) {
    console.error('Error creating news:', error);
    throw error;
  }

  return data as News;
}

export async function updateNews(id: string, news: NewsUpdate) {
  const { data, error } = await supabase
    .from('news')
    .update(news)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating news:', error);
    throw error;
  }

  return data as News;
}

export async function deleteNews(id: string) {
  const { error } = await supabase
    .from('news')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting news:', error);
    throw error;
  }
}

export async function getAllNews() {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all news:', error);
    throw error;
  }

  return data as News[];
}
