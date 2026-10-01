"use client";

import { MARKETING_SERVICES } from "@/lib/marketing-services";
import { MarketingServiceCard } from "./MarketingServiceCard";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { ServiceDrawer } from "@/components/sections/ServiceDrawer";
import { ServiceGallery } from "@/components/sections/ServiceGallery";
import { type ServiceSlug } from "@/lib/services";

// ─── Service definitions ──────────────────────────────────────────────────────

const SERVICES = [
  {
    num: "01",
    key: "sosyal-medya-marka",
    slug: "sosyal-medya-marka" as ServiceSlug,
  },
  { num: "02", key: "meta-reklamlari", slug: "meta-reklamlari" as ServiceSlug },
  { num: "03", key: "icerik-video", slug: "icerik-video" as ServiceSlug },
  {
    num: "04",
    key: "performans-pazarlama",
    slug: "performans-pazarlama" as ServiceSlug,
  },
] as const;

// ─── Icons ────────────────────────────────────────────────────────────────────

function SocialIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" aria-hidden>
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MetaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" aria-hidden>
      <rect
        x="2"
        y="2"
        width="9"
        height="9"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="13"
        y="2"
        width="9"
        height="9"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="2"
        y="13"
        width="9"
        height="9"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="17.5"
        cy="17.5"
        r="4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M17.5 15.5v4M15.5 17.5h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ContentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" aria-hidden>
      <path
        d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PerformanceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" aria-hidden>
      <path
        d="M3 17l4-8 4 5 3-3 4 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 21H3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const ICONS = {
  "sosyal-medya-marka": SocialIcon,
  "meta-reklamlari": MetaIcon,
  "icerik-video": ContentIcon,
  "performans-pazarlama": PerformanceIcon,
} as const;

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" className={className} fill="none" aria-hidden>
      <path
        d="M1 7h12m0 0L8 2m5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Services() {
  const t = useTranslations("Services");
  const locale = useLocale();
  const [activeSlug, setActiveSlug] = useState<ServiceSlug | null>(null);

  const [featured, ...rest] = SERVICES;
  const FeaturedIcon = ICONS[featured.key];

  return (
    <Section spacing="md" className="border-mute-100 border-t">
      <Container size="wide">
        {/* Section header */}
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-lg">
            <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase">
              {t("eyebrow")}
            </p>
            <h2
              className="font-display text-ink mt-4 leading-[1.1] font-bold tracking-tight"
              style={{ fontSize: "var(--text-4xl)" }}
            >
              {t("title")}
            </h2>
          </div>
          <p
            className="text-mute-500 max-w-sm md:text-right"
            style={{ fontSize: "var(--text-base)" }}
          >
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
            className="group bg-ink hover:bg-mute-900 relative block w-full overflow-hidden p-8 text-left transition-colors duration-300 md:p-12 lg:p-16"
          >
            <div className="flex items-start justify-between">
              <span className="font-display text-mute-700 text-sm font-semibold tracking-[0.2em]">
                {featured.num}
              </span>
              <div className="text-mute-700 group-hover:text-mute-500 h-10 w-10 transition-colors duration-300 md:h-12 md:w-12">
                <FeaturedIcon />
              </div>
            </div>

            <h3
              className="font-display text-paper mt-10 leading-tight font-bold tracking-tight md:mt-14"
              style={{ fontSize: "var(--text-5xl)" }}
            >
              {t(`${featured.key}.title`)}
            </h3>

            <p
              className="text-mute-400 mt-4 max-w-xl"
              style={{ fontSize: "var(--text-base)" }}
            >
              {t(`${featured.key}.description`)}
            </p>

            <div className="mt-8 flex items-center gap-3 md:mt-12">
              <span className="border-mute-700 text-mute-600 group-hover:border-paper group-hover:bg-paper group-hover:text-ink flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300">
                <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
              <span className="text-mute-600 group-hover:text-paper text-sm font-medium transition-colors duration-200">
                {t("more")}
              </span>
            </div>
          </button>
        </Reveal>

        {/* 3-card grid */}
        <Reveal
          stagger
          className="bg-mute-200 mt-px grid gap-px md:grid-cols-3"
        >
          {rest
            .filter((s) => s.slug !== "meta-reklamlari")
            .map((s) => {
              const Icon = ICONS[s.key];
              return (
                <RevealItem key={s.key} variant="scaleUp">
                  <div className="group bg-paper relative h-full overflow-hidden">
                    {/* Accent left border */}
                    <div
                      aria-hidden
                      className="bg-accent pointer-events-none absolute top-0 left-0 h-full w-[3px] origin-top scale-y-0 transition-transform duration-500 ease-out group-hover:scale-y-100"
                    />
                    <button
                      type="button"
                      onClick={() => setActiveSlug(s.slug)}
                      className="bg-paper hover:bg-mute-50 relative z-10 flex h-full w-full flex-col p-8 text-left transition-colors duration-200 md:p-10"
                    >
                      {/* Number + icon */}
                      <div className="flex items-center justify-between">
                        <span className="font-display text-mute-400 text-sm font-semibold tracking-[0.2em]">
                          {s.num}
                        </span>
                        <div className="text-mute-300 group-hover:text-accent h-8 w-8 transition-colors duration-300">
                          <Icon />
                        </div>
                      </div>

                      {/* Title */}
                      <h3
                        className="font-display text-ink mt-8 leading-tight font-bold tracking-tight"
                        style={{ fontSize: "var(--text-2xl)" }}
                      >
                        {t(`${s.key}.title`)}
                      </h3>

                      {/* Description */}
                      <p className="text-mute-500 mt-3 flex-1 text-sm leading-relaxed">
                        {t(`${s.key}.description`)}
                      </p>

                      {/* CTA */}
                      <div className="text-mute-400 group-hover:text-accent mt-8 flex items-center gap-2 text-sm font-medium transition-colors duration-200">
                        <span>{t("more")}</span>
                        <ArrowIcon className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </div>
                    </button>
                  </div>
                </RevealItem>
              );
            })}
          {MARKETING_SERVICES.map((service) => (
            <RevealItem key={service.slug} variant="scaleUp">
              <MarketingServiceCard slug={service.slug} locale={locale} />
            </RevealItem>
          ))}
        </Reveal>

        {/* All services link */}
        <Reveal className="mt-8 flex justify-end">
          <Link
            href="/hizmetler"
            className="text-mute-500 hover:text-ink inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200"
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
