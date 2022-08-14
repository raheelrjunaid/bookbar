import { createRouter } from "./context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "../db/client";

const isFavourited = async (collectionId: string, userId: string) => {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: {
      favouritedBy: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!collection) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Collection not found",
    });
  }
  return !!collection.favouritedBy.some(({ id }) => id === userId);
};

export const collectionRouter = createRouter()
  .query("getAll", {
    async resolve() {
      return await prisma.collection.findMany({
        include: {
          books: {
            select: {
              cover: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
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
  .query("isFavourited", {
    input: z.object({
      collectionId: z.string(),
    }),
    async resolve({ ctx, input }) {
      if (!ctx.session || !ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return await isFavourited(input.collectionId, ctx.session.user.id);
    },
  })
  .mutation("toggleFavourite", {
    input: z.object({
      collectionId: z.string(),
    }),
    async resolve({ ctx, input }) {
      if (!ctx.session || !ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const userId = ctx.session.user.id;
      const isFavouritedValue = await isFavourited(input.collectionId, userId);
      if (isFavouritedValue)
        return await prisma.collection.update({
          where: { id: input.collectionId },
          data: {
            favouritedBy: {
              disconnect: {
                id: userId,
              },
            },
          },
        });
      return await prisma.collection.update({
        where: { id: input.collectionId },
        data: {
          favouritedBy: {
            connect: {
              id: userId,
            },
          },
        },
      });
    },
  })
  .query("getAverageRating", {
    input: z.object({
      collectionId: z.string(),
    }),
    async resolve({ input }) {
      return await prisma.book.aggregate({
        where: {
          collectionId: input.collectionId,
        },
        avg: {
          rating: true,
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
    async resolve({ ctx, input }) {
      // Authorized user only
      if (!ctx.session || !ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return await prisma.collection.create({
        data: {
          title: input.title,
          description: input.description,
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          books: input.books,
        },
        select: {
          id: true,
        },
      });
    },
  });
