import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { Check, X } from "tabler-icons-react";
import BookSearch from "../../components/BookSearch";
import Button from "../../components/Button";
import Book from "../../components/Book";
import Divider from "../../components/Divider";
import BookProps from "../../types/bookProps";
import { trpc } from "../../utils/trpc";
import { useForm } from "react-hook-form";
import Head from "next/head";

export const AddCollection: NextPage = () => {
  const router = useRouter();
  const collectionMutation = trpc.useMutation(["collection.create"], {
    onSuccess({ id }) {
      router.push(`/collection/${id}`);
    },
  });
  const [selectedBooks, setSelectedBooks] = useState<BookProps[]>([]);
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  const onSubmit = ({
    title,
    description,
  }: {
    title: string;
    description?: string;
  }) => {
    if (!selectedBooks.length) {
      setError("books", {
        type: "required",
        message: "Please select at least one book",
      });
      return;
    }
    collectionMutation.mutate({
      title,
      description: description || "",
      books: selectedBooks,
    });
  };

  return (
    <>
      <Head>
        <title>Add Collection</title>
      </Head>
      <section className="mt-14 grid grid-cols-1 items-start gap-6 md:grid-cols-2 xl:grid-cols-3 ">
        <form
          className="relative flex flex-col gap-4 caret-purple-500 md:sticky md:top-10"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h1 className="mb-3 font-serif text-4xl text-gray-900">
            Create New Collection
          </h1>
          <input
            type="text"
            placeholder="Collection Name"
            {...register("title", {
              required: "Collection title is required",
              maxLength: 20,
            })}
          />
          {errors.title && (
            <p className="text-center text-red-500">{errors.title.message}</p>
          )}
          <textarea placeholder="Description" {...register("description")} />
          <BookSearch
            addToCollection={(bookData: BookProps) => {
              if (!bookData) return;
              if (selectedBooks.length > 0)
                if (selectedBooks.find((b) => b.id === bookData.id)) return;
              clearErrors("books");
              setSelectedBooks([...selectedBooks, bookData]);
            }}
          />
          {errors.books && (
            <p className="text-center text-red-500">{errors.books.message}</p>
          )}
          <div className="flex justify-center ">
            <Button
              size="lg"
              rightIcon={<Check />}
              loading={collectionMutation.isLoading}
              type="submit"
            >
              Publish
            </Button>
          </div>
        </form>
        <div className="grid grid-cols-1 gap-6 xl:col-span-2 xl:grid-cols-2">
          {selectedBooks.map((book: BookProps) => (
            <Book
              key={book.id}
              id={book.id}
              title={book.title}
              authors={book.authors}
              avgRating={book.avgRating}
              cover={book.cover}
              link={book.link}
              description={book.description}
              handleRemove={() => {
                setSelectedBooks(selectedBooks.filter((b) => b.id !== book.id));
              }}
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default AddCollection;
