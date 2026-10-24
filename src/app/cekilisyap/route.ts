import { GIVEAWAY_HTML } from "@/lib/cekilis/client-document.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  return new Response(GIVEAWAY_HTML, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, follow",
    },
  });
}
