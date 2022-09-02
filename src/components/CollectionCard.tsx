import { trpc } from "../utils/trpc";
import Image from "next/image";
import Rating from "./Rating";
import Link from "next/link";
import HeartOutline from "../../public/heart-outline.svg";
import HeartFilled from "../../public/heart-filled.svg";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ExternalLink, Trash } from "tabler-icons-react";
import Highlighter from "react-highlight-words";
import cloudinary from "../utils/cloudinary";
import { CollectionCardLoader } from "./loaders/CollectionCardLoader";
import { Book, User } from "@prisma/client";

interface CollectionCardProps {
  books: Book[];
  searchQuery?: string;
  title: string;
  user: User;
  collectionId: string;
  handleRemove: () => void;
}

export const CollectionCard = ({
  books,
  searchQuery,
  title,
  user,
  collectionId,
  handleRemove,
}: CollectionCardProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const utils = trpc.useContext();

  const { data: isFavourited, status: favouriteStatus } = trpc.useQuery(
    ["collection.isFavourited", { collectionId }],
    {
      enabled: !!(session && session.user),
    }
  );
  const { data: avgRating, isLoading: ratingLoading } = trpc.useQuery([
    "collection.getAverageRating",
    { collectionId },
  ]);
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

  return (
    <div className="relative flex flex-col border border-t-0 border-gray-200 shadow-md shadow-gray-100 transition hover:shadow-lg">
      <div className="relative flex overflow-x-hidden">
        {books.map((book, index) => (
          <div className="group relative" key={index}>
            <div className="relative h-24 w-16 flex-none cursor-pointer transition  group-hover:brightness-50">
              <Image
                src={book.cover || "/image-not-found"}
                layout="fill"
                objectFit="cover"
                objectPosition="center"
                alt={title}
              />
            </div>
            <a
              href={book.link}
              rel="noreferrer"
              target="_blank"
              className="absolute inset-0 flex items-center justify-center text-white opacity-0 transition group-hover:opacity-100"
            >
              <ExternalLink size={24} />
            </a>
          </div>
        ))}
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            className="h-24 w-16 flex-none bg-gradient-to-tl from-gray-200"
            key={index}
          />
        ))}
        <span className="absolute inset-y-0 right-0 z-10 flex items-center bg-gradient-to-l from-gray-800/70 to-gray-700/50 px-4 text-white backdrop-blur-sm">
          {books.length} Book{books.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center gap-3">
          <Link href={`/user/${user.slug}`}>
            <div className="relative aspect-square w-10 flex-none cursor-pointer overflow-hidden rounded-full">
              <Image
                src={
                  user.image ||
                  cloudinary
                    .image(`bookbar/${user.id}-profile-image`)
                    .toURL() ||
                  "/image-not-found"
                }
                layout="fill"
                objectPosition="center"
                objectFit="cover"
                alt={user.name || "User"}
              />
            </div>
          </Link>
          <div>
            <Link href={`/collection/${collectionId}`} passHref>
              <a className="-mb-1 font-medium text-gray-900 line-clamp-1 hover:underline">
                <Highlighter
                  highlightClassName="bg-gradient-to-t from-yellow-200 to-yellow-100 rounded-sm border border-yellow-200"
                  searchWords={searchQuery?.split(" ") || []}
                  autoEscape={true}
                  textToHighlight={title}
                />
              </a>
            </Link>
            <Link href={`/user/${user.slug}`} passHref>
              <a className="text-sm text-gray-500 hover:underline">
                {user.name}
              </a>
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-between">
          {avgRating?._avg.rating ? (
            <Rating readonly ratingValue={avgRating._avg.rating} />
          ) : ratingLoading ? (
            <p className="text-gray-300">Loading Ratings</p>
          ) : (
            <p className="text-gray-300">No Ratings Yet</p>
          )}
          <div className="flex items-center gap-3">
            <Link href={`/collection/${collectionId}`} passHref>
              <a className="font-medium text-purple-600 hover:underline">
                View Full
              </a>
            </Link>
            {!session ? (
              <Image
                src={HeartOutline}
                onClick={() => {
                  router.push("/api/auth/signin");
                }}
                width={20}
                height={20}
                className="cursor-pointer"
                alt="Favourite"
              />
            ) : session.user?.id === user.id ? (
              <Trash
                className="cursor-pointer text-red-500"
                onClick={() => {
                  handleRemove();
                }}
              />
            ) : (
              favouriteStatus === "success" && (
                <Image
                  src={isFavourited ? HeartFilled : HeartOutline}
                  onClick={() => {
                    favouriteMutation.mutate({ collectionId });
                  }}
                  width={20}
                  height={20}
                  className="cursor-pointer"
                  alt="Favourite"
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

CollectionCard.Loading = CollectionCardLoader;
