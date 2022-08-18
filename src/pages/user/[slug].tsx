import React, { useEffect } from "react";
import { trpc } from "../../utils/trpc";
import Divider from "../../components/Divider";
import { CollectionCard } from "../../components/CollectionCard";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Button from "../../components/Button";
import { Edit, Plus } from "tabler-icons-react";
import { useRouter } from "next/router";
import Pagination from "../../components/Pagination";
import Head from "next/head";
import Alert from "../../components/Alert";
import CollectionGrid from "../../components/CollectionGrid";

export default function UserPage() {
  const { data: session } = useSession();
  const utils = trpc.useContext();
  const router = useRouter();
  const slug = router.query.slug as string;
  const pageNumber = parseInt(router.query.pageNumber as string);

  useEffect(() => {
    if (!pageNumber) router.push(`/user/${slug}?pageNumber=1`);
  }, [router, pageNumber, slug]);

  const { data, isLoading } = trpc.useQuery(
    [
      "collection.getAllByUserSlug",
      {
        userSlug: slug,
        pageNumber,
      },
    ],
    {
      enabled: !!pageNumber,
      keepPreviousData: true,
    }
  );
  const deleteCollectionMutation = trpc.useMutation(["collection.delete"], {
    async onMutate(deletedCollection) {
      await utils.cancelQuery([
        "collection.getAllByUserSlug",
        { userSlug: slug, pageNumber },
      ]);
      utils.setQueryData(
        ["collection.getAllByUserSlug", { userSlug: slug, pageNumber }],
        (oldData: any) => {
          if (!oldData) return;
          return {
            ...oldData,
            collections: oldData.collections.filter(
              ({ id }: { id: string }) => id !== deletedCollection.id
            ),
          };
        }
      );
    },
    onSettled() {
      utils.invalidateQueries([
        "collection.getAllByUserSlug",
        { userSlug: slug, pageNumber },
      ]);
    },
  });

  if (!isLoading && !data) {
    return (
      <>
        <Head>
          <title>Error</title>
        </Head>
        <Alert message="User not found" showAction />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`${data?.user.name || "Loading user"}'s collections`}</title>
      </Head>
      <section className="flex flex-col gap-6 pt-14">
        {isLoading ? (
          <>
            <div className="h-10 bg-gray-200 animate-pulse" />
            <div className="h-10 bg-gray-200 w-11/12" />
          </>
        ) : (
          <>
            <h1 className="font-serif text-4xl text-gray-900">
              {data?.user.name}&apos;s Collections:
            </h1>
            {session?.user?.name === data?.user.name && (
              <div className="flex items-center gap-3">
                <Link href="/collection/add">
                  <Button rightIcon={<Plus />}>Add Collection</Button>
                </Link>
                <Link href="/user/manage">
                  <Button variant="subtle" rightIcon={<Edit />}>
                    Edit Profile
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </section>
      <CollectionGrid
        isLoading={isLoading}
        collections={data?.collections}
        deleteCollectionMutation={deleteCollectionMutation}
        basePath={`/user/${slug}?`}
        totalPages={data?.totalPages}
      />
    </>
  );
}
