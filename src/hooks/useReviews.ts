import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getProductReviews, getProductRatings, submitReview,
  getAllReviews, setReviewPublished, deleteReview,
  type NewReview,
} from '@/services/reviews';

export function useProductReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', 'product', productId],
    queryFn: () => getProductReviews(productId!),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProductRatings() {
  return useQuery({
    queryKey: ['reviews', 'ratings'],
    queryFn: getProductRatings,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSubmitReview(productId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (r: NewReview) => submitReview(r),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', 'product', productId] }),
  });
}

// --- админка ---

export function useAllReviews() {
  return useQuery({ queryKey: ['admin', 'reviews'], queryFn: getAllReviews });
}

export function useModerateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      setReviewPublished(id, published),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      qc.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      qc.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}
