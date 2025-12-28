import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProductCountByCategory {
  categoryId: string;
  count: number;
}

export function useProductCounts() {
  return useQuery({
    queryKey: ['product-counts-by-category'],
    queryFn: async () => {
      // Get counts for each category
      const { data, error } = await supabase
        .from('products')
        .select('category_id');

      if (error) {
        console.error('Error fetching product counts:', error);
        throw error;
      }

      // Count products by category_id
      const counts: Record<string, number> = {};
      let totalCount = 0;

      data?.forEach((product) => {
        totalCount++;
        if (product.category_id) {
          counts[product.category_id] = (counts[product.category_id] || 0) + 1;
        }
      });

      return {
        byCategoryId: counts,
        total: totalCount,
      };
    },
  });
}
