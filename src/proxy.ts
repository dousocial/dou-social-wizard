import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Skip i18n for non-page routes ──────────────────────────────────────
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // ── i18n for all other routes ──────────────────────────────────────────
  return intlMiddleware(req);
}

export const config = {
  matcher: "/((?!_next|_vercel|.*\\..*).*)",
};
