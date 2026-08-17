"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { ServiceDrawer } from "@/components/sections/ServiceDrawer";
import { ServiceGallery } from "@/components/sections/ServiceGallery";
import { type ServiceSlug } from "@/lib/services";

// ─── Service definitions ──────────────────────────────────────────────────────

const SERVICES = [
  { num: "01", key: "sosyal-medya-marka",    slug: "sosyal-medya-marka"    as ServiceSlug },
  { num: "02", key: "meta-reklamlari",       slug: "meta-reklamlari"       as ServiceSlug },
  { num: "03", key: "icerik-video",          slug: "icerik-video"          as ServiceSlug },
  { num: "04", key: "performans-pazarlama",  slug: "performans-pazarlama"  as ServiceSlug },
] as const;

// ─── Icons ────────────────────────────────────────────────────────────────────

function SocialIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" aria-hidden>
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MetaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" aria-hidden>
      <rect x="2" y="2" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="2" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="13" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.5" cy="17.5" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17.5 15.5v4M15.5 17.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ContentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" aria-hidden>
      <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PerformanceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" aria-hidden>
      <path d="M3 17l4-8 4 5 3-3 4 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 21H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const ICONS = {
  "sosyal-medya-marka":   SocialIcon,
  "meta-reklamlari":      MetaIcon,
  "icerik-video":         ContentIcon,
  "performans-pazarlama": PerformanceIcon,
} as const;

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" className={className} fill="none" aria-hidden>
      <path d="M1 7h12m0 0L8 2m5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Services() {
  const t = useTranslations("Services");
  const [activeSlug, setActiveSlug] = useState<ServiceSlug | null>(null);

  const [featured, ...rest] = SERVICES;
  const FeaturedIcon = ICONS[featured.key];

  return (
    <Section spacing="md" className="border-t border-mute-100">
      <Container size="wide">
        {/* Section header */}
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {t("eyebrow")}
            </p>
            <h2
              className="mt-4 font-display font-bold leading-[1.1] tracking-tight text-ink"
              style={{ fontSize: "var(--text-4xl)" }}
            >
              {t("title")}
            </h2>
          </div>
          <p className="max-w-sm text-mute-500 md:text-right" style={{ fontSize: "var(--text-base)" }}>
            {t("subtitle")}
          </p>
        </Reveal>

        {/* Auto-sliding gallery */}
        <ServiceGallery />

        {/* Featured card */}
        <Reveal variant="fadeUp" className="mt-12">
          <button
            type="button"
            onClick={() => setActiveSlug(featured.slug)}
            className="group relative block w-full overflow-hidden bg-ink p-8 text-left transition-colors duration-300 hover:bg-mute-900 md:p-12 lg:p-16"
          >
            <div className="flex items-start justify-between">
              <span className="font-display text-sm font-semibold tracking-[0.2em] text-mute-700">
                {featured.num}
              </span>
              <div className="h-10 w-10 text-mute-700 transition-colors duration-300 group-hover:text-mute-500 md:h-12 md:w-12">
                <FeaturedIcon />
              </div>
            </div>

            <h3
              className="mt-10 font-display font-bold leading-tight tracking-tight text-paper md:mt-14"
              style={{ fontSize: "var(--text-5xl)" }}
            >
              {t(`${featured.key}.title`)}
            </h3>

            <p
              className="mt-4 max-w-xl text-mute-400"
              style={{ fontSize: "var(--text-base)" }}
            >
              {t(`${featured.key}.description`)}
            </p>

            <div className="mt-8 flex items-center gap-3 md:mt-12">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-mute-700 text-mute-600 transition-all duration-300 group-hover:border-paper group-hover:bg-paper group-hover:text-ink">
                <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
              <span className="text-sm font-medium text-mute-600 transition-colors duration-200 group-hover:text-paper">
                {t("more")}
              </span>
            </div>
          </button>
        </Reveal>

        {/* 3-card grid */}
        <Reveal stagger className="mt-px grid gap-px bg-mute-200 md:grid-cols-3">
          {rest.map((s) => {
            const Icon = ICONS[s.key];
            return (
              <RevealItem key={s.key} variant="scaleUp">
                <div className="group relative h-full overflow-hidden bg-paper">
                  {/* Accent left border */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute left-0 top-0 h-full w-[3px] origin-top scale-y-0 bg-accent transition-transform duration-500 ease-out group-hover:scale-y-100"
                  />
                  <button
                    type="button"
                    onClick={() => setActiveSlug(s.slug)}
                    className="relative z-10 flex h-full w-full flex-col bg-paper p-8 text-left transition-colors duration-200 hover:bg-mute-50 md:p-10"
                  >
                    {/* Number + icon */}
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-semibold tracking-[0.2em] text-mute-400">
                        {s.num}
                      </span>
                      <div className="h-8 w-8 text-mute-300 transition-colors duration-300 group-hover:text-accent">
                        <Icon />
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      className="mt-8 font-display font-bold leading-tight tracking-tight text-ink"
                      style={{ fontSize: "var(--text-2xl)" }}
                    >
                      {t(`${s.key}.title`)}
                    </h3>

                    {/* Description */}
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-mute-500">
                      {t(`${s.key}.description`)}
                    </p>

                    {/* CTA */}
                    <div className="mt-8 flex items-center gap-2 text-sm font-medium text-mute-400 transition-colors duration-200 group-hover:text-accent">
                      <span>{t("more")}</span>
                      <ArrowIcon className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </div>
                  </button>
                </div>
              </RevealItem>
            );
          })}
        </Reveal>

        {/* All services link */}
        <Reveal className="mt-8 flex justify-end">
          <Link
            href="/hizmetler"
            className="inline-flex items-center gap-2 text-sm font-medium text-mute-500 transition-colors duration-200 hover:text-ink"
          >
            {t("allServices")}
            <ArrowIcon className="h-3 w-3" />
          </Link>
        </Reveal>
      </Container>

      <ServiceDrawer slug={activeSlug} onClose={() => setActiveSlug(null)} />
    </Section>
  );
}
