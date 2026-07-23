"use client";

import { useState, useCallback } from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitCheckupRequest } from "@/lib/actions/forms";
import { Button } from "@/components/ui/Button";
import { RadioGroup } from "./Field";
import { Honeypot } from "./Honeypot";
import { KVKKConsentField } from "./KVKKConsentField";
import { getLenis } from "@/components/layout/SmoothScrollProvider";
import { cn } from "@/lib/utils";
import type { FormState } from "@/lib/actions/forms";

const initial: FormState = { status: "idle" };

const ALL_PLATFORMS = ["instagram", "meta-ads", "tiktok", "youtube", "google", "linkedin"] as const;
type Platform = (typeof ALL_PLATFORMS)[number];

// ─── Platform icons ───────────────────────────────────────────────────────────
const PLATFORM_ICONS: Record<Platform, string> = {
  instagram: "📸",
  "meta-ads": "📢",
  tiktok: "🎵",
  youtube: "▶️",
  google: "📍",
  linkedin: "💼",
};

// ─── Phone formatter ─────────────────────────────────────────────────────────
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

const baseInputClass = cn(
  "w-full rounded-xl border border-mute-200 bg-paper px-4 py-3 text-ink",
  "placeholder:text-mute-400",
  "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15",
  "hover:border-mute-300 transition-all duration-200"
);

export function CheckupForm() {
  const t = useTranslations("Checkup.form");
  const [state, formAction, isPending] = useActionState(submitCheckupRequest, initial);
  const [selected, setSelected] = useState<Platform[]>([]);
  const [phone, setPhone] = useState("");

  const toggle = useCallback((p: Platform) => {
    setSelected((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }, []);

  const websiteOptions = (["yes", "no", "renewal"] as const).map((v) => ({
    value: v,
    label: t(`website.options.${v}`),
  }));

  const sectorOptions = (
    ["ecommerce", "food", "beauty", "health", "education", "hospitality", "retail", "realestate", "legal", "tech", "other"] as const
  ).map((v) => ({ value: v, label: t(`sector.options.${v}`) }));

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-mute-200 bg-mute-50 p-10 text-center">
        <div className="text-4xl">✅</div>
        <h3 className="mt-4 font-display text-3xl tracking-tight text-ink">
          {t("successTitle")}
        </h3>
        <p className="mt-4 text-mute-600">{t("successBody")}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-10">
      <Honeypot />

      {/* ── 1. Platformlar ─────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <p className="text-sm font-medium text-ink">{t("platforms.label")}</p>
          <p className="mt-0.5 text-xs text-mute-400">{t("platforms.hint")}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {ALL_PLATFORMS.map((p) => (
            <label
              key={p}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all duration-150",
                selected.includes(p)
                  ? "border-accent bg-accent/5 shadow-[0_0_0_2px_rgb(128_0_0_/_0.08)]"
                  : "border-mute-200 bg-paper hover:border-mute-400 hover:bg-mute-50"
              )}
            >
              <input
                type="checkbox"
                name="platforms"
                value={p}
                checked={selected.includes(p)}
                onChange={() => toggle(p)}
                className="h-4 w-4 cursor-pointer accent-accent"
              />
              <span className="mr-1">{PLATFORM_ICONS[p]}</span>
              <span className="text-ink">{t(`platforms.options.${p}`)}</span>
            </label>
          ))}
        </div>
      </section>

      {/* ── 2. Platform kullanıcı adları + ekran görüntüleri ──────────────── */}
      {selected.length > 0 && (
        <section className="space-y-6 rounded-2xl border border-mute-100 bg-mute-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">
            Hesap bilgileri
          </p>
          {selected.map((p) => (
            <div key={p} className="space-y-3 border-t border-mute-200 pt-5 first:border-0 first:pt-0">
              <p className="text-sm font-semibold text-ink">
                {PLATFORM_ICONS[p]} {t(`platforms.options.${p}`)}
              </p>

              {/* Kullanıcı adı */}
              <input
                name={`handle_${p}`}
                type="text"
                placeholder={t(`handlePlaceholders.${p}`)}
                aria-label={t(`handles.${p}`)}
                className={baseInputClass}
              />

              {/* Ekran görüntüsü alanı */}
              <div className="space-y-3">
                {/* Örnek fotoğraf — üstte büyük ve belirgin */}
                <div>
                  <p className="mb-1.5 text-xs font-medium text-ink">
                    Nasıl görünmeli?{" "}
                    <span className="font-normal text-mute-400">
                      — Bu ekranın görüntüsünü al
                    </span>
                  </p>
                  <div className="overflow-hidden rounded-xl border border-mute-200 bg-mute-100">
                    <img
                      src={`/examples/${p}-guide.png`}
                      alt={`${t(`platforms.options.${p}`)} istatistik ekranı örneği`}
                      className="w-full object-cover object-top"
                      style={{ maxHeight: 220 }}
                      onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement;
                        el.parentElement!.style.display = "none";
                      }}
                    />
                  </div>
                </div>

                {/* Adım adım rehber */}
                <p className="text-xs leading-relaxed text-mute-500">
                  📋 {t(`screenshots.guides.${p}`)}
                </p>

                {/* Dosya yükleme */}
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-mute-300 bg-paper px-4 py-3 transition hover:border-accent/50 hover:bg-accent/5">
                  <span className="text-xl">📎</span>
                  <div className="flex-1 text-xs text-mute-500">
                    <span className="font-medium text-ink">Ekran görüntüsü seç</span>
                    {" "}— isteğe bağlı
                  </div>
                  <input
                    name={`screenshot_${p}`}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── 3. İşletme bilgileri ───────────────────────────────────────────── */}
      <section className="space-y-6">
        {/* Sektör */}
        <label className="block">
          <span className="block text-sm font-medium text-ink">{t("sector.label")}</span>
          <select
            name="sector"
            required
            onFocus={() => getLenis()?.stop()}
            onBlur={() => getLenis()?.start()}
            onChange={() => getLenis()?.start()}
            defaultValue=""
            className={cn(baseInputClass, "mt-2 cursor-pointer")}
          >
            <option value="" disabled>
              {t("sector.placeholder")}
            </option>
            {sectorOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        {/* Website */}
        <RadioGroup
          label={t("website.label")}
          name="website"
          required
          options={websiteOptions}
        />
      </section>

      {/* ── 4. İletişim bilgileri ──────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* İsim */}
          <label className="block">
            <span className="block text-sm font-medium text-ink">{t("name")}</span>
            <input
              name="name"
              type="text"
              autoComplete="name"
              required
              className={cn(baseInputClass, "mt-2")}
            />
          </label>
          {/* Telefon */}
          <label className="block">
            <span className="block text-sm font-medium text-ink">{t("phone")}</span>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder={t("phonePlaceholder")}
              pattern="0[0-9]{3} [0-9]{3} [0-9]{4}"
              minLength={13}
              maxLength={13}
              title="0555 555 5555 formatında gir"
              className={cn(baseInputClass, "mt-2")}
            />
          </label>
        </div>
        {/* E-posta */}
        <label className="block">
          <span className="block text-sm font-medium text-ink">{t("email")}</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className={cn(baseInputClass, "mt-2")}
          />
        </label>
      </section>

      {/* ── 5. Onay + Gönder ──────────────────────────────────────────────── */}
      <KVKKConsentField />

      {state.status === "error" && (
        <p className="text-sm text-accent">{t(`errors.${state.error}`)}</p>
      )}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? t("sending") : t("submit")}
      </Button>
    </form>
  );
}
