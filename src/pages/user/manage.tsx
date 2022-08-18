import { NextPage } from "next";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import Button from "../../components/Button";
import { trpc } from "../../utils/trpc";
import { useRouter } from "next/router";
import { Edit, ExternalLink } from "tabler-icons-react";
import Link from "next/link";
import { Popover } from "@headlessui/react";
import Image from "next/image";
import cloudinary from "../../utils/cloudinary";
import { useEffect, useState } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";

export const Manage: NextPage = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    watch,
  } = useForm();
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { data: _session } = useSession({
    required: true,
  });

  const filePreviewHandler = (fileArray: FileList | null) => {
    if (fileArray?.length) {
      const file = fileArray[0] as File;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const image = reader.result as string;
        setPreviewImage(image);
      };
    }
  };

  const { data: userData } = trpc.useQuery(["user.getUser"]);
  const deleteAccountMutation = trpc.useMutation("user.delete", {
    onSuccess: () => {
      router.push("/");
    },
  });
  const updateAccountMutation = trpc.useMutation(["user.updateProfile"]);

  return (
    <>
      <Head>
        <title>Manage Account | BookBar</title>
      </Head>
      <form
        onSubmit={handleSubmit(({ image: images, ...rest }) => {
          if (images.length) {
            const image = images[0] as File;

            if (image.size > 1000000) {
              setError("image", {
                type: "custom",
                message: "Image must be less than 1MB.",
              });
              return;
            }

            type unionImageType =
              | "image/jpeg"
              | "image/jpg"
              | "image/png"
              | "image/webp";

            const reader = new FileReader();
            reader.readAsDataURL(image);
            reader.onload = () => {
              const bytes = reader.result as string;

              updateAccountMutation.mutate({
                image: {
                  type: image.type as unionImageType,
                  size: image.size,
                  bytes,
                },
                ...rest,
              });
            };
            return;
          }
          updateAccountMutation.mutate({
            ...rest,
          });
        })}
        className="mx-auto max-w-sm pt-14"
      >
        <div className="mb-7 flex items-center justify-between ">
          <div className="grow">
            <h1 className="font-serif text-4xl text-gray-900 ">
              Manage Profile
            </h1>
            {userData && (
              <Link href={`/user/${userData.slug}`}>
                <Button
                  variant="subtle"
                  rightIcon={<ExternalLink />}
                  className="mt-1 px-0"
                >
                  Visit Profile
                </Button>
              </Link>
            )}
          </div>
          {userData && (
            <label
              htmlFor="image"
              className="relative aspect-square w-16 overflow-hidden rounded-full"
            >
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/25 text-white">
                <Edit />
              </div>
              <Image
                src={
                  previewImage ||
                  userData?.image ||
                  cloudinary
                    .image(`bookbar/${userData.id}-profile-image`)
                    .toURL() ||
                  "/image-not-found"
                }
                alt={userData.name || "User"}
                layout="fill"
                objectFit="cover"
                objectPosition="center"
                className="z-0"
              />
            </label>
          )}
          <input
            type="file"
            id="image"
            {...register("image")}
            onChange={(e) => {
              filePreviewHandler(e.target.files);
              register("image").onChange(e);
            }}
            accept="image/*"
            hidden
          />
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <div className="flex justify-between">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <span className="text-sm text-gray-500" id="email-optional">
                Optional
              </span>
            </div>
            <div className="mt-1">
              <input
                type="email"
                placeholder="Change your email"
                className="w-full"
                {...register("email")}
              />
            </div>
          </div>
          <ErrorMessage
            errors={errors}
            name="email"
            render={({ message }) => (
              <p className="text-center text-red-500">{message}</p>
            )}
          />
          <div>
            <div className="flex justify-between">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <span className="text-sm text-gray-500" id="email-optional">
                Optional
              </span>
            </div>
            <div className="mt-1">
              <input
                type="text"
                placeholder="Change your name"
                className="w-full"
                {...register("name")}
              />
            </div>
            <ErrorMessage
              errors={errors}
              name="name"
              render={({ message }) => (
                <p className="mt-1 text-center text-red-500">{message}</p>
              )}
            />
            <ErrorMessage
              errors={errors}
              name="image"
              render={({ message }) => (
                <p className="mt-1 text-center text-red-500">{message}</p>
              )}
            />
          </div>
        </div>
        <div className="mt-7 flex gap-4">
          <Button
            type="submit"
            disabled={!watch().email && !watch().name && !watch().image}
            loading={updateAccountMutation.isLoading}
          >
            Update Profile
          </Button>
          <Popover className="relative">
            <Popover.Button className="border border-red-600 py-2 px-4 text-red-600">
              Delete Account
            </Popover.Button>
            <Popover.Panel className="absolute left-1/2 z-50 mt-3 -translate-x-1/2 transform rounded-md border border-gray-200 bg-white p-4 shadow-lg shadow-gray-200 lg:max-w-3xl">
              <div className="flex gap-4">
                <Button
                  variant="subtle"
                  compact
                  className="font-normal"
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  compact
                  type="button"
                  className="bg-red-600 text-white"
                  loading={deleteAccountMutation.isLoading}
                  onClick={() => deleteAccountMutation.mutate()}
                >
                  Confirm
                </Button>
              </div>
            </Popover.Panel>
          </Popover>
        </div>
      </form>
    </>
  );
};

export default Manage;
