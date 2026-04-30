import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

type Token = {
  role?: string;
  user?: {
    role?: string;
  };
};

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  }) as Token | null;

  const path = req.nextUrl.pathname;

  const isAuthPage = path.startsWith("/auth");
  const isDashboard = path.startsWith("/dashboard");
  const isAdminPage =
    path.startsWith("/dashboard/admin") || path.startsWith("/admin");

  // =========================
  // 🧪 DEBUG (development only)
  // =========================
  // if (process.env.NODE_ENV === "development") {
  //   console.log("PATH:", path);
  //   console.log("TOKEN:", token);
  // }

  // =========================
  // 1. LOGIN YO‘Q → BLOCK DASHBOARD/ADMIN
  // =========================
  if ((isDashboard || isAdminPage) && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // =========================
  // 2. AUTH PAGE → LOGGED IN USER REDIRECT
  // =========================
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // =========================
  // 3. ADMIN CHECK (SAFE VERSION)
  // =========================
  const role = token?.role || token?.user?.role;

  if (isAdminPage && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // =========================
  // 4. ALLOW REQUEST
  // =========================
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
    "/admin/:path*",
  ],
};