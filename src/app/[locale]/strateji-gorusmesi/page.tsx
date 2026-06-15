import { use } from "react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { MeetingForm } from "@/components/forms/MeetingForm";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/strateji-gorusmesi">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meeting" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function MeetingPage({
  params,
}: PageProps<"/[locale]/strateji-gorusmesi">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("Meeting");

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
                  {t("info.duration.label")}
                </p>
                <p className="mt-1 text-ink">{t("info.duration.value")}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mute-500">
                  {t("info.format.label")}
                </p>
                <p className="mt-1 text-ink">{t("info.format.value")}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mute-500">
                  {t("info.cost.label")}
                </p>
                <p className="mt-1 text-ink">{t("info.cost.value")}</p>
              </div>
            </div>
          </div>

          <div>
            <MeetingForm />
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
