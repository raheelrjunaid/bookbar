import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { signIn, useSession } from "next-auth/react";
import Button from "../components/Button";
import { Plus } from "tabler-icons-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import CollectionGrid from "../components/CollectionGrid";

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
        <title>Explore | BookBar</title>
      </Head>

      <section className="max-w-7xl mx-auto py-16 sm:py-24 sm:px-6 text-center">
        <h1 className="mt-1 text-4xl font-serif text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          Explore Popular Collections
        </h1>
        <p className="max-w-xl mt-5 mx-auto text-lg sm:text-xl text-gray-500">
          Get the best book recommendations from actual people!
        </p>
        {sessionStatus === "unauthenticated" && (
          <div className="flex sm:flex-row flex-col justify-center gap-3 mt-7">
            <Button variant="outline" onClick={() => signIn()}>
              Log In
            </Button>
            <Button onClick={() => signIn()}>Sign Up</Button>
          </div>
        )}
      </section>

      <CollectionGrid
        isLoading={collectionsLoading}
        collections={collectionData?.collections}
        deleteCollectionMutation={deleteCollectionMutation}
        basePath={"/?"}
        totalPages={collectionData?.totalPages}
      />

      <section className="pb-14 pt-6 flex justify-center">
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
