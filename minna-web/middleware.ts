import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })

  const path = req.nextUrl.pathname;
  
  const isAuthPage = path.startsWith("/auth");
  const isDashboard = path.startsWith("/dashboard");
  
  // Admin sahifalari qaysi yo'lda ekanligini belgilaymiz (o'zingizning proyektga moslang)
  const isAdminPage = path.startsWith("/dashboard/admin") || path.startsWith("/admin");

  // 1. Login bo‘lmagan user dashboard yoki admin sahifaga kira olmaydi
  if ((isDashboard || isAdminPage) && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  // 2. ❌ Oddiy user (roli admin bo'lmaganlar) admin sahifaga kirmasligi kerak
  if (isAdminPage && token?.role !== "admin") {
    // Ularni oddiy dashboard sahifasiga qaytarib yuboramiz
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // 3. Login bo‘lgan user auth (login/register) sahifalarini ko‘rmasin
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  // matcher ro'yxatiga admin yo'lini ham qo'shib qo'yamiz
  matcher: ["/dashboard/:path*", "/auth/:path*", "/admin/:path*"],
}