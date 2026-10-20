import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  INTERVIEW_COUNT,
  INTERVIEW_EVENT,
  INTERVIEW_START,
  INTERVIEW_MINUTES,
  normalizeInterviewName,
} from "@/lib/interview";
import { readJsonBody } from "@/lib/request-json";
import { getClientId, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
const COOKIE = "dou_interview";
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const validToken = (value?: string) =>
  value && /^[a-f0-9]{64}$/.test(value) ? value : null;
const respond = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });

export async function GET(request: NextRequest) {
  const token =
    validToken(request.cookies.get(COOKIE)?.value) ??
    randomBytes(32).toString("hex");
  const { data, error } = await supabase
    .from("interview_bookings")
    .select("slot_index")
    .eq("event_id", INTERVIEW_EVENT)
    .is("cancelled_at", null);
  if (error)
    return respond(
      { error: "Saatler yüklenemedi. Lütfen biraz sonra tekrar deneyin." },
      503
    );
  const { data: own, error: ownError } = await supabase
    .from("interview_bookings")
    .select("slot_index,full_name")
    .eq("event_id", INTERVIEW_EVENT)
    .eq("browser_key", hash(token))
    .is("cancelled_at", null)
    .maybeSingle();
  if (ownError) return respond({ error: "Randevu bilgisi yüklenemedi." }, 503);
  const booked = new Set((data ?? []).map((row) => row.slot_index));
  const response = respond({
    slots: Array.from({ length: INTERVIEW_COUNT }, (_, index) => ({
      index,
      booked: booked.has(index),
    })),
    ownBooking: own
      ? { slotIndex: own.slot_index, fullName: own.full_name }
      : null,
  });
  response.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 86400,
  });
  return response;
}

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return respond({ error: "Bu istek kabul edilemiyor." }, 403);
  const token = validToken(request.cookies.get(COOKIE)?.value);
  if (!token)
    return respond({ error: "Sayfayı yenileyip tekrar deneyin." }, 400);
  const limit = rateLimit(`interview:${hash(await getClientId())}`, {
    max: 10,
    windowSeconds: 600,
  });
  if (!limit.ok)
    return respond(
      { error: "Çok fazla deneme yaptınız. Biraz sonra tekrar deneyin." },
      429
    );
  let fullName: string, nameKey: string, slotIndex: number;
  try {
    const body = (await readJsonBody(request, 2048)) as {
      fullName?: unknown;
      slotIndex?: unknown;
      website?: unknown;
    };
    if (!body || body.website) throw new Error("Geçersiz istek.");
    ({ fullName, nameKey } = normalizeInterviewName(body.fullName));
    if (
      !Number.isInteger(body.slotIndex) ||
      Number(body.slotIndex) < 0 ||
      Number(body.slotIndex) >= INTERVIEW_COUNT
    )
      throw new Error("Listeden bir saat seçin.");
    slotIndex = Number(body.slotIndex);
  } catch (error) {
    return respond(
      {
        error:
          error instanceof Error && error.message.startsWith("Adınızı")
            ? error.message
            : "Ad soyad ve geçerli bir saat seçin.",
      },
      400
    );
  }
  if (Date.now() >= INTERVIEW_START + slotIndex * INTERVIEW_MINUTES * 60_000)
    return respond(
      { error: "Bu görüşmenin saati geçti. Başka bir saat seçin." },
      409
    );
  const browserKey = hash(token);
  const { data, error } = await supabase
    .from("interview_bookings")
    .insert({
      event_id: INTERVIEW_EVENT,
      slot_index: slotIndex,
      full_name: fullName,
      name_key: nameKey,
      browser_key: browserKey,
    })
    .select("slot_index,full_name")
    .single();
  if (error?.code === "23505") {
    const { data: existing } = await supabase
      .from("interview_bookings")
      .select("slot_index,full_name")
      .eq("event_id", INTERVIEW_EVENT)
      .eq("browser_key", browserKey)
      .is("cancelled_at", null)
      .maybeSingle();
    if (existing)
      return respond({
        ownBooking: {
          slotIndex: existing.slot_index,
          fullName: existing.full_name,
        },
      });
    return respond(
      {
        error:
          "Bu saat doldu veya bu ad soyadla zaten randevu alındı. Listeyi kontrol edin; mevcut randevunuz için bizimle iletişime geçebilirsiniz.",
      },
      409
    );
  }
  if (error || !data)
    return respond(
      { error: "Randevu kaydedilemedi. Lütfen tekrar deneyin." },
      503
    );
  return respond(
    { ownBooking: { slotIndex: data.slot_index, fullName: data.full_name } },
    201
  );
}
