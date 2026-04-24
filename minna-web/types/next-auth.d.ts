import NextAuth from "next-auth"

declare module "next-auth" {
  // Session obyekti ichida nimalar borligini aytamiz
  interface Session {
    accessToken?: string;
    user: {
      id?: string;
      role?: string; // Mana shu role xatolikni yo'q qiladi
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }

  // User obyekti ichida nimalar borligini aytamiz
  interface User {
    id?: string;
    role?: string;
    token?: string;
  }
}

declare module "next-auth/jwt" {
  // JWT ichida nimalar borligini aytamiz
  interface JWT {
    accessToken?: string;
    role?: string;
  }
}