import { use } from "react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { QuoteForm } from "@/components/forms/QuoteForm";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/teklif-al">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Quote" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function QuotePage({
  params,
}: PageProps<"/[locale]/teklif-al">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("Quote");

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

            <ul className="mt-10 space-y-4 border-l-2 border-accent pl-6 text-sm text-mute-700">
              <li>{t("perks.p1")}</li>
              <li>{t("perks.p2")}</li>
              <li>{t("perks.p3")}</li>
            </ul>
          </div>

          <div>
            <QuoteForm />
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
