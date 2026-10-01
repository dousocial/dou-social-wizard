"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import dynamic from "next/dynamic";
import { trackEvent } from "@/lib/analytics";
import type { QuickAuditReport } from "@/lib/quick-audit-types";

const AdvancedAudit = dynamic(() =>
  import("./AuditTool").then((module) => module.AuditTool)
);

export function QuickAuditForm() {
  const en = useLocale() === "en";
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<QuickAuditReport | null>(null);
  const [advanced, setAdvanced] = useState(false);
  async function analyze(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setReport(null);
    if (!website.trim() && !instagram.trim()) {
      setError(
        en
          ? "Enter a website or Instagram username."
          : "Web sitesi adresi veya Instagram kullanıcı adı girin."
      );
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/quick-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          consent,
          website: website.trim(),
          instagram: instagram.trim(),
        }),
        signal: AbortSignal.timeout(60_000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setReport(data);
      trackEvent("generate_lead", { form_type: "quick_audit" });
      trackEvent("audit_completed", {
        source_count: data.sources.length,
        available_count: data.sources.filter(
          (source: { available: boolean }) => source.available
        ).length,
      });
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : en
            ? "Please try again."
            : "Lütfen tekrar deneyin."
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="space-y-8">
      <form
        onSubmit={analyze}
        className="border-mute-200 bg-paper rounded-2xl border p-6 md:p-8"
        aria-busy={pending}
      >
        <p className="text-mute-600 mb-6 text-sm" id="quick-audit-help">
          {en
            ? "Enter a website or Instagram username and your phone number. No email required."
            : "Web sitesi veya Instagram kullanıcı adı ile telefonunuzu paylaşın. E-posta zorunlu değil."}
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="audit-website"
              className="text-ink mb-2 block text-sm font-medium"
            >
              {en ? "Website" : "Web sitesi"}
            </label>
            <input
              id="audit-website"
              name="website"
              type="text"
              inputMode="url"
              autoComplete="url"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              maxLength={2048}
              placeholder="https://isletmeniz.com"
              aria-describedby="quick-audit-help"
              className="border-mute-200 bg-paper text-ink focus-visible:outline-accent w-full rounded-xl border px-4 py-3 focus-visible:outline-2"
            />
          </div>
          <div>
            <label
              htmlFor="audit-instagram"
              className="text-ink mb-2 block text-sm font-medium"
            >
              {en ? "Instagram username" : "Instagram kullanıcı adı"}
            </label>
            <input
              id="audit-instagram"
              name="instagram"
              type="text"
              autoCapitalize="none"
              spellCheck={false}
              value={instagram}
              onChange={(event) => setInstagram(event.target.value)}
              maxLength={160}
              placeholder="@isletmeniz"
              aria-describedby="quick-audit-help"
              className="border-mute-200 bg-paper text-ink focus-visible:outline-accent w-full rounded-xl border px-4 py-3 focus-visible:outline-2"
            />
          </div>
        </div>
        <div className="mt-6">
          <label
            htmlFor="audit-phone"
            className="text-ink mb-2 block text-sm font-medium"
          >
            {en ? "Phone number" : "Telefon numarası"}
          </label>
          <input
            id="audit-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            maxLength={40}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="05xx xxx xx xx"
            className="border-mute-200 bg-paper text-ink focus-visible:outline-accent w-full rounded-xl border px-4 py-3 focus-visible:outline-2"
          />
        </div>
        <label className="text-mute-600 mt-5 flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="consent"
            required
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="accent-accent mt-1 h-4 w-4 shrink-0"
          />
          <span>
            {en
              ? "I agree to my phone number and analysis being saved so DOU Social can respond to this request."
              : "Telefon numaramın ve analizimin DOU Social’ın bu talebime yanıt vermesi için kaydedilmesini kabul ediyorum."}{" "}
            <Link href="/gizlilik-politikasi" className="text-accent underline">
              {en ? "Privacy policy" : "Gizlilik politikası"}
            </Link>
          </span>
        </label>
        <p className="text-mute-500 mt-5 text-xs leading-relaxed">
          {en
            ? "We review accessible public information. Private Instagram metrics require account access. Your phone and review are saved as an analysis request."
            : "Erişilebilen herkese açık bilgiler incelenir. Özel Instagram istatistikleri için hesap erişimi gerekir. Telefonunuz ve analiziniz başvuru kaydı olarak saklanır."}
        </p>
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="bg-accent hover:bg-accent-hover focus-visible:outline-accent mt-6 min-h-12 rounded-full px-8 py-3 font-semibold text-white transition focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-60"
        >
          {pending
            ? en
              ? "Reviewing…"
              : "İnceleniyor…"
            : en
              ? "Start free review"
              : "Ücretsiz analizi başlat"}
        </button>
      </form>
      {report && (
        <section
          aria-live="polite"
          className="border-mute-200 space-y-6 rounded-2xl border p-6 md:p-8"
        >
          <h3 className="font-display text-ink text-2xl">
            {en ? "Preliminary review" : "Ön inceleme sonucu"}
          </h3>
          <p className="text-mute-500 text-xs">
            {new Date(report.checkedAt).toLocaleString(en ? "en-US" : "tr-TR")}
          </p>
          {report.sources.map((source) => (
            <div
              key={source.kind}
              className="border-mute-200 space-y-4 border-t pt-5"
            >
              <h4 className="text-ink font-semibold break-all">
                {source.kind === "website" ? "Web" : "Instagram"} · {source.url}
              </h4>
              <p className="text-mute-600 text-sm">{source.summary}</p>
              <ul className="space-y-4">
                {source.findings.map((finding) => (
                  <li key={finding.label} className="bg-mute-50 rounded-xl p-4">
                    <p className="text-ink font-medium">
                      {finding.status === "pass"
                        ? "✓"
                        : finding.status === "warning"
                          ? "!"
                          : "?"}{" "}
                      {finding.label}
                    </p>
                    <p className="text-mute-600 mt-1 text-sm break-words">
                      {finding.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <ul className="text-mute-500 space-y-2 text-xs">
            {report.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link
            href="/iletisim"
            className="text-accent inline-flex min-h-11 items-center underline underline-offset-4"
          >
            {en
              ? "Discuss the next steps"
              : "Sonraki adımları birlikte değerlendirelim"}
          </Link>
        </section>
      )}
      <div>
        <button
          type="button"
          aria-expanded={advanced}
          aria-controls="advanced-audit"
          onClick={() => setAdvanced(!advanced)}
          className="text-mute-600 min-h-11 text-sm underline underline-offset-4"
        >
          {en
            ? "Review with your metrics or screenshots"
            : "Metrik veya ekran görüntüsüyle detaylı analiz"}
        </button>
        {advanced && (
          <div id="advanced-audit" className="mt-6">
            <AdvancedAudit />
          </div>
        )}
      </div>
    </div>
  );
}
