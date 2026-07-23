import type { NextAuthConfig, DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "SUPERADMIN" | "ADMIN" | "KITCHEN";
    restaurantId?: string;
    accessToken: string;
  }
  interface Session {
    user: {
      role: "SUPERADMIN" | "ADMIN" | "KITCHEN";
      restaurantId?: string;
      accessToken: string;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: "SUPERADMIN" | "ADMIN" | "KITCHEN";
    restaurantId?: string;
    accessToken: string;
  }
}

export const authConfig: NextAuthConfig = {
  // maxAge matches the backend JWT (12h) — the cookie must not outlive the
  // access token it carries, or API calls start silently failing with 401.
  session: { strategy: "jwt", maxAge: 12 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.restaurantId = user.restaurantId;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.role = token.role;
        session.user.restaurantId = token.restaurantId;
        session.user.accessToken = token.accessToken;
      }
      return session;
    },
  },
};
