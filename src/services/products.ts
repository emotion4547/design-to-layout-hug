import { supabase } from '@/integrations/supabase/client';

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
  category: ProductCategory;
  article: string | null;
  size: string | null;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type ProductUpdate = Partial<ProductInsert>;

export async function getProducts(options?: {
  category?: ProductCategory | 'all';
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'default' | 'price-asc' | 'price-desc';
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('products')
    .select('*')
    .eq('in_stock', true);

  if (options?.category && options.category !== 'all') {
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

  return data as Product[];
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching product:', error);
    throw error;
  }

  return data as Product | null;
}

export async function getProductsByIds(ids: string[]) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .in('id', ids);

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return data as Product[];
}

// Admin functions
export async function createProduct(product: ProductInsert) {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  return data as Product;
}

export async function updateProduct(id: string, product: ProductUpdate) {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  return data as Product;
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
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all products:', error);
    throw error;
  }

  return data as Product[];
}
