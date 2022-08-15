import { createSSGHelpers } from "@trpc/react/ssg";
import { appRouter } from ".";
import { createContext } from "./context";
import superjson from "superjson";

export const getSSGHelpers = async () =>
  createSSGHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  });

export default getSSGHelpers;
