"use client";

import { MARKETING_SERVICES } from "@/lib/marketing-services";
import { MarketingServiceCard } from "./MarketingServiceCard";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceDrawer } from "@/components/sections/ServiceDrawer";
import { SERVICE_SLUGS, type ServiceSlug } from "@/lib/services";

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

function GoogleSeoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" aria-hidden>
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M21 21l-4.35-4.35"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11 8v6M8 11h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WebIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" aria-hidden>
      <rect
        x="2"
        y="3"
        width="20"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 21h8M12 17v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M2 7h20" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function BrandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" aria-hidden>
      <path
        d="M12 2l2.09 6.26H21l-5.45 3.96 2.09 6.26L12 14.52l-5.64 3.96 2.09-6.26L3 8.26h6.91L12 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfluencerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" aria-hidden>
      <path
        d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EcommerceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" aria-hidden>
      <path
        d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 6h18M16 10a4 4 0 01-8 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrmIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" aria-hidden>
      <rect
        x="2"
        y="3"
        width="20"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 21h8M12 17v4M7 8h10M7 12h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const SERVICE_ICONS: Record<ServiceSlug, React.ComponentType> = {
  "sosyal-medya-marka": SocialIcon,
  "meta-reklamlari": MetaIcon,
  "icerik-video": ContentIcon,
  "performans-pazarlama": PerformanceIcon,
  "google-seo": GoogleSeoIcon,
  "web-yazilim": WebIcon,
  "kurumsal-kimlik": BrandIcon,
  "influencer-marketing": InfluencerIcon,
  "eticaret-buyume": EcommerceIcon,
  "crm-dijital": CrmIcon,
};

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

export function ServicesHubGrid() {
  const tHub = useTranslations("ServicesHub");
  const tItem = useTranslations("ServicesHub.items");
  const locale = useLocale();
  const [activeSlug, setActiveSlug] = useState<ServiceSlug | null>(null);

  const [featured, ...rest] = SERVICE_SLUGS;
  const FeaturedIcon = SERVICE_ICONS[featured];

  return (
    <Section spacing="md">
      <Container>
        {/* Featured card */}
        <Reveal variant="fadeUp">
          <button
            type="button"
            onClick={() => setActiveSlug(featured)}
            className="group bg-ink hover:bg-mute-900 relative block w-full overflow-hidden p-8 text-left transition-colors duration-300 md:p-12 lg:p-16"
          >
            <div className="flex items-start justify-between">
              <span className="font-display text-mute-700 text-sm font-semibold tracking-[0.2em]">
                01
              </span>
              <div className="text-mute-700 group-hover:text-mute-500 h-10 w-10 transition-colors duration-300 md:h-12 md:w-12">
                <FeaturedIcon />
              </div>
            </div>

            <h3
              className="font-display text-paper mt-10 leading-tight font-bold tracking-tight md:mt-14"
              style={{ fontSize: "var(--text-5xl)" }}
            >
              {tItem(`${featured}.title`)}
            </h3>

            <p
              className="text-mute-400 mt-4 max-w-xl"
              style={{ fontSize: "var(--text-base)" }}
            >
              {tItem(`${featured}.summary`)}
            </p>

            <div className="mt-8 flex items-center gap-3 md:mt-12">
              <span className="border-mute-700 text-mute-600 group-hover:border-paper group-hover:bg-paper group-hover:text-ink flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300">
                <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
              <span className="text-mute-600 group-hover:text-paper text-sm font-medium transition-colors duration-200">
                {tHub("more")}
              </span>
            </div>
          </button>
        </Reveal>

        {/* Grid */}
        <div
          className="bg-mute-200 mt-px grid gap-px md:grid-cols-2 lg:grid-cols-3"
        >
          {rest
            .filter((slug) => slug !== "meta-reklamlari")
            .map((slug, i) => {
              const Icon = SERVICE_ICONS[slug];
              return (
                <Reveal key={slug} variant="scaleUp">
                  <div className="group bg-paper relative h-full overflow-hidden">
                    <div
                      aria-hidden
                      className="bg-accent pointer-events-none absolute top-0 left-0 h-full w-[3px] origin-top scale-y-0 transition-transform duration-500 ease-out group-hover:scale-y-100"
                    />
                    <button
                      type="button"
                      onClick={() => setActiveSlug(slug)}
                      className="bg-paper hover:bg-mute-50 relative z-10 flex h-full w-full flex-col p-8 text-left transition-colors duration-200 md:p-10"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-mute-400 text-sm font-semibold tracking-[0.2em]">
                          {String(i + 2).padStart(2, "0")}
                        </span>
                        <div className="text-mute-300 group-hover:text-accent h-8 w-8 transition-colors duration-300">
                          <Icon />
                        </div>
                      </div>

                      <h3
                        className="font-display text-ink mt-8 leading-tight font-bold tracking-tight"
                        style={{ fontSize: "var(--text-xl)" }}
                      >
                        {tItem(`${slug}.title`)}
                      </h3>

                      <p className="text-mute-500 mt-3 flex-1 text-sm leading-relaxed">
                        {tItem(`${slug}.summary`)}
                      </p>

                      <div className="text-mute-400 group-hover:text-accent mt-8 flex items-center gap-2 text-sm font-medium transition-colors duration-200">
                        <span>{tHub("more")}</span>
                        <ArrowIcon className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </div>
                    </button>
                  </div>
                </Reveal>
              );
            })}
          {MARKETING_SERVICES.map((service) => (
            <Reveal key={service.slug} variant="scaleUp">
              <MarketingServiceCard slug={service.slug} locale={locale} />
            </Reveal>
          ))}
        </div>
      </Container>

      <ServiceDrawer slug={activeSlug} onClose={() => setActiveSlug(null)} />
    </Section>
  );
}
