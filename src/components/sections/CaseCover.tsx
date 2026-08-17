import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";

export function CaseCover({ slug }: { slug: string }) {
  const t = useTranslations(`Cases.items.${slug}`);
  const tShared = useTranslations("Cases._shared");

  return (
    <Section spacing="lg">
      <Container>
        <Reveal>
          <Link
            href="/projeler"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-mute-500 transition hover:text-accent"
          >
            ← {tShared("back")}
          </Link>

          <div className="mt-10 grid gap-12 lg:grid-cols-[2fr_1fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {t("industry")} · {t("duration")}
              </p>
              <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight text-ink md:text-7xl">
                {t("title")}
              </h1>
              <p className="mt-6 max-w-2xl text-xl text-mute-600 md:text-2xl">
                {t("summary")}
              </p>
            </div>
            <div className="lg:text-right">
              <p className="font-display text-7xl leading-none tracking-tight text-accent md:text-9xl">
                {t("coverMetric")}
              </p>
              <p className="mt-3 text-sm text-mute-500">
                {t("coverMetricLabel")}
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
