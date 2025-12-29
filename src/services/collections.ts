import { supabase } from '@/integrations/supabase/client';

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean | null;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CollectionProduct {
  id: string;
  collection_id: string;
  product_id: string;
  sort_order: number | null;
  created_at: string | null;
}

export const getCollections = async (activeOnly = true): Promise<Collection[]> => {
  let query = supabase
    .from('collections')
    .select('*')
    .order('sort_order', { ascending: true });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }

  return data || [];
};

export const getCollectionBySlug = async (slug: string): Promise<Collection | null> => {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching collection:', error);
    throw error;
  }

  return data;
};

export const getCollectionProductIds = async (collectionSlug: string): Promise<string[]> => {
  // First get the collection by slug
  const collection = await getCollectionBySlug(collectionSlug);
  if (!collection) return [];

  const { data, error } = await supabase
    .from('collection_products')
    .select('product_id')
    .eq('collection_id', collection.id);

  if (error) {
    console.error('Error fetching collection product ids:', error);
    throw error;
  }

  return data?.map(cp => cp.product_id) || [];
};

export const createCollection = async (collection: Omit<Collection, 'id' | 'created_at' | 'updated_at'>): Promise<Collection> => {
  const { data, error } = await supabase
    .from('collections')
    .insert(collection)
    .select()
    .single();

  if (error) {
    console.error('Error creating collection:', error);
    throw error;
  }

  return data;
};

export const updateCollection = async (id: string, collection: Partial<Collection>): Promise<Collection> => {
  const { data, error } = await supabase
    .from('collections')
    .update(collection)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating collection:', error);
    throw error;
  }

  return data;
};

export const deleteCollection = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting collection:', error);
    throw error;
  }
};

export const getCollectionProducts = async (collectionId: string) => {
  const { data, error } = await supabase
    .from('collection_products')
    .select(`
      id,
      product_id,
      sort_order,
      products (
        id,
        name,
        price,
        old_price,
        image_url,
        in_stock
      )
    `)
    .eq('collection_id', collectionId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching collection products:', error);
    throw error;
  }

  return data || [];
};

export const addProductToCollection = async (collectionId: string, productId: string): Promise<void> => {
  const { error } = await supabase
    .from('collection_products')
    .insert({
      collection_id: collectionId,
      product_id: productId,
    });

  if (error) {
    console.error('Error adding product to collection:', error);
    throw error;
  }
};

export const removeProductFromCollection = async (collectionId: string, productId: string): Promise<void> => {
  const { error } = await supabase
    .from('collection_products')
    .delete()
    .eq('collection_id', collectionId)
    .eq('product_id', productId);

  if (error) {
    console.error('Error removing product from collection:', error);
    throw error;
  }
};
