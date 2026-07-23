"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { CaseDrawer } from "@/components/sections/CaseDrawer";
import { CASE_SLUGS, type CaseSlug } from "@/lib/cases";

// Alternating dark backgrounds per card for visual variety
const CARD_BG = [
  "bg-ink",
  "bg-mute-900",
  "bg-mute-800",
  "bg-ink",
  "bg-mute-900",
] as const;

export function CasesHubGrid() {
  const t = useTranslations("Cases.items");
  const [activeSlug, setActiveSlug] = useState<CaseSlug | null>(null);

  return (
    <Section spacing="md" className="border-t border-mute-100">
      <Container>
        <Reveal stagger className="grid gap-10 md:grid-cols-2 lg:gap-14">
          {CASE_SLUGS.map((slug, i) => (
            <RevealItem key={slug}>
              <button
                type="button"
                onClick={() => setActiveSlug(slug)}
                className="group block w-full text-left"
              >
                {/* Card image area */}
                <div className="overflow-hidden">
                  <div
                    className={`relative aspect-[4/3] w-full ${CARD_BG[i % CARD_BG.length]} transition-transform duration-700 ease-out group-hover:scale-[1.025]`}
                  >
                    {/* Industry tag + number */}
                    <div className="absolute left-0 right-0 top-0 flex items-start justify-between p-7 md:p-8">
                      <span className="text-xs font-medium uppercase tracking-[0.2em] text-paper/40">
                        {t(`${slug}.industry`)}
                      </span>
                      <span className="text-xs font-medium uppercase tracking-[0.18em] text-paper/30">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Hero metric number */}
                    <div className="flex h-full items-end justify-start p-7 pb-9 md:p-8">
                      <span
                        className="select-none font-display font-bold leading-none text-paper/15 transition-colors duration-500 group-hover:text-accent/50"
                        style={{ fontSize: "clamp(3.5rem, 10vw, 6.5rem)" }}
                      >
                        {t(`${slug}.coverMetric`)}
                      </span>
                    </div>

                    {/* Hover gradient overlay */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    {/* Reveal CTA on hover */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2.5 translate-y-3 p-7 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 md:p-8">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-paper">
                        İncele
                      </span>
                      <svg viewBox="0 0 14 14" className="h-3 w-3 text-paper" fill="none" aria-hidden>
                        <path d="M1 7h12m0 0L8 2m5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Below-card info */}
                <div className="mt-5 flex items-baseline justify-between gap-4">
                  <h3
                    className="font-display leading-tight tracking-tight text-ink transition-colors duration-200 group-hover:text-accent"
                    style={{ fontSize: "var(--text-2xl)" }}
                  >
                    {t(`${slug}.title`)}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-mute-500">
                  {t(`${slug}.summary`)}
                </p>
              </button>
            </RevealItem>
          ))}
        </Reveal>
      </Container>

      <CaseDrawer slug={activeSlug} onClose={() => setActiveSlug(null)} />
    </Section>
  );
}
