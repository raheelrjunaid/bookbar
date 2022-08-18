import Marquee from "react-fast-marquee";
import { trpc } from "../utils/trpc";
import Image from "next/image";
import Rating from "./Rating";
import Link from "next/link";
import HeartOutline from "../../public/heart-outline.svg";
import HeartFilled from "../../public/heart-filled.svg";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Trash } from "tabler-icons-react";
import Highlighter from "react-highlight-words";
import cloudinary from "../utils/cloudinary";
import { CollectionCardLoader } from "./loaders/CollectionCardLoader";
import { User } from "@prisma/client";

interface CollectionCardProps {
  bookCovers: (string | null)[];
  searchQuery?: string;
  title: string;
  user: User;
  collectionId: string;
  handleRemove: () => void;
}

export const CollectionCard = ({
  bookCovers,
  searchQuery,
  title,
  user,
  collectionId,
  handleRemove,
}: CollectionCardProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const utils = trpc.useContext();

  // Make sure all book covers exist
  let newBookCovers = bookCovers.filter(
    (cover) => typeof cover === "string"
  ) as string[];
  // Ensure book covers repeat to take up space (of 10 books)
  if (bookCovers.length < 10)
    Array.from({ length: 10 - newBookCovers.length }).forEach(
      (_, index: number) => newBookCovers.push(newBookCovers[index] as string)
    );

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
    <div className="flex flex-col shadow-lg shadow-gray-200 border border-t-0 border-gray-200 relative">
      <Marquee gradientColor={[229, 231, 235]} gradientWidth={0}>
        {newBookCovers.map((cover, index) => (
          <div className="shadow-md flex-none w-16 h-24 relative" key={index}>
            <Image
              src={cover}
              layout="fill"
              objectFit="cover"
              objectPosition="center"
              alt={title}
            />
          </div>
        ))}
      </Marquee>
      <span className="flex z-10 top-2 right-2 items-center px-2.5 py-0.5 rounded-full text-xs shadow-md bg-gray-900/75 text-white absolute">
        {bookCovers.length} Book{bookCovers.length === 1 ? "" : "s"}
      </span>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-3">
          <Link href={`/user/${user.slug}`}>
            <div className="flex-none w-10 aspect-square overflow-hidden rounded-full relative cursor-pointer">
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
              <a className="font-medium text-gray-900 line-clamp-1 hover:underline -mb-1">
                <Highlighter
                  highlightClassName="bg-gradient-to-t from-yellow-200 to-yellow-100 rounded-sm border border-yellow-200"
                  searchWords={searchQuery?.split(" ") || []}
                  autoEscape={true}
                  textToHighlight={title}
                />
              </a>
            </Link>
            <Link href={`/user/${user.slug}`} passHref>
              <a className="text-gray-500 text-sm hover:underline">
                {user.name}
              </a>
            </Link>
          </div>
        </div>
        <div className="flex justify-between items-center">
          {avgRating?._avg.rating ? (
            <Rating readonly ratingValue={avgRating._avg.rating} />
          ) : ratingLoading ? (
            <p className="text-gray-300">Loading Ratings</p>
          ) : (
            <p className="text-gray-300">No Ratings Yet</p>
          )}
          <div className="flex items-center gap-3">
            <Link href={`/collection/${collectionId}`} passHref>
              <a className="font-medium hover:underline text-purple-600">
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
