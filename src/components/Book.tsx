import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Trash } from "tabler-icons-react";
import Button from "./Button";
import BookProps from "../types/bookProps";
import Rating from "./Rating";

export const Book = ({
  cover,
  title,
  authors,
  avgRating,
  link,
  description,
  handleRemove,
}: BookProps) => {
  return (
    <div className="shadow-lg shadow-gray-200 border border-gray-200 flex gap-4 p-4">
      <div className="flex-shrink-0 z-0">
        <div className="shadow-md flex-none w-16 h-24 relative">
          <Image
            src={cover || "/image-not-found"}
            layout="fill"
            objectFit="cover"
            objectPosition="center"
            alt={title}
          />
        </div>
      </div>

      <div className="text-gray-900">
        <Link href={link} passHref>
          <a
            className="text-lg font-semibold leading-snug mb-1 hover:underline"
            target="_blank"
          >
            {title}
          </a>
        </Link>
        {authors && <p className="text-sm text-gray-600 mb-1">By: {authors}</p>}
        {avgRating && <Rating ratingValue={avgRating} readonly />}
        {description && <p className="line-clamp-2 mt-2">{description}</p>}
        <div className="flex mt-3 items-center">
          <Link href={link} passHref>
            <a target="_blank">
              <Button
                compact
                variant="subtle"
                rightIcon={<ExternalLink />}
                className="underline underline-offset-1 text-purple-600 !pl-0"
              >
                View Full
              </Button>
            </a>
          </Link>
          {handleRemove && (
            <Button
              onClick={handleRemove}
              variant="subtle"
              className="text-red-500"
              rightIcon={<Trash />}
              compact
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Book;
