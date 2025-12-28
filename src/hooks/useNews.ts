import { useQuery } from '@tanstack/react-query';
import { getNews, getNewsById, getNewsBySlug, getAllNews, News } from '@/services/news';

interface UseNewsOptions {
  limit?: number;
  offset?: number;
  category?: string;
  enabled?: boolean;
}

export function useNews(options: UseNewsOptions = {}) {
  const { enabled = true, ...queryOptions } = options;
  
  return useQuery({
    queryKey: ['news', queryOptions],
    queryFn: () => getNews(queryOptions),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

export function useNewsItem(id: string | undefined) {
  return useQuery({
    queryKey: ['news', 'item', id],
    queryFn: () => getNewsById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useNewsBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['news', 'slug', slug],
    queryFn: () => getNewsBySlug(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAllNews() {
  return useQuery({
    queryKey: ['news', 'all'],
    queryFn: getAllNews,
    staleTime: 1000 * 60 * 5,
  });
}

export type { News };
