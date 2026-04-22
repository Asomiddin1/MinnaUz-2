import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })

  const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard")

  // ❌ login bo‘lmagan user dashboardga kira olmaydi
  if (isDashboard && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  // ❌ login bo‘lgan user auth page ko‘rmasin
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
}