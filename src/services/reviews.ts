import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  product_id: string | null;
  author_name: string;
  rating: number;
  text: string | null;
  images: string[] | null;
  is_published: boolean;
  created_at: string;
}

export interface ProductRating {
  product_id: string;
  rating_avg: number;
  rating_count: number;
}

/** Проверенные отзывы о товаре, свежие сверху. */
export async function getProductReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Не удалось загрузить отзывы:', error);
    return [];
  }
  return (data ?? []) as Review[];
}

/** Средние оценки сразу по всем товарам — для списка каталога. */
export async function getProductRatings(): Promise<Map<string, ProductRating>> {
  const { data, error } = await supabase.from('product_ratings').select('*');
  if (error) {
    console.error('Не удалось загрузить рейтинги:', error);
    return new Map();
  }
  return new Map((data ?? []).map((r) => [r.product_id as string, r as ProductRating]));
}

export interface NewReview {
  productId: string;
  authorName: string;
  rating: number;
  text?: string;
}

/**
 * Отправляет отзыв на проверку.
 *
 * Намеренно без .select(): политика чтения не пропускает непроверенные
 * отзывы, и попытка вернуть вставленную строку упала бы с ошибкой доступа.
 */
export async function submitReview(review: NewReview): Promise<void> {
  const { error } = await supabase.from('reviews').insert({
    product_id: review.productId,
    author_name: review.authorName.trim(),
    rating: review.rating,
    text: review.text?.trim() || null,
  });
  if (error) throw error;
}

// --- для админки ---

export async function getAllReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Review[];
}

export async function setReviewPublished(id: string, published: boolean): Promise<void> {
  const { error } = await supabase.from('reviews').update({ is_published: published }).eq('id', id);
  if (error) throw error;
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
}
