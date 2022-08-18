import React from "react";
import { useState } from "react";
import { Combobox } from "@headlessui/react";
import { Search } from "tabler-icons-react";
import { useQuery } from "react-query";
import debounce from "just-debounce-it";
import Image from "next/image";
import BookProps from "../types/bookProps";

interface GoogleBooksAPIResult {
  id: string;
  volumeInfo: {
    title: string;
    description?: string;
    imageLinks?: { smallThumbnail: string };
    canonicalVolumeLink: string;
    authors?: string[];
    averageRating: number;
  };
}

export const BookSearch = ({
  addToCollection,
}: {
  addToCollection: (props: BookProps) => void;
}) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { data, isLoading } = useQuery(
    ["books", debouncedQuery],
    async () => {
      if (!debouncedQuery) return;
      const res = await fetch(
        "https://www.googleapis.com/books/v1/volumes?q=" +
          new URLSearchParams({ q: query, maxResults: "3" }).toString()
      );
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    },
    {
      keepPreviousData: true,
    }
  );

  return (
    <Combobox value={null} onChange={addToCollection} nullable>
      <div className="relative">
        <Combobox.Input
          className="w-full pl-9 peer"
          placeholder="Search for a book..."
          onChange={(event) => {
            if (!event.target.value) return;
            setQuery(event.target.value);
            debounce(
              (value: string) => (value ? setDebouncedQuery(value) : null),
              200
            )(event.target.value);
          }}
          displayValue={() => ""}
        />
        <Combobox.Button className="absolute inset-y-0 left-2.5 peer-focus:text-purple-500 text-gray-400">
          <Search aria-hidden="true" size={22} />
        </Combobox.Button>
        <Combobox.Options className="bg-white absolute mt-1 w-full z-10 overflow-hidden rounded-md shadow-lg shadow-gray-300/50 border border-gray-200">
          {isLoading || !data ? (
            <div className="py-2 px-4 bg-gray-100">Loading...</div>
          ) : (
            data.items.map(
              ({
                id,
                volumeInfo: {
                  title,
                  description,
                  imageLinks,
                  authors,
                  canonicalVolumeLink,
                  averageRating,
                },
              }: GoogleBooksAPIResult) => (
                <Combobox.Option
                  key={id}
                  className={({ active }) =>
                    `relative cursor-pointer min-h-[5rem] py-2 px-4 ${
                      active && "bg-purple-600 text-white"
                    }`
                  }
                  value={
                    {
                      id,
                      title,
                      description,
                      authors: authors?.join(", "),
                      avgRating: averageRating,
                      cover: imageLinks?.smallThumbnail,
                      link: canonicalVolumeLink,
                    } as BookProps
                  }
                >
                  {({ active }) => (
                    <div className="flex items-center gap-4">
                      {imageLinks?.smallThumbnail && (
                        <div className="shadow-md flex-none w-10">
                          <Image
                            src={imageLinks.smallThumbnail}
                            layout="responsive"
                            width={50}
                            height={80}
                            alt={title}
                          />
                        </div>
                      )}
                      <div>
                        <span className="font-semibold line-clamp-1">
                          {title}
                        </span>
                        <p
                          className={`line-clamp-1 text-gray-500 text-sm ${
                            active && "text-inherit"
                          }`}
                        >
                          {description}
                        </p>
                      </div>
                    </div>
                  )}
                </Combobox.Option>
              )
            )
          )}
        </Combobox.Options>
      </div>
      <p className="-mt-3 text-sm text-gray-500">
        Powered by{" "}
        <a
          className="text-purple-500 hover:underline"
          rel="noopener noreferrer"
          target="_blank"
          href="http://books.google.com/"
        >
          Google Books
        </a>
      </p>
    </Combobox>
  );
};

export default BookSearch;
