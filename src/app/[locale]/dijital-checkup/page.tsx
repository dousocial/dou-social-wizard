import { use } from "react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { CheckupForm } from "@/components/forms/CheckupForm";

const POINTS = ["analysis", "actionable", "free"] as const;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/dijital-checkup">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Checkup" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function CheckupPage({
  params,
}: PageProps<"/[locale]/dijital-checkup">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("Checkup");

  return (
    <>
      <Section spacing="hero">
        <Container>
          <Reveal className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {t("eyebrow")}
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight text-ink md:text-7xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-mute-600">
              {t("heroLead")}
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section spacing="md" className="border-t border-mute-100 bg-mute-50">
        <Container>
          <Reveal stagger className="grid gap-8 md:grid-cols-3">
            {POINTS.map((p, i) => (
              <RevealItem key={p}>
                <div className="flex flex-col">
                  <span className="font-display text-5xl leading-none text-accent">
                    0{i + 1}
                  </span>
                  <h3 className="mt-6 font-display text-2xl tracking-tight text-ink">
                    {t(`points.${p}.title`)}
                  </h3>
                  <p className="mt-3 text-mute-600">
                    {t(`points.${p}.description`)}
                  </p>
                </div>
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </Section>

      <Section spacing="md" className="border-t border-mute-100">
        <Container>
          <Reveal className="grid gap-12 lg:grid-cols-[1fr_2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {t("formEyebrow")}
              </p>
              <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl">
                {t("formTitle")}
              </h2>
              <p className="mt-4 text-mute-600">{t("formNote")}</p>
            </div>

            <div>
              <CheckupForm />
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
