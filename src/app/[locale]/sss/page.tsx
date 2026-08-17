import { use } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { FAQSection } from "@/components/sections/FAQSection";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { alternatesFor } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "FAQ" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: alternatesFor("/sss", locale as "tr" | "en"),
  };
}

export default function FAQPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <>
      <FAQHero />
      <FAQSection />
      <FinalCTA />
    </>
  );
}

async function FAQHero() {
  const t = await getTranslations("FAQ");

  return (
    <Section spacing="hero" className="border-b border-mute-100">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {t("eyebrow")}
          </p>
          <h1
            className="mt-6 font-display font-bold leading-[1.05] tracking-tight text-ink"
            style={{ fontSize: "var(--text-6xl)" }}
          >
            {t("heroTitle")}
          </h1>
          <p
            className="mt-6 text-mute-600"
            style={{ fontSize: "var(--text-lg)" }}
          >
            {t("heroLead")}
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
