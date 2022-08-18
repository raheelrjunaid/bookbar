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

  if (session) router.push("/");

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
        className="flex flex-col max-w-sm mt-14 gap-4"
      >
        <div>
          <h1 className="text-gray-900 font-serif font-bold text-4xl mb-2">
            Welcome
          </h1>
          <p className="text-gray-600 mb-5">
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
            <p className="text-red-500 text-center">{message}</p>
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
