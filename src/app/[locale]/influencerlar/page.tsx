import { use } from "react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { InfluencersHub } from "@/components/influencers/InfluencersHub";
import { InfluencerCtaSection } from "@/components/influencers/InfluencerCtaSection";
import { getPublishedInfluencers } from "@/lib/influencers";
import { alternatesFor } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/influencerlar">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "InfluencersHub" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: alternatesFor("/influencerlar", locale as "tr" | "en"),
  };
}

export default function InfluencersPage({
  params,
}: PageProps<"/[locale]/influencerlar">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("InfluencersHub");

  // Server-side fetching from Supabase (with fallback demo items)
  const influencersPromise = getPublishedInfluencers();
  const influencers = use(influencersPromise);

  return (
    <>
      {/* ── Hero Section ── */}
      <Section spacing="hero">
        <Container>
          <Reveal className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {t("eyebrow")}
            </p>
            <h1
              className="mt-6 font-display font-bold leading-[1.05] tracking-tight text-ink dark:text-white"
              style={{ fontSize: "var(--text-6xl)" }}
            >
              {t("heroTitle")}
            </h1>
            <p
              className="mt-6 max-w-2xl text-mute-600 dark:text-mute-300"
              style={{ fontSize: "var(--text-lg)" }}
            >
              {t("heroLead")}
            </p>

            {/* Stats Highlights */}
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-mute-100 pt-8 dark:border-mute-800">
              <div>
                <p className="font-display text-2xl font-bold text-ink dark:text-white md:text-3xl">
                  5+
                </p>
                <p className="mt-1 text-xs text-mute-500">{t("stats.creators")}</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-ink dark:text-white md:text-3xl">
                  100K+
                </p>
                <p className="mt-1 text-xs text-mute-500">{t("stats.reach")}</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-ink dark:text-white md:text-3xl">
                  %100
                </p>
                <p className="mt-1 text-xs text-mute-500">{t("stats.organic")}</p>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ── Interactive Hub (Filter, Search, Video, Direct Instagram) ── */}
      <InfluencersHub initialInfluencers={influencers} />

      {/* ── CTA Banner ── */}
      <InfluencerCtaSection />
    </>
  );
}
