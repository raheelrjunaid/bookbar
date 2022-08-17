import { createPortal } from "react-dom";
import { Dialog } from "@headlessui/react";
import { CircleCheck } from "tabler-icons-react";
import Button from "../Button";

export const ConfirmEmailSent = ({
  opened,
  setOpened,
}: {
  opened: boolean;
  setOpened: (state: boolean) => void;
}) => {
  return (
    <Dialog
      as="div"
      open={opened}
      className="fixed z-10 inset-0 overflow-y-auto"
      onClose={() => setOpened(false)}
    >
      <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

      <div className="h-full w-full flex items-center justify-center">
        <div className="bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:max-w-sm mx-5 sm:mx-0">
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CircleCheck size={26} className="text-green-600" />
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <Dialog.Title
                as="h3"
                className="text-lg leading-6 font-medium text-gray-900"
              >
                Email Sent
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Please check your inbox and click the link in the email to
                  sign in.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-6">
            <Button
              type="button"
              className="w-full"
              onClick={() => setOpened(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
