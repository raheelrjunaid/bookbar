import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createProtectedRouter } from "./protected-router";
import transporter from "../../utils/transporter";
import { faker } from "@faker-js/faker";
import slugify from "slugify";
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

import { v2 as cloudinary } from "cloudinary";

export const userRouter = createProtectedRouter()
  .query("getUser", {
    async resolve({ ctx: { prisma, session } }) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      return user;
    },
  })
  .mutation("updateProfile", {
    input: z.object({
      image: z
        .object({
          type: z.enum(ACCEPTED_IMAGE_TYPES),
          size: z.number().max(1000000),
          bytes: z.string(),
        })
        .nullish(),
      name: z.string().nullish(),
      email: z.string().nullish(),
    }),
    async resolve({ ctx: { prisma, session }, input }) {
      // Send verification email
      const { email: newEmail, name: newName, image: newImage } = input;
      if (!newEmail && !newName && !newImage)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No fields to update.",
        });

      if (newImage) {
        await cloudinary.uploader.upload(
          newImage.bytes,
          {
            moderation: "webpurify",
            folder: "bookbar",
            public_id: `${session.user.id}-profile-image`,
            invalidate: true,
          },
          async (error) => {
            if (error) {
              console.error(error);
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: error.message,
              });
            }
            await prisma.user.update({
              where: { id: session.user.id },
              data: {
                image: null,
              },
            });
          }
        );
      }

      if (newEmail) {
        const existingUser = await prisma.user.findUnique({
          where: { email: newEmail },
        });

        if (existingUser)
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already in use",
          });

        const {
          user: { email: oldEmail },
        } = session;

        if (oldEmail === newEmail)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "New email is the same as the old one",
          });

        // Delete previous tokens
        await prisma.verificationToken.deleteMany({
          where: { identifier: newEmail },
        });

        const { token } = await prisma.verificationToken.create({
          data: {
            identifier: newEmail,
            token: faker.datatype.uuid(),
            // Valid for one day
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
          },
          select: {
            token: true,
          },
        });

        await transporter.sendMail({
          from: "No-Reply | Bookbar",
          to: newEmail,
          subject: "bookbar | Verify your email",
          html: `<a class="f-fallback button" target="_blank" href="${
            process.env.VERCEL_URL || "http://localhost:3000"
          }/auth/verify-email?token=${token}">Verify your email</a>`,
        });
      }
      if (newName) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { name: newName, slug: slugify(newName, { lower: true }) },
        });
      }
    },
  })
  .mutation("delete", {
    async resolve({ ctx: { prisma, session } }) {
      await prisma.user.delete({
        where: { id: session.user.id },
      });
    },
  })
  .mutation("verifyEmail", {
    input: z.object({
      token: z.string(),
    }),
    async resolve({ ctx: { prisma, session }, input }) {
      const { token } = input;
      const verificationToken = await prisma.verificationToken.findUnique({
        where: { token },
      });
      if (!verificationToken)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid token",
        });
      if (verificationToken.expires < new Date())
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Token expired",
        });

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          email: verificationToken.identifier,
          emailVerified: new Date(),
        },
      });
      await prisma.verificationToken.delete({
        where: { token },
      });
    },
  });
