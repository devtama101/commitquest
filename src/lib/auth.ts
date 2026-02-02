import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import GitLab from "next-auth/providers/gitlab";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Account } from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    GitLab({
      clientId: process.env.AUTH_GITLAB_ID!,
      clientSecret: process.env.AUTH_GITLAB_SECRET!,
      authorization: "https://gitlab.com/oauth/authorize?scope=read_user+read_api",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      if (user) {
        token.email = user.email;
      }
      return token;
    },
    async signIn({ user, account }) {
      if (!user || !account) return true;

      const userEmail = user.email;
      if (!userEmail) return true;

      // Find or create user
      let dbUser = await prisma.user.findUnique({
        where: { email: userEmail },
      });

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email: userEmail,
            name: user.name,
            image: user.image,
          },
        });
      }

      // Set the user ID to the database user's ID
      user.id = dbUser.id;

      // Create account record if it doesn't exist
      if (account.providerAccountId) {
        const existingAccount = await prisma.account.findFirst({
          where: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        });

        if (!existingAccount) {
          await prisma.account.create({
            data: {
              userId: dbUser.id,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              type: account.type ?? "oauth",
              access_token: account.access_token as string | null,
              refresh_token: account.refresh_token as string | null,
              expires_at: account.expires_at,
              token_type: account.token_type as string | null,
              scope: account.scope as string | null,
              id_token: account.id_token as string | null,
              session_state: account.session_state as string | null,
            },
          });
        }
      }

      return true;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
});

// Type augmentation for session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
