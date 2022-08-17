import { NextPage } from "next";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import Button from "../../components/Button";
import { trpc } from "../../utils/trpc";
import { useRouter } from "next/router";
import { ExternalLink } from "tabler-icons-react";
import Link from "next/link";
import Divider from "../../components/Divider";
import { CollectionCard } from "../../components/CollectionCard";
import { Popover } from "@headlessui/react";

export const Manage: NextPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const router = useRouter();
  const utils = trpc.useContext();

  const { data: userData } = trpc.useQuery(["user.getUser"]);
  const { data: collectionData } = trpc.useQuery(
    [
      "collection.getAllByUserSlug",
      {
        userSlug: userData?.slug as string,
      },
    ],
    {
      enabled: !!userData,
    }
  );
  const deleteCollectionMutation = trpc.useMutation(["collection.delete"], {
    async onMutate(deletedCollection) {
      await utils.cancelQuery([
        "collection.getAllByUserSlug",
        { userSlug: userData?.slug },
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
        { userSlug: userData?.slug },
      ]);
    },
  });
  const deleteAccountMutation = trpc.useMutation("user.delete", {
    onSuccess: () => {
      router.push("/");
    },
  });
  const updateAccountMutation = trpc.useMutation(["user.updateProfile"]);

  return (
    <>
      <form
        onSubmit={handleSubmit((values) => {
          updateAccountMutation.mutate(values);
        })}
        className="pt-14"
      >
        <h1 className="font-serif text-4xl text-gray-900 ">Manage Profile</h1>
        {userData && (
          <Link href={`/user/${userData.slug}`}>
            <Button
              variant="subtle"
              rightIcon={<ExternalLink />}
              className="mb-7 mt-1 px-0"
            >
              Visit Profile
            </Button>
          </Link>
        )}
        <div className="flex flex-col gap-3">
          <div>
            <div className="flex justify-between">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <span className="text-sm text-gray-500" id="email-optional">
                Optional
              </span>
            </div>
            <div className="mt-1">
              <input
                type="email"
                placeholder="Change your email"
                className="w-full"
                {...register("email")}
              />
            </div>
          </div>
          <ErrorMessage
            errors={errors}
            name="email"
            render={({ message }) => (
              <p className="text-red-500 text-center">{message}</p>
            )}
          />
          <div>
            <div className="flex justify-between">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <span className="text-sm text-gray-500" id="email-optional">
                Optional
              </span>
            </div>
            <div className="mt-1">
              <input
                type="text"
                placeholder="Change your name"
                className="w-full"
                {...register("name")}
              />
            </div>
            <ErrorMessage
              errors={errors}
              name="name"
              render={({ message }) => (
                <p className="text-red-500 text-center">{message}</p>
              )}
            />
          </div>
        </div>
        <div className="flex mt-7 gap-4">
          <Button
            type="submit"
            disabled={!watch().email && !watch().name}
            loading={updateAccountMutation.isLoading}
          >
            Update Profile
          </Button>
          <Popover className="relative">
            <Popover.Button>
              <Button className="text-red-600 border-red-600" variant="outline">
                Delete Account
              </Button>
            </Popover.Button>
            <Popover.Panel className="absolute bg-white left-1/2 z-50 mt-3 -translate-x-1/2 transform p-4 lg:max-w-3xl border border-gray-200 shadow-lg shadow-gray-200 rounded-md">
              <div className="flex gap-4">
                <Button
                  variant="subtle"
                  compact
                  className="font-normal"
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  compact
                  type="button"
                  className="text-white bg-red-600"
                  loading={deleteAccountMutation.isLoading}
                  onClick={() => deleteAccountMutation.mutate()}
                >
                  Confirm
                </Button>
              </div>
            </Popover.Panel>
          </Popover>
        </div>
      </form>

      <Divider />
      <section className="grid grid-cols-1 gap-4">
        {collectionData?.collections.map(({ id, title, books }) => (
          <CollectionCard
            key={id}
            collectionId={id}
            title={title}
            user={collectionData.user}
            bookCovers={books.map(({ cover }) => cover)}
            handleRemove={() => deleteCollectionMutation.mutate({ id })}
          />
        ))}
      </section>
    </>
  );
};

export default Manage;
