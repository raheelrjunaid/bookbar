import React, { useEffect } from "react";
import { trpc } from "../../utils/trpc";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Rating from "../../components/Rating";
import Button from "../../components/Button";
import { Heart, HeartOff } from "tabler-icons-react";
import { useSession } from "next-auth/react";
import Divider from "../../components/Divider";
import Book from "../../components/Book";
import cloudinary from "../../utils/cloudinary";
import Alert from "../../components/Alert";

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
        <div className="h-10 w-full bg-gray-200 animate-pulse mt-14 mb-3" />
        <div className="h-10 w-11/12 bg-gray-200 animate-pulse mb-5" />
        <div className="flex items-center gap-4 mb-4">
          <div className="rounded-full h-10 w-10 bg-gray-200 animate-pulse" />
          <div className="h-5 rounded-full w-52 bg-gray-200 animate-pulse" />
        </div>
        <div className="flex justify-between mb-6">
          <div className="h-14 w-32 bg-gray-200 animate-pulse" />
          <div className="h-14 w-32 bg-gray-200 animate-pulse" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div className="h-5 mb-2 w-full bg-gray-200 animate-pulse" key={i} />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            className="h-42 w-full flex mt-9 p-5 gap-4 shadow-lg shadow-gray-200"
            key={i}
          >
            <div className="h-20 w-16 bg-gray-200 animate-pulse" />
            <div className="grow flex flex-col gap-2 items-start">
              <div className="h-4 w-full bg-gray-200 animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-200 animate-pulse mb-3" />
              <div className="h-4  w-1/2 bg-gray-200 animate-pulse mb-3" />
              <div className="h-3 w-1/2 bg-gray-200 animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-200 animate-pulse" />
            </div>
          </div>
        ))}
      </>
    );

  if (isError) return <Alert message={error.message} showAction />;

  if (!data) return <Alert message="Collection not found" showAction />;

  return (
    <>
      <section className="py-10">
        <h1 className="font-serif font-bold text-4xl text-gray-900">
          {data.title}
        </h1>
        <div className="flex items-center gap-3 mb-3 mt-5 justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/user/${data.user.slug}`}>
              <div className="flex-none w-10 aspect-square overflow-hidden rounded-full relative cursor-pointer">
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
            data.user.id !== session?.user?.id && (
              <Button
                variant="primary"
                onClick={() => favouriteMutation.mutate({ collectionId })}
                rightIcon={isFavourited ? <HeartOff /> : <Heart />}
                compact
                className={`rounded-full
              ${
                isFavourited
                  ? "bg-gray-200 text-gray-800"
                  : "bg-red-200 !text-red-800"
              }
              `}
              >
                {isFavourited ? "Unfavourite" : "Favourite"}
              </Button>
            )}
        </div>
        <div className="flex justify-between gap-3 my-4">
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
        <p className="font-light text-lg">{data.description}</p>
        <Divider />
        {data.books && (
          <div className="flex flex-col gap-3">
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
