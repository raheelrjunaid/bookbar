import { NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import Image from "next/image";
import { ArrowRight, Edit } from "tabler-icons-react";
import Button from "../../components/Button";
import { useState } from "react";
import cloudinary from "../../utils/cloudinary";
import Head from "next/head";

export const NewUser: NextPage = () => {
  const { data: userData } = trpc.useQuery(["user.getUser"]);
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    criteriaMode: "all",
  });
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const updateAccountMutation = trpc.useMutation(["user.updateProfile"]);

  if (userData?.name) {
    router.push("/user/manage");
    return <div>Redirecting...</div>;
  }

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

  return (
    <>
      <Head>
        <title>Welcome | BookBar</title>
      </Head>

      <form
        onSubmit={handleSubmit(({ image: images, name }) => {
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
                name,
              });
            };
            return;
          }
          updateAccountMutation.mutate({
            name,
          });

          router.push("/user/manage");
        })}
        className="pt-14"
      >
        <div>
          <h1 className="text-gray-900 font-serif font-bold text-4xl mb-2">
            Let&apos;s get started:
          </h1>
          <p className="text-gray-600 mb-5">
            We need some basic information to get you started.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label
            htmlFor="image"
            className="relative aspect-square w-16 overflow-hidden rounded-full"
          >
            <div className="absolute inset-0 text-white bg-black/25 z-10 flex items-center justify-center">
              <Edit />
            </div>
            <Image
              src={
                previewImage ||
                cloudinary
                  .image(`bookbar/${userData?.id}-profile-image`)
                  .toURL() ||
                "/image-not-found"
              }
              alt={userData?.name || "User"}
              layout="fill"
              objectFit="cover"
              objectPosition="center"
              className="z-0"
            />
          </label>
          <input
            type="file"
            id="image"
            {...register("image")}
            accept="image/*"
            onChange={(e) => {
              filePreviewHandler(e.target.files);
              register("image").onChange(e);
            }}
            hidden
          />
          <input
            type="text"
            placeholder="Full Name"
            className="grow"
            {...register("name", {
              required: "Name is required",
            })}
          />
        </div>
        <div className="flex flex-col gap-3">
          <ErrorMessage
            errors={errors}
            name="name"
            render={({ message }) => (
              <p className="text-red-500 text-sm text-center">{message}</p>
            )}
          />
          <ErrorMessage
            errors={errors}
            name="image"
            render={({ message }) => (
              <p className="text-red-500 text-sm text-center">{message}</p>
            )}
          />
        </div>
        <Button
          type="submit"
          className="mt-5 w-full"
          rightIcon={<ArrowRight />}
          disabled={!watch().name}
          loading={updateAccountMutation.isLoading}
        >
          Continue
        </Button>
      </form>
    </>
  );
};
export default NewUser;
