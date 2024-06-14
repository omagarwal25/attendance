import NextAuth, { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "~env/server.mjs";
import { prisma } from "~server/db/client";

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.email = user.email ?? "";
        session.user.isAdmin = user.email
          ? env.ADMIN_EMAIL.split(",").includes(user.email)
          : false;
      }
      return session;
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: env.EMAIL_SERVER_HOST,
        port: parseInt(env.EMAIL_SERVER_PORT),
        // requireTLS: true,
        secure: true,
        auth: {
          user: env.EMAIL_SERVER_USER,
          pass: (() => {
            console.log(env.EMAIL_SERVER_PASSWORD);
            return env.EMAIL_SERVER_PASSWORD;
          })(),
        },
      },
      from: env.EMAIL_FROM,
    }),
  ],

  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 4 * 60 * 60, // 4 hrs
  },
};

export default NextAuth(authOptions);
