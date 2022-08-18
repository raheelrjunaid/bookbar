import { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Button from "../../components/Button";
import Divider from "../../components/Divider";
import Image from "next/image";
import Alert from "../../components/Alert";
import { ConfirmEmailSent } from "../../components/modals/ConfirmEmailSent";
import { useState } from "react";
import { ErrorMessage } from "@hookform/error-message";
import Head from "next/head";

export const SignIn: NextPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const error = useRouter().query.error;
  const { data: session } = useSession();
  const router = useRouter();
  const [modalOpened, setModalOpened] = useState(false);

  if (session) router.push((router.query.callbackUrl as string) || "/");

  const onSubmit = ({ email }: { email: string }) => {
    signIn("email", {
      email,
      redirect: false,
    });
    setModalOpened(true);
  };

  return (
    <>
      <Head>
        <title>Sign In | BookBar</title>
      </Head>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto mt-14 flex max-w-sm flex-col gap-4"
      >
        <div className="mb-6 text-center">
          <h1 className="mt-1 font-serif text-4xl text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Welcome
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-gray-500 sm:text-xl">
            Login to access your account and start adding posts
          </p>
        </div>
        <Button
          variant="outline"
          type="button"
          onClick={() => signIn("google")}
          leftIcon={
            <Image
              src="/google-logo.png"
              alt="Google logo"
              width={20}
              height={20}
            />
          }
          className="w-full"
        >
          Sign in with Google
        </Button>
        <Divider label="Or" className="h-6" />
        <input
          type="email"
          placeholder="you@example.com"
          {...register("email", { required: "Email is required" })}
        />
        <ErrorMessage
          errors={errors}
          name="email"
          render={({ message }) => (
            <p className="text-center text-red-500">{message}</p>
          )}
        />
        <Button type="submit">Sign in</Button>
        {error && (
          <Alert
            message={typeof error === "string" ? error : error.join(", ")}
          />
        )}
        <ConfirmEmailSent opened={modalOpened} setOpened={setModalOpened} />
      </form>
    </>
  );
};

export default SignIn;
