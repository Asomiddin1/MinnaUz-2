import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { routing } from "./src/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // API va next-auth route'larini skip qilish
  if (path.startsWith("/api") || path.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Avval intl middleware'ni ishga tushiramiz (locale prefix qo'shish uchun)
  const intlResponse = intlMiddleware(req);

  // Auth tekshiruvlari — locale prefixdan keyin yo'lni aniqlash
  const localePattern = /^\/(uz|ja)/;
  const pathWithoutLocale = path.replace(localePattern, "") || "/";

  const isAuthPage = pathWithoutLocale.startsWith("/auth");
  const isDashboard = pathWithoutLocale.startsWith("/dashboard");
  const isAdminPage =
    pathWithoutLocale.startsWith("/dashboard/admin") ||
    pathWithoutLocale.startsWith("/admin");

  // Auth kerak bo'lgan sahifalar uchun token tekshiruvi
  if (isDashboard || isAdminPage || isAuthPage) {
    const token = await getToken({ req });
    const locale = path.match(localePattern)?.[1] || routing.defaultLocale;

    // LOGIN YO'Q → dashboard/admin'ga kirolmaydi
    if ((isDashboard || isAdminPage) && !token) {
      return NextResponse.redirect(
        new URL(`/${locale}/auth/login`, req.url)
      );
    }

    // AUTH PAGE → allaqachon login bo'lsa, dashboard'ga yo'naltirish
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
    }

    // ADMIN CHECK
    if (isAdminPage && token?.role !== "admin") {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
    }
  }

  return intlResponse;
}

export const config = {
  matcher: [
    // next-intl uchun barcha sahifalarni match qilish (api, _next, static fayllar bundan mustasno)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
