import { useRouter } from "next/router";
import { useEffect } from "react";
import { CollectionCard } from "../components/CollectionCard";
import Divider from "../components/Divider";
import Pagination from "../components/Pagination";
import { trpc } from "../utils/trpc";

export const Search = () => {
  const router = useRouter();
  const query = router.query.q as string;
  const pageNumber = parseInt(router.query.pageNumber as string);
  useEffect(() => {
    if (!pageNumber) router.push(`/search/?q=${query || ""}&pageNumber=1`);
  }, [pageNumber, query, router]);

  const { data: results, isLoading } = trpc.useQuery(
    ["collection.search", { q: query, pageNumber }],
    {
      enabled: !!query,
      keepPreviousData: true,
    }
  );

  return (
    <>
      <h1 className="text-3xl font-bold font-serif text-gray-900 mt-14">
        Search Results for: {query}
      </h1>
      <Divider />
      <section className="grid grid-cols-1 gap-4">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <CollectionCard.Loading key={i} />
            ))
          : results?.collections?.map(({ id, title, user, books }) => (
              <CollectionCard
                key={id}
                bookCovers={books.map(({ cover }) => cover)}
                searchQuery={query}
                title={title}
                user={user}
                collectionId={id}
              />
            ))}
        {results && results.totalPages > 1 && (
          <Pagination
            totalPages={results?.totalPages as number}
            basePath={`/search?q=${query}&`}
            pageNumber={pageNumber}
          />
        )}
      </section>
    </>
  );
};

export default Search;
