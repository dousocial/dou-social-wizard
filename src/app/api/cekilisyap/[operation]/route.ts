import worker from "@/lib/cekilis/app.js";
import { getClientId, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

async function handle(request: Request) {
  const url = new URL(request.url);
  if (request.method === "POST") {
    if (request.headers.get("origin") !== url.origin) {
      return Response.json({ error: "Bu istek kabul edilemiyor." }, { status: 403 });
    }
    const isComments = url.pathname.endsWith("/comments");
    const limit = rateLimit(`giveaway:${isComments ? "import" : "draw"}:${await getClientId()}`, {
      max: isComments ? 3 : 12,
      windowSeconds: 600,
    });
    if (!limit.ok) {
      return Response.json(
        { error: "Çok fazla deneme yaptın. Biraz sonra tekrar dene." },
        { status: 429, headers: { "Retry-After": String(limit.resetIn), "Cache-Control": "no-store" } },
      );
    }
  }
  return worker.fetch(request, { APIFY_API_TOKEN: process.env.APIFY_API_TOKEN });
}

export const GET = handle;
export const POST = handle;
