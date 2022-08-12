import NextAuth, { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";
import { env } from "../../../env/server.mjs";

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ user }) {
      if (!user.id) {
        const updatedUser = await prisma.user.update({
          where: { id: newUser },
          data: {
            slug: user.name.toLowerCase().replace(/\s/g, "-"),
          },
        });
        return updatedUser;
      }
      return true;
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile({ sub, name, email, picture }) {
        return {
          id: sub,
          name,
          email,
          image: picture,
          slug: name.toLowerCase().replace(/\s/g, "-"),
        };
      },
    }),
  ],
  debug: env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
