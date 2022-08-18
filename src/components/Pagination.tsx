import { useRouter } from "next/router";
import Button from "./Button";
import { ArrowRight, ArrowLeft } from "tabler-icons-react";

export const Pagination = ({
  totalPages,
  pageNumber,
  basePath,
}: {
  totalPages: number;
  pageNumber: number;
  basePath: string;
}) => {
  const router = useRouter();

  if (!pageNumber || !totalPages || !basePath) return null;

  return (
    <nav
      className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
      aria-label="Pagination"
    >
      {pageNumber !== 1 ? (
        <Button
          leftIcon={<ArrowLeft />}
          variant="subtle"
          className="px-0 text-gray-500"
          onClick={() => router.push(`${basePath}pageNumber=${pageNumber - 1}`)}
        >
          Previous
        </Button>
      ) : (
        <div></div>
      )}
      {pageNumber !== totalPages ? (
        <Button
          rightIcon={<ArrowRight />}
          variant="subtle"
          className="px-0 text-gray-500"
          onClick={() => router.push(`${basePath}pageNumber=${pageNumber + 1}`)}
        >
          Next
        </Button>
      ) : (
        <div></div>
      )}
    </nav>
  );
};

export default Pagination;
