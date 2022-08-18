import { createRouter } from "./context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { PrismaClient } from "@prisma/client";

const isFavourited = async (
  collectionId: string,
  userId: string,
  prisma: PrismaClient
) => {
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
    input: z.object({
      pageNumber: z.number(),
    }),
    async resolve({ ctx: { prisma }, input }) {
      const collectionTotal = await prisma.collection.count();
      const totalPages = Math.ceil(collectionTotal / 10);
      const collections = await prisma.collection.findMany({
        skip: (input.pageNumber - 1) * 10,
        take: 10,
        include: {
          books: {
            select: {
              cover: true,
            },
          },
          user: true,
        },
      });
      return {
        collections,
        totalPages,
      };
    },
  })
  .query("getAllByUserSlug", {
    input: z.object({
      userSlug: z.string(),
      pageNumber: z.number(),
    }),
    async resolve({ ctx: { prisma }, input }) {
      const userData = await prisma.user.findUnique({
        where: {
          slug: input.userSlug,
        },
      });
      if (!userData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      const collectionTotal = await prisma.collection.count({
        where: {
          user: {
            slug: input.userSlug,
          },
        },
      });
      const totalPages = Math.ceil(collectionTotal / 10);
      const collections = await prisma.collection.findMany({
        skip: (input.pageNumber - 1) * 10,
        take: 10,
        where: {
          user: {
            slug: input.userSlug,
          },
        },
        include: {
          books: {
            select: {
              cover: true,
            },
          },
          user: true,
        },
      });
      return {
        user: userData,
        collections,
        totalPages,
      };
    },
  })
  .query("getById", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx: { prisma }, input }) {
      return await prisma.collection.findUnique({
        where: { id: input.id },
        include: {
          books: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              slug: true,
            },
          },
        },
      });
    },
  })
  .query("search", {
    input: z.object({
      q: z.string(),
      pageNumber: z.number(),
    }),
    async resolve({ ctx: { prisma }, input }) {
      const collectionTotal = await prisma.collection.count({
        where: {
          title: {
            search: input.q,
          },
          description: {
            search: input.q,
          },
        },
      });
      const totalPages = Math.ceil(collectionTotal / 10);
      const collections = await prisma.collection.findMany({
        skip: (input.pageNumber - 1) * 10,
        take: 10,
        where: {
          title: {
            search: input.q,
          },
          description: {
            search: input.q,
          },
        },
        include: {
          books: {
            select: {
              cover: true,
            },
          },
          user: true,
        },
      });
      return {
        collections,
        totalPages,
      };
    },
  })
  .query("isFavourited", {
    input: z.object({
      collectionId: z.string(),
    }),
    async resolve({ ctx: { prisma, session }, input }) {
      if (!session || !session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return await isFavourited(input.collectionId, session.user.id, prisma);
    },
  })
  .query("getAverageRating", {
    input: z.object({
      collectionId: z.string(),
    }),
    async resolve({ ctx: { prisma }, input }) {
      return await prisma.rating.aggregate({
        where: {
          collectionId: input.collectionId,
        },
        _avg: {
          rating: true,
        },
        _count: {
          rating: true,
        },
      });
    },
  })
  .query("getUserRating", {
    input: z.object({
      collectionId: z.string(),
    }),
    async resolve({ ctx: { prisma, session }, input }) {
      if (!session || !session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return await prisma.rating.findUnique({
        where: {
          userId_collectionId: {
            userId: session.user.id,
            collectionId: input.collectionId,
          },
        },
        select: {
          rating: true,
        },
      });
    },
  })
  .mutation("toggleFavourite", {
    input: z.object({
      collectionId: z.string(),
    }),
    async resolve({ ctx: { prisma, session }, input }) {
      if (!session || !session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const userId = session.user.id;
      const isFavouritedValue = await isFavourited(
        input.collectionId,
        userId,
        prisma
      );
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
  .mutation("create", {
    input: z.object({
      title: z.string(),
      description: z.string(),
      books: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          authors: z.string().nullish(),
          description: z.string().nullish(),
          cover: z.string().nullish(),
          link: z.string(),
          avgRating: z.number().nullish(),
        })
      ),
    }),
    async resolve({ ctx: { prisma, session }, input }) {
      // Authorized user only
      if (!session || !session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const userId = session.user.id;
      const collection = await prisma.collection.create({
        data: {
          title: input.title,
          description: input.description,
          user: {
            connect: {
              id: userId,
            },
          },
        },
        select: {
          id: true,
        },
      });
      await Promise.all(
        input.books.map(async (book) => {
          await prisma.book.upsert({
            where: { id: book.id },
            create: {
              ...book,
              authors: book.authors,
              collections: {
                connect: {
                  id: collection.id,
                },
              },
            },
            update: {
              collections: {
                connect: {
                  id: collection.id,
                },
              },
            },
          });
        })
      );
      return collection;
    },
  })
  .mutation("delete", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx: { prisma, session }, input }) {
      // Authorized user only
      if (!session || !session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const userId = session.user.id;
      const collection = await prisma.collection.findUnique({
        where: { id: input.id },
        include: {
          user: {
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
      if (collection.user.id !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to delete this collection",
        });
      }
      return await prisma.collection.delete({
        where: { id: input.id },
      });
    },
  })
  .mutation("rate", {
    input: z.object({
      collectionId: z.string(),
      rating: z.number().min(0.5).max(5),
    }),
    async resolve({ ctx: { prisma, session }, input }) {
      // Authorized user only
      if (!session || !session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const userId = session.user.id;
      const collection = await prisma.collection.findUnique({
        where: { id: input.collectionId },
        select: {
          user: {
            select: {
              id: true,
            },
          },
        },
      });

      if (collection?.user.id === userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can't rate your own collection",
        });
      }
      return await prisma.rating.upsert({
        where: {
          userId_collectionId: {
            collectionId: input.collectionId,
            userId: userId,
          },
        },
        create: {
          collection: {
            connect: {
              id: input.collectionId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
          rating: input.rating,
        },
        update: {
          rating: input.rating,
        },
      });
    },
  });
