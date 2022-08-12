import { createRouter } from "./context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const collectionRouter = createRouter()
  .query("getAll", {
    async resolve() {
      return await prisma.collection.findMany();
    },
  })
  .query("getByUserId", {
    input: z.object({
      userId: z.string(),
    }),
    async resolve({ input }) {
      return await prisma.collection.findMany({
        where: {
          userId: input.userId,
        },
      });
    },
  })
  .mutation("create", {
    input: z.object({
      title: z.string(),
      description: z.string(),
      books: z.object({
        bookIds: z.array(z.string()),
      }),
    }),
    async resolve({ session, input }) {
      // Authorized user only
      if (!session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return await prisma.collection.create({
        data: {
          title: input.title,
          description: input.description,
          user: {
            connect: {
              id: session.userId,
            },
          },
          books: input.books,
        },
      });
    },
  });
