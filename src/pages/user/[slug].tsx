import React from "react";
import { trpc } from "../../utils/trpc";
import Divider from "../../components/Divider";
import { CollectionCard } from "../../components/CollectionCard";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Button from "../../components/Button";
import { Edit, Plus } from "tabler-icons-react";
import { useRouter } from "next/router";

export default function UserPage({ data: initialData }: { data: any }) {
  const { data: session } = useSession();
  const utils = trpc.useContext();
  const slug = useRouter().query.slug as string;

  const { data, isLoading } = trpc.useQuery(
    [
      "collection.getAllByUserSlug",
      {
        userSlug: slug,
      },
    ],
    {
      initialData,
    }
  );
  const deleteCollectionMutation = trpc.useMutation(["collection.delete"], {
    async onMutate(deletedCollection) {
      await utils.cancelQuery([
        "collection.getAllByUserSlug",
        { userSlug: slug },
      ]);
      utils.setQueryData(
        ["collection.getAllByUserSlug", { userSlug: slug }],
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
        { userSlug: slug },
      ]);
    },
  });

  if (!data || isLoading) return null;

  return (
    <>
      <section className="flex flex-col gap-6 pt-14">
        <h1 className="font-serif text-4xl text-gray-900">
          {data.user.name}&apos;s Collections:
        </h1>
        {session?.user?.name === data.user.name && (
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
      </section>
      <Divider />
      <section className="grid grid-cols-1 gap-4">
        {data.collections.map(({ id, title, books }) => (
          <CollectionCard
            key={id}
            collectionId={id}
            title={title}
            user={data.user}
            bookCovers={books.map(({ cover }) => cover)}
            handleRemove={() => deleteCollectionMutation.mutate({ id })}
          />
        ))}
      </section>
    </>
  );
}
