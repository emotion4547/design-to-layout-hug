import { supabase } from '@/integrations/supabase/client';

// Legacy enum type for backward compatibility
export type ProductCategory =
  | 'aromatic'
  | 'new-year'
  | 'mono'
  | 'author'
  | 'edible'
  | 'wedding'
  | 'box'
  | 'gifts'
  | 'balloons'
  | 'vases'
  | 'certificates'
  | 'toys';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  old_price: number | null;
  image_url: string;
  images: string[];
  category: ProductCategory | null;
  category_id: string | null;
  article: string | null;
  size: string | null;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductWithCategory extends Product {
  categories?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type ProductUpdate = Partial<ProductInsert>;

export async function getProducts(options?: {
  categoryId?: string;
  categorySlug?: string;
  category?: ProductCategory | 'all'; // Legacy support
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'default' | 'price-asc' | 'price-desc';
  limit?: number;
  offset?: number;
  inStockOnly?: boolean;
}) {
  let query = supabase
    .from('products')
    .select('*, categories(id, name, slug)');

  // By default, show only in-stock products (can be overridden)
  if (options?.inStockOnly !== false) {
    query = query.eq('in_stock', true);
  }

  // Filter by category_id (new way)
  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }

  // Filter by category slug (joins with categories table)
  if (options?.categorySlug && options.categorySlug !== 'all') {
    query = query.eq('categories.slug', options.categorySlug);
  }

  // Legacy: filter by enum category
  if (options?.category && options.category !== 'all' && !options.categoryId && !options.categorySlug) {
    query = query.eq('category', options.category);
  }

  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
  }

  if (options?.minPrice !== undefined) {
    query = query.gte('price', options.minPrice);
  }

  if (options?.maxPrice !== undefined) {
    query = query.lte('price', options.maxPrice);
  }

  if (options?.sortBy === 'price-asc') {
    query = query.order('price', { ascending: true });
  } else if (options?.sortBy === 'price-desc') {
    query = query.order('price', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 12) - 1);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return data as ProductWithCategory[];
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching product:', error);
    throw error;
  }

  return data as ProductWithCategory | null;
}

export async function getProductsByIds(ids: string[]) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .in('id', ids);

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return data as ProductWithCategory[];
}

export async function getProductsByCategory(categoryId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .eq('category_id', categoryId)
    .eq('in_stock', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }

  return data as ProductWithCategory[];
}

// Admin functions
export async function createProduct(product: ProductInsert) {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select('*, categories(id, name, slug)')
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  return data as ProductWithCategory;
}

export async function updateProduct(id: string, product: ProductUpdate) {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select('*, categories(id, name, slug)')
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  return data as ProductWithCategory;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all products:', error);
    throw error;
  }

  return data as ProductWithCategory[];
}
