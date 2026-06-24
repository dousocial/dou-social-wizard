import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin panel auth ────────────────────────────────────────────────────
  if (pathname.startsWith("/yonetim")) {
    // Login + setup pages are public
    if (pathname.startsWith("/yonetim/giris")) {
      return NextResponse.next();
    }
    // Everything else under /yonetim requires the session cookie
    const token = req.cookies.get("dou_sid")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/yonetim/giris", req.url));
    }
    return NextResponse.next();
  }

  // ── Skip i18n for non-page routes ──────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const legacyMap: Record<string, string> = {
      "/admin/leads": "/yonetim/leads",
      "/admin/contacts": "/yonetim/contacts",
    };
    return NextResponse.redirect(new URL(legacyMap[pathname] ?? "/yonetim", req.url));
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // ── i18n for all other routes ──────────────────────────────────────────
  return intlMiddleware(req);
}

export const config = {
  matcher: "/((?!_next|_vercel|.*\\..*).*)",
};
