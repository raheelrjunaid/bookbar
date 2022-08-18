import { trpc } from "../../utils/trpc";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Rating from "../../components/Rating";
import Button from "../../components/Button";
import { Heart, HeartOff, Trash } from "tabler-icons-react";
import { useSession } from "next-auth/react";
import Book from "../../components/Book";
import cloudinary from "../../utils/cloudinary";
import Alert from "../../components/Alert";
import Head from "next/head";

export default function Collection() {
  const router = useRouter();
  const collectionId = router.query.id as string;
  const { data: session, status: sessionStatus } = useSession();
  const utils = trpc.useContext();

  const { data, isLoading, isError, error } = trpc.useQuery([
    "collection.getById",
    { id: collectionId },
  ]);
  const { data: avgRating, isLoading: ratingLoading } = trpc.useQuery([
    "collection.getAverageRating",
    { collectionId },
  ]);
  const { data: isFavourited, status: favouriteStatus } = trpc.useQuery(
    ["collection.isFavourited", { collectionId }],
    {
      enabled: !!session,
    }
  );
  const { data: userRating } = trpc.useQuery(
    ["collection.getUserRating", { collectionId }],
    {
      enabled: !!session,
    }
  );

  const favouriteMutation = trpc.useMutation(["collection.toggleFavourite"], {
    async onMutate() {
      await utils.cancelQuery(["collection.isFavourited", { collectionId }]);
      utils.setQueryData(
        ["collection.isFavourited", { collectionId }],
        !isFavourited
      );
    },
    onSettled() {
      utils.invalidateQueries(["collection.isFavourited", { collectionId }]);
    },
  });
  const deleteMutation = trpc.useMutation(["collection.delete"], {
    onSettled() {
      router.push("/");
    },
  });
  const ratingMutation = trpc.useMutation(["collection.rate"], {
    async onMutate(newRating) {
      await utils.cancelQuery(["collection.getUserRating", { collectionId }]);
      utils.setQueryData(
        ["collection.getUserRating", { collectionId }],
        newRating
      );
    },
    onSettled() {
      utils.invalidateQueries([
        "collection.getAverageRating",
        { collectionId },
      ]);
    },
  });

  if (isLoading)
    return (
      <>
        <Head>
          <title>Loading collection...</title>
        </Head>
        <div className="mt-14 mb-3 h-10 w-full animate-pulse bg-gray-200" />
        <div className="mb-5 h-10 w-11/12 animate-pulse bg-gray-200" />
        <div className="mb-4 flex items-center gap-4">
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
          <div className="h-5 w-52 animate-pulse rounded-full bg-gray-200" />
        </div>
        <div className="mb-6 flex justify-between">
          <div className="h-14 w-32 animate-pulse bg-gray-200" />
          <div className="h-14 w-32 animate-pulse bg-gray-200" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div className="mb-2 h-5 w-full animate-pulse bg-gray-200" key={i} />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            className="h-42 mt-9 flex w-full gap-4 p-5 shadow-lg shadow-gray-200"
            key={i}
          >
            <div className="h-20 w-16 animate-pulse bg-gray-200" />
            <div className="flex grow flex-col items-start gap-2">
              <div className="h-4 w-full animate-pulse bg-gray-200" />
              <div className="mb-3 h-4 w-1/2 animate-pulse bg-gray-200" />
              <div className="mb-3  h-4 w-1/2 animate-pulse bg-gray-200" />
              <div className="h-3 w-1/2 animate-pulse bg-gray-200" />
              <div className="h-3 w-1/2 animate-pulse bg-gray-200" />
            </div>
          </div>
        ))}
      </>
    );

  if (isError) return <Alert message={error.message} showAction />;

  if (!data) return <Alert message="Collection not found" showAction />;

  return (
    <>
      <Head>
        <title>{data.title}</title>
      </Head>
      <section className="relative grid grid-cols-1 place-items-start gap-6 py-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="relative sm:sticky sm:top-10">
          <h1 className="font-serif text-4xl text-gray-900">{data.title}</h1>
          <div className="mb-3 mt-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href={`/user/${data.user.slug}`}>
                <div className="relative aspect-square w-10 flex-none cursor-pointer overflow-hidden rounded-full">
                  <Image
                    src={
                      data.user.image ||
                      cloudinary
                        .image(`bookbar/${data.user.id}-profile-image`)
                        .toURL() ||
                      "/image-not-found"
                    }
                    layout="fill"
                    objectPosition="center"
                    objectFit="cover"
                    alt={data.user.name || "User"}
                  />
                </div>
              </Link>
              <Link href={`/user/${data.user.slug}`} passHref>
                <a className="text-gray-500 hover:underline">
                  By: {data.user.name}
                </a>
              </Link>
            </div>
            {!!session &&
            favouriteStatus === "success" &&
            data.user.id !== session?.user?.id ? (
              <Button
                onClick={() => favouriteMutation.mutate({ collectionId })}
                rightIcon={isFavourited ? <HeartOff /> : <Heart />}
                loading={favouriteMutation.isLoading}
                compact
                className={`rounded-full
              ${
                isFavourited
                  ? "bg-gray-200 text-gray-800 !ring-gray-200 hover:bg-gray-300 hover:shadow-none"
                  : "bg-red-200 !text-red-800 !ring-red-200 hover:bg-red-300 hover:shadow-none"
              }
              `}
              >
                {isFavourited ? "Unfavourite" : "Favourite"}
              </Button>
            ) : (
              <Button
                onClick={() => deleteMutation.mutate({ id: collectionId })}
                rightIcon={<Trash />}
                loading={deleteMutation.isLoading}
                compact
                className="rounded-full bg-red-600 hover:bg-red-700 hover:shadow-none focus:ring-red-500"
              >
                Delete
              </Button>
            )}
          </div>
          <div className="my-4 flex justify-between gap-3">
            <div>
              <p>
                {avgRating?._count.rating} rating
                {avgRating?._count.rating === 1 ? "" : "s"}
              </p>
              {!ratingLoading ? (
                <Rating
                  ratingValue={avgRating?._avg.rating || 0}
                  readonly
                  size={22}
                />
              ) : (
                <p className="text-gray-300">Loading Ratings</p>
              )}
            </div>
            <div className="text-right">
              {sessionStatus !== "loading" && (
                <>
                  <p>Your Rating</p>
                  <Rating
                    ratingValue={userRating?.rating || 0}
                    fillColor="#4b5563"
                    readonly={data.user.id === session?.user?.id}
                    size={22}
                    onClick={(value) => {
                      if (!session) return router.push("/api/auth/signin");
                      ratingMutation.mutate({
                        rating: value / 20,
                        collectionId,
                      });
                    }}
                    className="!text-gray-600"
                  />
                </>
              )}
            </div>
          </div>
          <p className="text-lg font-light">{data.description}</p>
        </div>
        {data.books && (
          <div className="col-span-1 grid grid-cols-1 gap-6  lg:col-span-2 lg:grid-cols-2 xl:col-span-3 xl:grid-cols-3">
            {data.books.map((book) => (
              <Book
                key={book.id}
                link={book.link}
                id={book.id}
                cover={book.cover as string | undefined}
                title={book.title}
                authors={book.authors as string | undefined}
                avgRating={book.avgRating as number | undefined}
                description={book.description as string | undefined}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
