import { NextPage } from "next";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { Check } from "tabler-icons-react";
import BookSearch from "../../components/BookSearch";
import Button from "../../components/Button";
import Book from "../../components/Book";
import BookProps from "../../types/bookProps";
import { trpc } from "../../utils/trpc";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Head from "next/head";
import { useSession } from "next-auth/react";

export const AddCollection: NextPage = () => {
  const router = useRouter();
  const collectionMutation = trpc.useMutation(["collection.create"], {
    onSuccess({ id }) {
      window.localStorage.removeItem("selectedBooks");
      window.localStorage.removeItem("collectionTitle");
      window.localStorage.removeItem("collectionDescription");
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
  const { data: _session } = useSession({
    required: true,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const books = JSON.parse(localStorage.getItem("selectedBooks") || "[]");
      setSelectedBooks(books);
    }
  }, []);

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
          onSubmit={handleSubmit(
            onSubmit as { title: string } & SubmitHandler<FieldValues>
          )}
        >
          <h1 className="mb-3 font-serif text-4xl text-gray-900">
            Create New Collection
          </h1>
          <input
            type="text"
            defaultValue={
              (typeof window !== "undefined" &&
                localStorage.getItem("collectionTitle")) ||
              ""
            }
            placeholder="Collection Name"
            {...register("title", {
              required: "Collection title is required",
              maxLength: 20,
            })}
            onChange={(e) => {
              if (typeof window !== "undefined") {
                localStorage.setItem("collectionTitle", e.target.value);
              }
              register("title").onChange(e);
            }}
          />
          {errors.title && (
            <p className="text-center text-red-500">
              {errors.title.message as ReactNode}
            </p>
          )}
          <textarea
            placeholder="Description"
            {...register("description")}
            onChange={(e) => {
              if (typeof window !== "undefined") {
                localStorage.setItem("collectionDescription", e.target.value);
              }
              register("description").onChange(e);
            }}
          />
          <BookSearch
            addToCollection={(bookData: BookProps) => {
              if (!bookData) return;
              if (selectedBooks.length > 0)
                if (selectedBooks.find((b) => b.id === bookData.id)) return; // Book already added
              clearErrors("books");
              setSelectedBooks([...selectedBooks, bookData]);
              if (typeof window !== "undefined")
                window.localStorage.setItem(
                  "selectedBooks",
                  JSON.stringify([...selectedBooks, bookData])
                );
            }}
          />
          {errors.books && (
            <p className="text-center text-red-500">
              {errors.books.message as ReactNode}
            </p>
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
          {selectedBooks.length > 0 ? (
            selectedBooks.map((book: BookProps) => (
              <Book
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author}
                cover_key={book.cover_key}
                subtitle={book.subtitle}
                handleRemove={() => {
                  setSelectedBooks(
                    selectedBooks.filter((b) => b.id !== book.id)
                  );
                }}
              />
            ))
          ) : (
            <h2 className="col-span-full text-center text-gray-700">
              Don&apos;t be shy... import some books!
            </h2>
          )}
        </div>
      </section>
    </>
  );
};

export default AddCollection;
