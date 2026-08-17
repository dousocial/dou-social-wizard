import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal";

export function CaseChallenge({ slug }: { slug: string }) {
  const t = useTranslations(`Cases.items.${slug}.challenge`);
  const tShared = useTranslations("Cases._shared");
  const points = t.raw("points") as string[];

  return (
    <Section spacing="md" className="border-t border-mute-100 bg-mute-50">
      <Container>
        <Reveal className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {tShared("challengeEyebrow")}
            </p>
            <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl">
              {t("title")}
            </h2>
          </div>
          <div className="space-y-6">
            <p className="text-lg text-mute-700">{t("intro")}</p>
            <ul className="space-y-3 border-l-2 border-accent pl-6">
              {points.map((p, i) => (
                <RevealItem key={i} as="li" className="text-mute-700">
                  {p}
                </RevealItem>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
