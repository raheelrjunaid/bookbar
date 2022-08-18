import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import CollectionGrid from "../components/CollectionGrid";
import { trpc } from "../utils/trpc";

export const Search = () => {
  const router = useRouter();
  const utils = trpc.useContext();
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

  const deleteCollectionMutation = trpc.useMutation(["collection.delete"], {
    async onMutate({ id: removedCollectionId }) {
      utils.setQueryData(
        ["collection.search", { q: query, pageNumber }],
        (oldData: any) => {
          if (!oldData) return;
          return {
            ...oldData,
            collections: oldData.collections.filter(
              ({ id }: { id: string }) => id !== removedCollectionId
            ),
          };
        }
      );
    },
  });

  return (
    <>
      <Head>
        <title>Search | {query}</title>
      </Head>
      <h1 className="text-3xl font-serif text-gray-900 sm:text-4xl sm:tracking-tight my-14">
        Search Results for:{" "}
        <span className="text-purple-600">{query || "nothing yet :)"}</span>
      </h1>

      <CollectionGrid
        isLoading={isLoading}
        collections={results?.collections}
        deleteCollectionMutation={deleteCollectionMutation}
        basePath={`/search/?q=${query}&`}
        totalPages={results?.totalPages}
      />
    </>
  );
};

export default Search;
