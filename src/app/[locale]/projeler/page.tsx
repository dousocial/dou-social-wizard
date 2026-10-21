import { alternatesFor } from "@/lib/site";
import { use } from "react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ClientReferences } from "@/components/sections/ClientReferences";
import { FinalCTA } from "@/components/sections/FinalCTA";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/projeler">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Cases" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: true, follow: true },
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
              style={{ fontSize: "clamp(2rem, 7vw, 4.5rem)" }}
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

      <ClientReferences />
      <FinalCTA />
    </>
  );
}
