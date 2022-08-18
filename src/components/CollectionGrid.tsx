import { Collection, User } from "@prisma/client";
import { useRouter } from "next/router";
import { UseMutationResult } from "react-query";
import { CollectionCard } from "./CollectionCard";
import Pagination from "./Pagination";

interface CollectionGridProps {
  isLoading: boolean;
  collections?: (Collection & {
    books: { cover: string | null }[];
    user: User;
  })[];
  totalPages?: number;
  basePath: string;
  deleteCollectionMutation: UseMutationResult<any, any, any, any>;
}

export const CollectionGrid = ({
  isLoading,
  collections,
  totalPages,
  basePath,
  deleteCollectionMutation,
}: CollectionGridProps) => {
  const router = useRouter();
  const query = router.query.q as string;
  const pageNumber = parseInt(router.query.pageNumber as string);

  return (
    <>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {isLoading ? (
          Array.from({ length: 9 }).map((_, i) => (
            <CollectionCard.Loading key={i} />
          ))
        ) : !!collections?.length ? (
          collections?.map(({ id, title, user, books }) => (
            <CollectionCard
              key={id}
              bookCovers={books.map(({ cover }) => cover)}
              searchQuery={query}
              title={title}
              user={user}
              collectionId={id}
              handleRemove={() => deleteCollectionMutation.mutate({ id })}
            />
          ))
        ) : (
          <h2 className="text-center text-gray-700 col-span-full">
            No collections found.
          </h2>
        )}
      </section>
      {collections?.length && totalPages && totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          basePath={basePath}
          pageNumber={pageNumber}
        />
      )}
    </>
  );
};

export default CollectionGrid;
