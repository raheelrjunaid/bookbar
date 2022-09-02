import React from "react";
import { useState } from "react";
import { Combobox } from "@headlessui/react";
import { Search } from "tabler-icons-react";
import { useQuery } from "react-query";
import { debounce } from "radash";
import Image from "next/image";
import BookProps from "../types/bookProps";

interface OpenLibraryAPIResult {
  lending_edition_s: string;
  subtitle: string;
  title: string;
  author_name?: string[];
  cover_edition_key?: string;
  [key: string]: any;
}

export const BookSearch = ({
  addToCollection,
}: {
  addToCollection: (props: BookProps) => void;
}) => {
  const [query, setQuery] = useState("");
  const { data, isLoading } = useQuery(
    ["books", query],
    async () => {
      if (!query) return;
      const res = await fetch(
        "https://openlibrary.org/search.json?" +
          new URLSearchParams({
            q: query,
            limit: "3",
            _spellcheck_count: "0",
            mode: "everything",
          }).toString()
      );
      if (!res.ok) {
        console.error(res);
      }
      return res.json();
    },
    {
      keepPreviousData: true,
    }
  );

  return (
    <Combobox
      value={null}
      onChange={addToCollection}
      nullable
      as="div"
      className="flex flex-col gap-1"
    >
      <div className="relative">
        <Combobox.Input
          className="peer w-full pl-9"
          placeholder="Search for a book..."
          onChange={debounce({ delay: 200 }, (event) => {
            if (!event.target.value) return;
            setQuery(event.target.value);
          })}
          displayValue={() => ""}
        />
        <Combobox.Button className="absolute inset-y-0 left-2.5 text-gray-400 peer-focus:text-purple-500">
          <Search aria-hidden="true" size={22} />
        </Combobox.Button>
        <Combobox.Options className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg shadow-gray-300/50">
          {isLoading || !data ? (
            <div className="bg-gray-100 py-2 px-4">Loading...</div>
          ) : (
            data.docs.map(
              ({
                lending_edition_s,
                subtitle,
                title,
                author_name,
                cover_edition_key,
              }: OpenLibraryAPIResult) => (
                <Combobox.Option
                  key={lending_edition_s}
                  className={({ active }) =>
                    `relative min-h-[5rem] cursor-pointer py-2 px-4 ${
                      active && "bg-purple-600 text-white"
                    }`
                  }
                  value={
                    {
                      title,
                      id: lending_edition_s,
                      subtitle,
                      author: author_name?.[0],
                      cover_key: cover_edition_key,
                    } as BookProps
                  }
                >
                  {({ active }) => (
                    <div className="flex items-center gap-4">
                      <div className="w-10 flex-none shadow-md">
                        <Image
                          src={
                            `https://covers.openlibrary.org/b/OLID/${
                              cover_edition_key || lending_edition_s
                            }-S.jpg` || "/image-not-found"
                          }
                          layout="responsive"
                          width={50}
                          height={80}
                          alt={title}
                        />
                      </div>
                      <div>
                        <span className="font-semibold line-clamp-1">
                          {title}
                        </span>
                        <p
                          className={`text-sm text-gray-500 line-clamp-1 ${
                            active && "text-inherit"
                          }`}
                        >
                          {subtitle && subtitle + " "}by{" "}
                          {author_name?.[0] || "N/A"}
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
      <p className="text-sm text-gray-500">
        Powered by{" "}
        <a
          className="text-purple-500 hover:underline"
          rel="noopener noreferrer"
          target="_blank"
          href="http://openlibrary.org"
        >
          Open Library
        </a>
      </p>
    </Combobox>
  );
};

export default BookSearch;
