import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";
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
  }

  if (verifyEmailMutation.error)
    return <Alert message={verifyEmailMutation.error.message} showAction />;

  return (
    <h1 className="mt-14 font-bold font-serif text-gray-900 text-4xl">
      Loading...
    </h1>
  );
};

export default VerifyEmail;
