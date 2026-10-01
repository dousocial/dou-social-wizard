import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { getActiveSession } from "./lib/session";
import { contentSecurityPolicy } from "./lib/security-policy";
import { randomBytes } from "node:crypto";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin panel auth ────────────────────────────────────────────────────
  if (pathname.startsWith("/yonetim")) {
    const nonce = randomBytes(16).toString("base64");
    const policy = contentSecurityPolicy(nonce);
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", policy);
    const adminResponse = () => {
      const response = NextResponse.next({ request: { headers: requestHeaders } });
      response.headers.set("Content-Security-Policy", policy);
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    };
    // Login + setup pages are public
    if (pathname.startsWith("/yonetim/giris")) {
      return adminResponse();
    }
    // Everything else under /yonetim requires the session cookie
    const token = req.cookies.get("dou_sid")?.value;
    if (!await getActiveSession(token)) {
      return NextResponse.redirect(new URL("/yonetim/giris", req.url));
    }
    return adminResponse();
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
