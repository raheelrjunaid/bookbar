import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { signIn, useSession } from "next-auth/react";
import Button from "../components/Button";
import Divider from "../components/Divider";
import { Plus } from "tabler-icons-react";
import Link from "next/link";

const Home: NextPage = () => {
  const { data } = trpc.useQuery(["collection.getAll"]);
  const { status } = useSession();

  console.log(data);

  return (
    <>
      <Head>
        <title>BookBar | Explore</title>
      </Head>

      <section className="flex flex-col gap-6 pt-14">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-4xl text-gray-900">
            Explore Popular Collections
          </h1>
          <p className="font-normal text-gray-700">
            Get the best book recommendations from actual people!
          </p>
        </div>
        {status === "unauthenticated" && (
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => signIn()}>
              Log In
            </Button>
            <Button onClick={() => signIn()}>Sign In</Button>
          </div>
        )}
      </section>

      <Divider className="my-8" />

      <section className="grid grid-cols-1 gap-4"></section>

      <section className="pt-10 flex justify-center">
        <Link href="/collection/add">
          <Button size="lg" rightIcon={<Plus />}>
            Add Collection
          </Button>
        </Link>
      </section>
    </>
  );
};

export default Home;
