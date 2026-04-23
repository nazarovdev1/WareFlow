import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./db";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

interface ExtendedUser extends User {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role: UserRole;
  warehouseId?: string | null;
  permissions: string[];
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "Telefon", type: "tel" },
        password: { label: "Parol", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("Telefon va parol kiritilishi shart");
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: credentials.phone },
              { email: credentials.phone }
            ]
          },
          include: { warehouse: true },
        });

        if (!user || !user.isActive) {
          throw new Error("Foydalanuvchi topilmadi yoki active emas");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Noto'g'ri parol");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          warehouseId: user.warehouseId,
          permissions: user.permissions || [],
        } as ExtendedUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const extendedUser = user as ExtendedUser;
        token.id = extendedUser.id;
        token.role = extendedUser.role;
        token.warehouseId = extendedUser.warehouseId;
        token.permissions = extendedUser.permissions || [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.warehouseId = token.warehouseId as string | undefined;
        session.user.permissions = (token.permissions as string[]) || [];
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || (() => {
    console.warn('⚠️  WARNING: Using fallback NEXTAUTH_SECRET. Please set NEXTAUTH_SECRET in production environment variables.');
    return "wareflow-fallback-secret-key-12345";
  })(),
};