"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CaseDrawer } from "@/components/sections/CaseDrawer";
import { type CaseSlug } from "@/lib/cases";

const PROJECTS = [
  {
    id: "case1",
    slug: "e-ticaret-3x-donusum" as CaseSlug,
    metric: "3.4×",
    bg: "from-stone-200 to-stone-300 dark:from-mute-200 dark:to-mute-300",
    initial: "GM",
    textColor: "text-stone-500 dark:text-mute-500",
  },
  {
    id: "case2",
    slug: "b2b-yazilim-lead-jenerasyonu" as CaseSlug,
    metric: "%58",
    bg: "from-ink to-mute-800",
    initial: "SB",
    textColor: "text-mute-500",
  },
  {
    id: "case3",
    slug: "restoran-yerel-buyume" as CaseSlug,
    metric: "2×",
    bg: "from-accent/20 to-accent/5",
    initial: "LN",
    textColor: "text-accent/50",
  },
] as const;

export function ClientsGrid() {
  const t = useTranslations("CaseStudies");
  const [activeSlug, setActiveSlug] = useState<CaseSlug | null>(null);

  return (
    <Section spacing="lg" className="bg-mute-50">
      <Container size="wide">

        {/* Header */}
        <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {t("eyebrow")}
            </p>
            <h2
              className="mt-3 font-display leading-tight tracking-tight text-ink"
              style={{ fontSize: "var(--text-4xl)" }}
            >
              {t("title")}
            </h2>
          </div>
          <Link
            href="/projeler"
            className="text-sm font-medium text-mute-500 transition-colors duration-200 hover:text-ink md:text-right"
          >
            {t("viewAll")} →
          </Link>
        </Reveal>

        {/* Project cards */}
        <Reveal stagger className="mt-14 grid gap-6 md:grid-cols-3">
          {PROJECTS.map((p) => (
            <RevealItem key={p.id} variant="scaleUp">
              <button
                type="button"
                onClick={() => setActiveSlug(p.slug)}
                className="group block w-full overflow-hidden rounded-2xl border border-mute-200 bg-paper text-left transition-shadow duration-300 hover:shadow-lg"
              >
                {/* Image / gradient placeholder */}
                <div
                  className={`relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${p.bg} overflow-hidden`}
                >
                  {/* Large metric watermark */}
                  <span
                    className={`select-none font-display font-bold leading-none tracking-tight opacity-20 ${p.textColor}`}
                    style={{ fontSize: "clamp(4rem, 12vw, 7rem)" }}
                  >
                    {p.metric}
                  </span>

                  {/* Industry badge */}
                  <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                    {t(`${p.id}.industry`)}
                  </span>

                  {/* Hover arrow */}
                  <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-paper/0 transition-all duration-300 group-hover:bg-paper/90">
                    <svg
                      className="h-3.5 w-3.5 text-ink opacity-0 transition-all duration-300 group-hover:opacity-100"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M2 10L10 2m0 0H4m6 0v6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-mute-400">
                    {t(`${p.id}.industry`)}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold leading-snug tracking-tight text-ink">
                    {t(`${p.id}.title`)}
                  </h3>
                  <p className="mt-3 border-t border-mute-100 pt-3 font-display text-xl font-bold text-accent">
                    {p.metric}{" "}
                    <span className="text-sm font-normal text-mute-500">
                      {t(`${p.id}.metric`)}
                    </span>
                  </p>
                </div>
              </button>
            </RevealItem>
          ))}
        </Reveal>

      </Container>

      <CaseDrawer slug={activeSlug} onClose={() => setActiveSlug(null)} />
    </Section>
  );
}
