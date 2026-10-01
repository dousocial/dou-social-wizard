import { alternatesFor } from "@/lib/site";
import { use } from "react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { FinalCTA } from "@/components/sections/FinalCTA";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/projeler">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Cases" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: true },
    alternates: alternatesFor("/projeler", locale as "tr" | "en"),
  };
}

export default function CasesHubPage({
  params,
}: PageProps<"/[locale]/projeler">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("Cases");

  return (
    <>
      <Section spacing="hero">
        <Container>
          <Reveal className="max-w-3xl">
            <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase">
              {t("eyebrow")}
            </p>
            <h1
              className="font-display text-ink mt-6 leading-[1.05] font-bold tracking-tight"
              style={{ fontSize: "var(--text-6xl)" }}
            >
              {t("heroTitle")}
            </h1>
            <p
              className="text-mute-600 mt-6 max-w-xl"
              style={{ fontSize: "var(--text-lg)" }}
            >
              {t("heroLead")}
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section spacing="md" className="border-mute-100 border-t">
        <Container>
          <Reveal className="flex flex-col items-center py-24 text-center">
            <span className="border-accent/30 bg-accent/5 text-accent inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
              <span className="bg-accent h-1.5 w-1.5 animate-pulse rounded-full" />
              Çok Yakında
            </span>
            <h2
              className="font-display text-ink mt-8 font-bold tracking-tight"
              style={{ fontSize: "var(--text-5xl)" }}
            >
              Projelerimiz hazırlanıyor.
            </h2>
            <p
              className="text-mute-500 mt-5 max-w-md"
              style={{ fontSize: "var(--text-lg)" }}
            >
              Gerçekleştirdiğimiz çalışmaları en kısa sürede burada paylaşıyor
              olacağız.
            </p>
          </Reveal>
        </Container>
      </Section>
      <FinalCTA />
    </>
  );
}
