import { Book, Collection, User } from "@prisma/client";
import { useRouter } from "next/router";
import { UseMutationResult } from "react-query";
import { CollectionCard } from "./CollectionCard";
import Pagination from "./Pagination";

interface CollectionGridProps {
  isLoading: boolean;
  collections?: (Collection & {
    books: Book[];
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
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 9 }).map((_, i) => (
            <CollectionCard.Loading key={i} />
          ))
        ) : !!collections?.length ? (
          collections?.map(({ id, title, user, books }) => (
            <CollectionCard
              key={id}
              books={books}
              searchQuery={query}
              title={title}
              user={user}
              collectionId={id}
              handleRemove={() => deleteCollectionMutation.mutate({ id })}
            />
          ))
        ) : (
          <>
            <h2 className="col-span-full text-center text-gray-700">
              No collections found.
            </h2>
          </>
        )}
      </section>
      {collections?.length
        ? totalPages &&
          totalPages > 1 && (
            <Pagination
              totalPages={totalPages}
              basePath={basePath}
              pageNumber={pageNumber}
            />
          )
        : null}
    </>
  );
};

export default CollectionGrid;
