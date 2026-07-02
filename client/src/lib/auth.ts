import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:4000";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const res = await fetch(`${BACKEND}/api/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) return null;

        const data = await res.json() as {
          token: string;
          user: { id: string; name: string; email: string; role: "SUPERADMIN" | "ADMIN" | "KITCHEN"; restaurantId?: string };
        };

        return {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          restaurantId: data.user.restaurantId,
          accessToken: data.token,
        };
      },
    }),
  ],
});
