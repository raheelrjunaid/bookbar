import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { signIn, useSession } from "next-auth/react";
import Button from "../components/Button";
import Divider from "../components/Divider";
import { Plus } from "tabler-icons-react";
import Link from "next/link";
import { CollectionCard } from "../components/CollectionCard";
import Pagination from "../components/Pagination";
import { useRouter } from "next/router";
import { parse } from "path";
import { useEffect } from "react";

const Home: NextPage = () => {
  const router = useRouter();
  const pageNumber = router.query.pageNumber as string;
  const { status: sessionStatus } = useSession();
  const utils = trpc.useContext();
  useEffect(() => {
    if (!pageNumber) router.push(`/?pageNumber=1`);
  }, [pageNumber, router]);

  const { data: collectionData, isLoading: collectionsLoading } = trpc.useQuery(
    [
      "collection.getAll",
      {
        pageNumber: parseInt(pageNumber),
      },
    ],
    {
      enabled: !!pageNumber,
      keepPreviousData: true,
    }
  );
  const deleteCollectionMutation = trpc.useMutation(["collection.delete"], {
    async onMutate(deletedCollection) {
      await utils.cancelQuery(["collection.getAll"]);
      utils.setQueryData(["collection.getAll"], (oldData: any) => {
        if (!oldData) return;
        return oldData.filter(
          ({ id }: { id: string }) => id !== deletedCollection.id
        );
      });
    },
    onSettled() {
      utils.invalidateQueries(["collection.getAll"]);
    },
  });

  return (
    <>
      <Head>
        <title>BookBar | Explore</title>
      </Head>

      <section className="flex flex-col gap-6 pt-14">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-4xl text-gray-900">
            Explore Popular Collections
          </h1>
          <p className="font-normal text-gray-700">
            Get the best book recommendations from actual people!
          </p>
        </div>
        {sessionStatus === "unauthenticated" && (
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => signIn()}>
              Log In
            </Button>
            <Button onClick={() => signIn()}>Sign Up</Button>
          </div>
        )}
      </section>

      <Divider />

      <section className="grid grid-cols-1 gap-4">
        {collectionsLoading
          ? Array.from({ length: 9 }).map((_, i) => (
              <CollectionCard.Loading key={i} />
            ))
          : collectionData?.collections.map(({ id, title, user, books }) => (
              <CollectionCard
                key={id}
                collectionId={id}
                title={title}
                user={user}
                bookCovers={books.map(({ cover }) => cover)}
                handleRemove={() => deleteCollectionMutation.mutate({ id })}
              />
            ))}
        {collectionData?.totalPages && collectionData.totalPages > 1 && (
          <Pagination
            totalPages={collectionData.totalPages}
            basePath="/?"
            pageNumber={parseInt(pageNumber)}
          />
        )}
      </section>

      <section className="pt-10 flex justify-center">
        <Link href="/collection/add">
          <Button size="lg" rightIcon={<Plus />}>
            Add Collection
          </Button>
        </Link>
      </section>
    </>
  );
};

export default Home;
