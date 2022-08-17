import { useRouter } from "next/router";
import React from "react";
import { CollectionCard } from "../components/CollectionCard";
import Divider from "../components/Divider";
import { trpc } from "../utils/trpc";

export const Search = () => {
  const query = useRouter().query.q as string;
  const { data: results } = trpc.useQuery(["collection.search", { q: query }], {
    enabled: !!query,
    keepPreviousData: true,
  });
  console.log(results);

  return (
    <>
      <h1 className="text-3xl font-bold font-serif text-gray-900 mt-14">
        Search Results for: {query}
      </h1>
      <Divider />
      <section className="grid grid-cols-1 gap-4">
        {results?.map(({ id, title, user, books }) => (
          <CollectionCard
            key={id}
            bookCovers={books.map(({ cover }) => cover)}
            searchQuery={query}
            title={title}
            user={user}
            collectionId={id}
          />
        ))}
      </section>
    </>
  );
};

export default Search;
