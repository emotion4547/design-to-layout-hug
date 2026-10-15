import { useQuery } from '@tanstack/react-query';
import { getProducts, getProductById, getCompanionProducts, getSimilarProducts, Product, ProductCategory, ProductWithCategory } from '@/services/products';

interface UseProductsOptions {
  categoryId?: string;
  categoryIds?: string[];
  categorySlug?: string;
  category?: ProductCategory | 'all'; // Legacy support
  productIds?: string[]; // Filter by specific product IDs (for collections)
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'default' | 'price-asc' | 'price-desc' | 'newest';
  limit?: number;
  offset?: number;
  inStockOnly?: boolean;
  withDiscountOnly?: boolean;
  enabled?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { enabled = true, ...queryOptions } = options;
  
  return useQuery({
    queryKey: ['products', queryOptions],
    queryFn: () => getProducts(queryOptions),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCompanionProducts(excludeId: string | undefined) {
  return useQuery({
    queryKey: ['products', 'companions', excludeId],
    queryFn: () => getCompanionProducts(excludeId!),
    enabled: !!excludeId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSimilarProducts(product: { id: string; category_id: string | null; price: number } | null | undefined) {
  return useQuery({
    queryKey: ['products', 'similar', product?.id],
    queryFn: () => getSimilarProducts(product!.category_id!, product!.id, product!.price),
    enabled: !!product?.category_id,
    staleTime: 1000 * 60 * 5,
  });
}

export type { Product, ProductCategory, ProductWithCategory };