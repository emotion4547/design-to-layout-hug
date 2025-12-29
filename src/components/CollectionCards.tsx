import { Link } from 'react-router-dom';
import { useCollections } from '@/hooks/useCollections';
import { Skeleton } from '@/components/ui/skeleton';

export const CollectionCards = () => {
  const { data: collections, isLoading } = useCollections(true);

  if (isLoading) {
    return (
      <div className="mt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            to={`/catalog?collection=${collection.slug}`}
            className="group relative overflow-hidden rounded-2xl aspect-[16/9] bg-muted"
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
            <div className="absolute inset-0 flex items-end p-4">
              <h3 className="text-white font-semibold text-lg drop-shadow-lg">
                {collection.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
