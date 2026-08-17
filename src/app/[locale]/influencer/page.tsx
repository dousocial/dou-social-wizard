import { use } from "react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { InfluencerForm } from "@/components/forms/InfluencerForm";
import { alternatesFor } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/influencer">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Influencer" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: alternatesFor("/influencer", locale as "tr" | "en"),
  };
}

export default function InfluencerPage({
  params,
}: PageProps<"/[locale]/influencer">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("Influencer");

  return (
    <Section spacing="hero">
      <Container>
        <Reveal className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {t("eyebrow")}
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight text-ink md:text-6xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-6 max-w-md text-mute-600">{t("heroLead")}</p>

            <div className="mt-10 space-y-6 border-l-2 border-accent pl-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mute-500">
                  {t("info.sure.label")}
                </p>
                <p className="mt-1 text-ink">{t("info.sure.value")}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mute-500">
                  {t("info.donus.label")}
                </p>
                <p className="mt-1 text-ink">{t("info.donus.value")}</p>
              </div>
            </div>

            <div className="mt-8">
              <a
                href="/influencerlar"
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-all hover:gap-3"
              >
                Çalıştığımız Influencer&apos;ları İncele
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <InfluencerForm />
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
