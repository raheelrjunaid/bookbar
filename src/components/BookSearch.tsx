import React from "react";
import { useState } from "react";
import { Combobox } from "@headlessui/react";
import { Search } from "tabler-icons-react";
import { useQuery } from "react-query";
import debounce from "just-debounce-it";
import Image from "next/image";

export const BookSearch = ({
  addToCollection,
}: {
  addToCollection: (id: string) => void;
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
        <Combobox.Options className="absolute mt-1 w-full overflow-hidden rounded-md shadow-lg shadow-gray-300/50 border border-gray-200">
          {isLoading || !data ? (
            <div className="py-2 px-4 bg-gray-100">Loading...</div>
          ) : (
            data.items.map(
              ({
                volumeInfo: {
                  title,
                  description,
                  imageLinks: { smallThumbnail },
                },
                id,
              }: {
                id: string;
                volumeInfo: {
                  title: string;
                  description: string;
                  imageLinks: { smallThumbnail: string };
                };
              }) => (
                <Combobox.Option
                  key={id}
                  className={({ active }) =>
                    `relative cursor-pointer min-h-[5rem] py-2 px-4 ${
                      active && "bg-purple-600 text-white"
                    }`
                  }
                  value={id}
                >
                  {({ active }) => (
                    <div className="flex items-center gap-4">
                      {smallThumbnail && (
                        <div className="shadow-md flex-none w-10">
                          <Image
                            src={smallThumbnail}
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
    </Combobox>
  );
};

export default BookSearch;
