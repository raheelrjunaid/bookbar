import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Trash } from "tabler-icons-react";
import Button from "./Button";
import BookProps from "../types/bookProps";

export const Book = ({
  id,
  title,
  cover_key,
  author,
  subtitle,
  handleRemove,
}: BookProps) => {
  return (
    <div className="flex gap-4 border border-gray-200 p-4 shadow-md shadow-gray-100 transition hover:shadow-lg">
      <div className="z-0 flex-shrink-0">
        <div className="relative h-24 w-16 flex-none shadow-md">
          <Image
            src={
              `https://covers.openlibrary.org/b/OLID/${
                cover_key || id
              }-M.jpg` || "/image-not-found"
            }
            layout="fill"
            objectFit="cover"
            objectPosition="center"
            alt={title}
          />
        </div>
      </div>

      <div className="text-gray-900">
        <Link href={`https://openlibrary.org/works/${id}`} passHref>
          <a
            className="mb-1 text-lg font-semibold leading-snug hover:underline"
            target="_blank"
          >
            {title}
          </a>
        </Link>
        <p className="mb-1 text-sm text-gray-600">By: {author}</p>
        {subtitle && <p className="mt-2 line-clamp-2">{subtitle}</p>}
        <div className="mt-3 flex items-center">
          <Link href={`https://openlibrary.org/works/${id}`} passHref>
            <a target="_blank">
              <Button
                compact
                variant="subtle"
                rightIcon={<ExternalLink />}
                className="!pl-0 text-purple-600 underline-offset-1 hover:underline"
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
