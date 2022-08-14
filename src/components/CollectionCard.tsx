import Marquee from "react-fast-marquee";
import { trpc } from "../utils/trpc";
import Image from "next/image";
import Rating from "./Rating";
import Link from "next/link";
import HeartOutline from "../../public/heart-outline.svg";
import HeartFilled from "../../public/heart-filled.svg";

interface CollectionCardProps {
  bookCovers: (string | null)[];
  title: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  collectionId: string;
  avgRating: number;
}

export const CollectionCard = ({
  bookCovers,
  title,
  avgRating,
  user,
  collectionId,
}: CollectionCardProps) => {
  const utils = trpc.useContext();
  const { data: isFavourited, status: favouriteStatus } = trpc.useQuery([
    "collection.isFavourited",
    { collectionId },
  ]);
  const favouriteMutation = trpc.useMutation(["collection.toggleFavourite"], {
    onMutate() {
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
      <Marquee pauseOnHover gradientColor={[229, 231, 235]} gradientWidth={100}>
        {bookCovers.map((cover, index) => (
          <div className="shadow-md flex-none w-16 h-24 relative" key={index}>
            <Image
              src={(cover as string) || ""}
              layout="fill"
              objectFit="cover"
              objectPosition="center"
              alt={title}
            />
          </div>
        ))}
      </Marquee>
      <span className="flex z-10 top-2 right-2 items-center px-2.5 py-0.5 rounded-full text-xs shadow-md bg-gray-900/75 text-white absolute">
        {bookCovers.length} Books
      </span>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex-none w-10 aspect-square overflow-hidden rounded-full relative">
            <Image
              src={(user.image as string) || ""}
              layout="fill"
              objectPosition="center"
              objectFit="cover"
              alt={title}
            />
          </div>
          <div>
            <h2 className="font-medium text-gray-900 line-clamp-1">{title}</h2>
            <p className="text-gray-500 text-sm">{user.name}</p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          {avgRating ? (
            <Rating ratingValue={avgRating} />
          ) : (
            <p className="text-gray-300">No Ratings Yet</p>
          )}
          <div className="flex items-center gap-3">
            <Link href={`/collection/${collectionId}`} passHref>
              <a className="font-medium underline text-purple-600">View Full</a>
            </Link>
            {favouriteStatus === "success" && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
