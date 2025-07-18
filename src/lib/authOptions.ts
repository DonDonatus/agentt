// src/lib/authOptions.ts

import type { NextAuthOptions, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { userId: credentials.username },
        });

        if (!user || user.password !== credentials.password) {
          return null;
        }

        return {
          id: user.userId,
          name: user.userId,
          email: `${user.userId}@example.com`,
          isAdmin: user.isAdmin,
        } satisfies ExtendedUser;
      },
    }),
  ],
  pages: {
    signIn: '/', // You can update this path if needed
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        (session.user as typeof session.user & { isAdmin?: boolean }).isAdmin = token.isAdmin;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.isAdmin = (user as ExtendedUser).isAdmin;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
