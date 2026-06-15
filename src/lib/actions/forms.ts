"use server";

import { rateLimit, getClientId } from "@/lib/rate-limit";
import { supabase } from "@/lib/supabase";

export type FormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; error: string };

const isEmail = (s: string) => /^\S+@\S+\.\S+$/.test(s);
const isPhone = (s: string) => /^0\d{3} \d{3} \d{4}$/.test(s);

interface SharedFields {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  consent: boolean;
}

function readShared(formData: FormData): SharedFields {
  return {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || undefined,
    message: String(formData.get("message") ?? "").trim() || undefined,
    consent: formData.get("consent") === "on",
  };
}

function validateShared(s: SharedFields): string | null {
  if (!s.name || !s.email) return "missing-fields";
  if (!isEmail(s.email)) return "invalid-email";
  if (!s.consent) return "consent-required";
  if (s.name.length > 200 || s.email.length > 320) return "invalid-input";
  if (s.message && s.message.length > 5000) return "invalid-input";
  return null;
}

/** Honeypot: hidden field bots fill in but humans don't. */
function isHoneypotTriggered(formData: FormData): boolean {
  const trap = String(formData.get("website_url") ?? "").trim();
  return trap.length > 0;
}

/** 5 submissions per IP per 10 minutes — generous for humans, brutal for bots. */
async function checkRateLimit(
  scope: string
): Promise<{ ok: true } | { ok: false; resetIn: number }> {
  const id = await getClientId();
  const result = rateLimit(`${scope}:${id}`, {
    max: 5,
    windowSeconds: 600,
  });
  if (!result.ok) return { ok: false, resetIn: result.resetIn };
  return { ok: true };
}

// ─── /iletisim contact form ──────────────────────────────────────────────
export async function submitContactForm(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  if (isHoneypotTriggered(formData)) {
    // Silently succeed for bots — don't reveal the trap.
    return { status: "success" };
  }

  const limited = await checkRateLimit("contact");
  if (!limited.ok) {
    return { status: "error", error: "rate-limited" };
  }

  const shared = readShared(formData);
  if (!shared.message) return { status: "error", error: "missing-fields" };
  const sharedErr = validateShared(shared);
  if (sharedErr) return { status: "error", error: sharedErr };

  const { error: dbErr } = await supabase.from("contacts").insert({
    type: "iletisim",
    name: shared.name,
    email: shared.email,
    phone: shared.phone ?? null,
    message: shared.message,
  });

  if (dbErr) {
    console.error("[contact form] supabase error:", dbErr.message, dbErr.code);
    return { status: "error", error: "db-error: " + dbErr.message };
  }

  return { status: "success" };
}

// ─── /teklif-al ──────────────────────────────────────────────────────────
export async function submitQuoteRequest(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  if (isHoneypotTriggered(formData)) return { status: "success" };
  const limited = await checkRateLimit("quote");
  if (!limited.ok) return { status: "error", error: "rate-limited" };

  const shared = readShared(formData);
  const industry = String(formData.get("industry") ?? "");
  const services = formData.getAll("services").map(String);
  const budget = String(formData.get("budget") ?? "");
  const company = String(formData.get("company") ?? "").trim();

  if (!industry || !budget || services.length === 0)
    return { status: "error", error: "missing-fields" };
  const sharedErr = validateShared(shared);
  if (sharedErr) return { status: "error", error: sharedErr };

  console.log("[quote]", { ...shared, company, industry, services, budget });
  return { status: "success" };
}

// ─── /dijital-checkup ────────────────────────────────────────────────────
export async function submitCheckupRequest(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  if (isHoneypotTriggered(formData)) return { status: "success" };
  const limited = await checkRateLimit("checkup");
  if (!limited.ok) return { status: "error", error: "rate-limited" };

  const shared = readShared(formData);
  const platforms = formData.getAll("platforms").map(String);
  const website = String(formData.get("website") ?? "");
  const sector = String(formData.get("sector") ?? "").trim();

  if (platforms.length === 0 || !website || !sector)
    return { status: "error", error: "missing-fields" };

  const sharedErr = validateShared(shared);
  if (sharedErr) return { status: "error", error: sharedErr };

  if (shared.phone && !isPhone(shared.phone))
    return { status: "error", error: "invalid-phone" };

  const handles: Record<string, string> = {};
  for (const p of platforms) {
    const h = String(formData.get(`handle_${p}`) ?? "").trim();
    if (h) handles[p] = h;
  }

  console.log("[checkup]", { ...shared, sector, platforms, handles, website });
  return { status: "success" };
}

// ─── /strateji-gorusmesi ─────────────────────────────────────────────────
export async function submitMeetingRequest(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  if (isHoneypotTriggered(formData)) return { status: "success" };
  const limited = await checkRateLimit("meeting");
  if (!limited.ok) return { status: "error", error: "rate-limited" };

  const shared = readShared(formData);
  const slots = formData.getAll("slots").map(String);
  const topic = String(formData.get("topic") ?? "").trim();

  if (slots.length === 0 || !topic)
    return { status: "error", error: "missing-fields" };
  const sharedErr = validateShared(shared);
  if (sharedErr) return { status: "error", error: sharedErr };

  console.log("[meeting]", { ...shared, topic, slots });
  return { status: "success" };
}
