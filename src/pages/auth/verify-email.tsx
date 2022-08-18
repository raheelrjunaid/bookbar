import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { InfinitySpin } from "react-loader-spinner";
import Alert from "../../components/Alert";
import { trpc } from "../../utils/trpc";

export const VerifyEmail: NextPage = () => {
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);
  const verifyEmailMutation = trpc.useMutation("user.verifyEmail", {
    onMutate() {
      setVerifying(true);
    },
    onSuccess: () => {
      router.push("/");
    },
  });
  const { token } = router.query;

  if (token && !verifying) {
    console.log("request sent");
    verifyEmailMutation.mutate({ token: token as string });
  } else if (!token) {
    return (
      <>
        <Head>
          <title>No Token</title>
        </Head>
        <Alert message="No token provided" showAction />;
      </>
    );
  }

  if (verifyEmailMutation.error)
    return (
      <>
        <Head>
          <title>Token Error</title>
        </Head>
        <Alert message={verifyEmailMutation.error.message} showAction />
      </>
    );

  return (
    <>
      <Head>
        <title>Redirecting...</title>
      </Head>
      <div className="flex flex-col items-center justify-center h-screen">
        <InfinitySpin color="#a855f7)" />;
      </div>
    </>
  );
};

export default VerifyEmail;
