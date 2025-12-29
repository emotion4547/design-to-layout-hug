import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCollections,
  getCollectionBySlug,
  createCollection,
  updateCollection,
  deleteCollection,
  getCollectionProducts,
  addProductToCollection,
  removeProductFromCollection,
  Collection,
} from '@/services/collections';

export const useCollections = (activeOnly = true) => {
  return useQuery({
    queryKey: ['collections', activeOnly],
    queryFn: () => getCollections(activeOnly),
  });
};

export const useCollection = (slug: string) => {
  return useQuery({
    queryKey: ['collection', slug],
    queryFn: () => getCollectionBySlug(slug),
    enabled: !!slug,
  });
};

export const useCollectionProducts = (collectionId: string) => {
  return useQuery({
    queryKey: ['collection-products', collectionId],
    queryFn: () => getCollectionProducts(collectionId),
    enabled: !!collectionId,
  });
};

export const useCreateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

export const useUpdateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Collection> }) =>
      updateCollection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

export const useDeleteCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

export const useAddProductToCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, productId }: { collectionId: string; productId: string }) =>
      addProductToCollection(collectionId, productId),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: ['collection-products', collectionId] });
    },
  });
};

export const useRemoveProductFromCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, productId }: { collectionId: string; productId: string }) =>
      removeProductFromCollection(collectionId, productId),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: ['collection-products', collectionId] });
    },
  });
};
