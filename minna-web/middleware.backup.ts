import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })

  const path = req.nextUrl.pathname

  const isAuthPage = path.startsWith("/auth")
  const isDashboard = path.startsWith("/dashboard")
  const isAdminPage = path.startsWith("/dashboard/admin") || path.startsWith("/admin")

  // =========================
  // 1. LOGIN YO'Q → BLOCK
  // =========================
  if ((isDashboard || isAdminPage) && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  // =========================
  // 2. AUTH PAGE → REDIRECT
  // =========================
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // =========================
  // 3. ADMIN CHECK
  // =========================
  if (isAdminPage && token?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/admin/:path*"],
}
