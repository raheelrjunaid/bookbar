import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { X } from "tabler-icons-react";
import BookSearch from "../../components/BookSearch";
import Button from "../../components/Button";

export const AddCollection: NextPage = () => {
  const router = useRouter();
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);

  console.log(selectedBooks);
  return (
    <>
      <section className="my-5">
        <Button
          variant="subtle"
          compact
          color="red"
          leftIcon={<X />}
          onClick={() => router.back()}
          className="text-red-500 px-0"
        >
          Cancel
        </Button>
      </section>

      <section>
        <h1 className="text-3xl font-serif text-gray-900 mb-5">
          Create New Collection
        </h1>
        <form className="flex flex-col gap-4 caret-purple-500">
          <input type="text" placeholder="Collection Name" />
          <textarea placeholder="Description" />
          <BookSearch
            addToCollection={(bookId) => {
              if (!bookId) return;
              if (selectedBooks.includes(bookId)) return;
              setSelectedBooks([...selectedBooks, bookId]);
            }}
          />
        </form>
      </section>
    </>
  );
};

export default AddCollection;
