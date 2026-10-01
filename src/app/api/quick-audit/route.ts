import { readJsonBody } from "@/lib/request-json";
import { NextResponse } from "next/server";
import { runQuickAudit } from "@/lib/quick-audit";
import { normalizeInstagram, normalizeWebsite } from "@/lib/public-web";
import { getClientId, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return NextResponse.json(
      { error: "Bu istek kabul edilemiyor." },
      { status: 403 }
    );
  const limited = rateLimit(`quick-audit:${await getClientId()}`, {
    max: 5,
    windowSeconds: 600,
  });
  if (!limited.ok)
    return NextResponse.json(
      {
        error:
          "Çok fazla analiz isteği gönderdiniz. Biraz sonra tekrar deneyin.",
      },
      { status: 429, headers: { "Retry-After": String(limited.resetIn) } }
    );
  if (Number(request.headers.get("content-length")) > 4096)
    return NextResponse.json({ error: "İstek çok büyük." }, { status: 413 });
  let input: { website?: string; instagram?: string };
  try {
    const body = await readJsonBody(request, 4096);
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new Error();
    input = body as typeof input;
    if (
      !input ||
      typeof input !== "object" ||
      Array.isArray(input) ||
      (input.website !== undefined && typeof input.website !== "string") ||
      (input.instagram !== undefined && typeof input.instagram !== "string")
    )
      throw new Error();
    if (!input.website?.trim() && !input.instagram?.trim()) throw new Error();
    if (input.website?.trim()) normalizeWebsite(input.website);
    if (input.instagram?.trim()) normalizeInstagram(input.instagram);
  } catch {
    return NextResponse.json(
      {
        error:
          "Geçerli bir web sitesi adresi veya Instagram kullanıcı adı girin.",
      },
      { status: 400 }
    );
  }
  try {
    const report = await runQuickAudit(input);
    return NextResponse.json(report, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Analiz şu anda tamamlanamadı. Lütfen tekrar deneyin." },
      { status: 502 }
    );
  }
}
