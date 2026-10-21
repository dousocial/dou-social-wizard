import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { getActiveSession } from "./lib/session";
import { contentSecurityPolicy } from "./lib/security-policy";
import { LEGACY_REDIRECTS, RETIRED_URLS } from "./lib/legacy-urls";
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
      const response = NextResponse.next({
        request: { headers: requestHeaders },
      });
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
    if (!(await getActiveSession(token))) {
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
    return NextResponse.redirect(
      new URL(legacyMap[pathname] ?? "/yonetim", req.url)
    );
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Retired URLs have no equivalent content; do not send them to an unrelated page.
  const publicPath = pathname.replace(/^\/tr(?=\/)/, "").replace(/\/$/, "");
  const replacement = LEGACY_REDIRECTS[publicPath];
  if (replacement) {
    const destination = req.nextUrl.clone();
    destination.pathname = replacement;
    return NextResponse.redirect(destination, 308);
  }
  if (RETIRED_URLS.has(publicPath)) {
    const english = publicPath.startsWith("/en/");
    return new NextResponse(
      `<!doctype html><html lang="${english ? "en" : "tr"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>${english ? "Page removed" : "Sayfa kaldırıldı"} · DOU Social</title></head><body style="font-family:system-ui,sans-serif;max-width:42rem;margin:12vh auto;padding:24px;line-height:1.6"><p>DOU SOCIAL · 410</p><h1>${english ? "This page has been removed." : "Bu sayfa yayından kaldırıldı."}</h1><p>${english ? "You can explore our current services and articles." : "Güncel hizmetlerimizi ve yazılarımızı inceleyebilirsiniz."}</p><p><a href="${english ? "/en/hizmetler" : "/hizmetler"}">${english ? "Services" : "Hizmetler"}</a> · <a href="/blog">Blog</a> · <a href="${english ? "/en/iletisim" : "/iletisim"}">${english ? "Contact" : "İletişim"}</a></p></body></html>`,
      {
        status: 410,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Robots-Tag": "noindex, follow",
          "Cache-Control": "public, max-age=3600",
        },
      }
    );
  }

  // ── i18n for all other routes ──────────────────────────────────────────
  return intlMiddleware(req);
}

export const config = {
  matcher: "/((?!_next|_vercel|.*\\..*).*)",
};
