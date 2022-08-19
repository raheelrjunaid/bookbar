// src/pages/_app.tsx
import { withTRPC } from "@trpc/next";
import type { AppRouter } from "../server/router";
import type { AppType } from "next/dist/shared/lib/utils";
import superjson from "superjson";
import { getSession, SessionProvider } from "next-auth/react";
import "../styles/globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ReactQueryDevtools } from "react-query/devtools";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

const MyApp: AppType = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();

  useEffect(() => {
    const verifyName = async () => {
      const session = await getSession();
      if (session?.user && !session.user.name) {
        router.push("/auth/new-user");
      }
    };
    if (router.pathname !== "/auth/new-user") verifyName();
  }, [router]);

  return (
    <SessionProvider session={session}>
      <Head>
        <meta charSet="UTF-8" />
        <meta
          name="description"
          content="Embrace the world of books through exploration of personalized, curated collections"
        />
        <meta
          name="keywords"
          content="books, collections, recommendations, authors"
        />
        <meta name="author" content="Raheel Junaid" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="min-w-screen relative grid min-h-screen grid-rows-[auto_1fr_auto]">
        <Header />
        <main className="container">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </SessionProvider>
  );
};

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default withTRPC<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`;

    if (typeof window === undefined) {
      const ONE_DAY_SECONDS = 60 * 60 * 24;
      ctx?.res?.setHeader(
        "Cache-Control",
        `s-maxage=1, stale-while-revalidate=${ONE_DAY_SECONDS}`
      );
    }

    return {
      url,
      transformer: superjson,
      ...(typeof window === "undefined" && {
        headers: {
          "x-ssr": "true",
        },
      }),
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: true,
})(MyApp);
