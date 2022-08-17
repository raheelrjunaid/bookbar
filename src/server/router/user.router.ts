import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "../db/client";
import { createProtectedRouter } from "./protected-router";
import transporter from "../../utils/transporter";
import { faker } from "@faker-js/faker";

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
      name: z.string().nullish(),
      email: z.string().nullish(),
    }),
    async resolve({ ctx: { prisma, session }, input }) {
      // Send verification email
      const { email: newEmail, name: newName } = input;
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
          data: { name: newName },
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
