import { useQuery } from '@tanstack/react-query';
import { getProducts, getProductById, Product, ProductCategory } from '@/services/products';

interface UseProductsOptions {
  category?: ProductCategory | 'all';
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'default' | 'price-asc' | 'price-desc';
  limit?: number;
  offset?: number;
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

export type { Product, ProductCategory };
