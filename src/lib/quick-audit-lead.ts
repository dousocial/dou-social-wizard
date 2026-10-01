import { supabase } from "@/lib/supabase";
import type { QuickAuditReport } from "./quick-audit-types";

export function normalizeAuditPhone(value: unknown): string {
  if (
    typeof value !== "string" ||
    value.length > 40 ||
    !/^(?:\+)?[\d\s().-]+$/.test(value)
  )
    throw new Error("Geçerli bir telefon numarası girin.");
  const text = value.trim();
  let digits = text.replace(/\D/g, "");
  if (text.startsWith("00")) digits = digits.slice(2);
  else if (!text.startsWith("+")) {
    if (digits.length === 11 && digits.startsWith("0"))
      digits = `90${digits.slice(1)}`;
    else if (digits.length === 10) digits = `90${digits}`;
  }
  if (!/^[1-9]\d{9,14}$/.test(digits) || /^([\d])\1+$/.test(digits))
    throw new Error("Geçerli bir telefon numarası girin.");
  return `+${digits}`;
}

export async function saveQuickAuditLead(
  phone: string,
  report: QuickAuditReport
): Promise<void> {
  const source = report.sources[0];
  const text = [
    "Web sitesi / Instagram ön incelemesi",
    `Analiz tarihi: ${report.checkedAt}`,
    "Kullanıcı telefon ve analiz bilgilerinin talebine yanıt vermek için kaydedilmesini onayladı.",
    ...report.sources.flatMap((source) => [
      "",
      `${source.kind === "website" ? "Web sitesi" : "Instagram"}: ${source.url}`,
      source.summary,
      ...source.findings.map(
        (finding) => `${finding.label}: ${finding.detail}`
      ),
    ]),
    "",
    ...report.limitations,
  ].join("\n");
  const { error } = await supabase.from("audits").insert({
    business_name:
      source?.kind === "instagram"
        ? `@${new URL(source.url).pathname.split("/").filter(Boolean)[0]}`
        : source
          ? new URL(source.url).hostname
          : "Ücretsiz analiz",
    sector: "Belirtilmedi",
    phone,
    email: "",
    mode: "manual",
    active_platforms: report.sources.map((source) =>
      source.kind === "instagram" ? "instagram" : "website"
    ),
    score_overall: 0,
    score_instagram: 0,
    score_linkedin: 0,
    score_youtube: 0,
    score_google: 0,
    report_text: text,
  });
  if (error) throw new Error("Analiz başvurusu kaydedilemedi.");
}
