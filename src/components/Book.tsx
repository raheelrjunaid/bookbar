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
    <div className="shadow-lg shadow-gray-100 border border-gray-200 flex gap-4 p-4">
      <div className="flex-shrink-0 z-0">
        <div className="shadow-md flex-none w-16">
          <Image
            src={cover}
            layout="responsive"
            width={50}
            height={80}
            alt={title}
          />
        </div>
      </div>

      <div className="text-gray-900">
        <h4 className="text-lg font-semibold leading-snug mb-1">{title}</h4>
        {authors && (
          <p className="text-sm text-gray-600 mb-1">By: {authors.join(", ")}</p>
        )}
        {avgRating && <Rating ratingValue={avgRating * 2 * 10} />}
        {description && <p className="line-clamp-2 mt-2">{description}</p>}
        <div className="flex mt-3 items-center">
          <Link href={link} passHref>
            <Button
              compact
              variant="subtle"
              rightIcon={<ExternalLink />}
              className="underline underline-offset-1 text-purple-500 px-0"
            >
              View Full
            </Button>
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
