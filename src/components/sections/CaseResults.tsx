import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal";

interface ResultMetric {
  value: string;
  label: string;
}

export function CaseResults({ slug }: { slug: string }) {
  const t = useTranslations(`Cases.items.${slug}.results`);
  const tShared = useTranslations("Cases._shared");
  const metrics = t.raw("metrics") as ResultMetric[];

  return (
    <Section spacing="md" className="bg-ink text-paper">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {tShared("resultsEyebrow")}
          </p>
          <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-6 text-lg text-mute-300">{t("summary")}</p>
        </Reveal>

        <Reveal stagger className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m, i) => (
            <RevealItem key={i}>
              <div className="flex flex-col">
                <span className="font-display text-6xl leading-none tracking-tight md:text-7xl">
                  {m.value}
                </span>
                <p className="mt-4 max-w-[14rem] text-sm text-mute-300">
                  {m.label}
                </p>
              </div>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
