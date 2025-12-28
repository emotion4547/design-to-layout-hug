import { useQuery } from '@tanstack/react-query';
import { getPromotions, getPromotionById, getPromotionBySlug, getAllPromotions, Promotion } from '@/services/promotions';

interface UsePromotionsOptions {
  limit?: number;
  offset?: number;
  activeOnly?: boolean;
  enabled?: boolean;
}

export function usePromotions(options: UsePromotionsOptions = {}) {
  const { enabled = true, ...queryOptions } = options;
  
  return useQuery({
    queryKey: ['promotions', queryOptions],
    queryFn: () => getPromotions(queryOptions),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

export function usePromotion(id: string | undefined) {
  return useQuery({
    queryKey: ['promotions', 'item', id],
    queryFn: () => getPromotionById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function usePromotionBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['promotions', 'slug', slug],
    queryFn: () => getPromotionBySlug(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAllPromotions() {
  return useQuery({
    queryKey: ['promotions', 'all'],
    queryFn: getAllPromotions,
    staleTime: 1000 * 60 * 5,
  });
}

export type { Promotion };
