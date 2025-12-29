import { Link } from 'react-router-dom';
import { useCollections } from '@/hooks/useCollections';
import { useSetting } from '@/hooks/useSettings';
import { Skeleton } from '@/components/ui/skeleton';

export const CollectionCards = () => {
  const { data: collections, isLoading } = useCollections(true);
  const { data: collectionsTitle } = useSetting('collections_title');

  if (isLoading) {
    return (
      <div className="mt-6">
        <Skeleton className="h-8 w-64 mx-auto mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!collections || collections.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
        {collectionsTitle || 'Подборки на актуальные праздники'}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            to={`/collection/${collection.slug}`}
            className="group relative overflow-hidden rounded-xl h-20 bg-muted"
          >
            {collection.image_url ? (
              <img
                src={collection.image_url}
                alt={collection.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <h3 className="text-white font-medium text-sm drop-shadow-lg text-center">
                {collection.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
