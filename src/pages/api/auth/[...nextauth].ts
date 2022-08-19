import NextAuth, { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";
import { env } from "../../../env/server.mjs";
import slugify from "slugify";
import transporter from "../../../utils/transporter";

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      sendVerificationRequest({ identifier, url }) {
        transporter.sendMail({
          from: `"No-Reply | Bookbar`,
          to: identifier,
          subject: "Your sign-in link for Bookbar",
          html: `<a href="${url}" target="_blank">Login</a>`,
        });
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      profile({ sub, name, email, picture }) {
        return {
          id: sub,
          name,
          email,
          image: picture,
          slug: slugify(name, { lower: true }),
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/",
    newUser: "/auth/new-user", // New users will be directed here on first sign in (leave the property out if not of interest)
  },
  debug: env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
