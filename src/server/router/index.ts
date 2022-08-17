// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { collectionRouter } from "./collection.router";
import { protectedExampleRouter } from "./protected-example-router";
import { userRouter } from "./user.router";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("question.", protectedExampleRouter)
  .merge("collection.", collectionRouter)
  .merge("user.", userRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
