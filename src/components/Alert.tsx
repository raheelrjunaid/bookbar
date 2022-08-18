import Link from "next/link";
import { X } from "tabler-icons-react";
import Button from "./Button";

export const Alert = ({
  message,
  showAction,
}: {
  message: string;
  showAction?: boolean;
}) => {
  return (
    <div className="mt-14 rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <X className="text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3 space-y-3">
          <h3 className="font-medium text-red-800">Error: {message}</h3>
          {showAction && (
            <Link href="/" passHref>
              <Button
                size="sm"
                variant="subtle"
                className="rounded-md bg-red-100 text-red-800 ring-red-700"
              >
                Back to Home
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alert;
