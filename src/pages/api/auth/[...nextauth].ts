import NextAuth, { type NextAuthOptions } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";
import { env } from "../../../env/server.mjs";

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    signIn({ user, account, profile, email, credentials }) {
      // Make sure a group exists for the user
      // If not, create one and add the user to it
      prisma.group
        .findUnique({
          where: {
            name: user.email || user.name || user.id,
          },
        })
        .then((group) => {
          if (!group) {
            prisma.group.create({
              data: {
                name: user.email || user.name || user.id,
                users: {
                  connect: {
                    id: user.id,
                  },
                },
              },
            });
          }
        });

      return true;
    },
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
    CognitoProvider({
      clientId: env.COGNITO_CLIENT_ID,
      clientSecret: env.COGNITO_CLIENT_SECRET,
      issuer: env.COGNITO_ISSUER,
      checks: ["nonce"],
    }),
  ],
};

export default NextAuth(authOptions);
