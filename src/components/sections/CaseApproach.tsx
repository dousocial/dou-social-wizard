import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal";

interface ApproachStep {
  title: string;
  description: string;
}

export function CaseApproach({ slug }: { slug: string }) {
  const t = useTranslations(`Cases.items.${slug}.approach`);
  const tShared = useTranslations("Cases._shared");
  const steps = t.raw("steps") as ApproachStep[];

  return (
    <Section spacing="md">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {tShared("approachEyebrow")}
          </p>
          <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-ink md:text-5xl">
            {t("title")}
          </h2>
        </Reveal>

        <Reveal stagger as="ol" className="mt-12 grid gap-px bg-mute-200 md:grid-cols-2">
          {steps.map((s, i) => (
            <RevealItem key={i} as="li" className="bg-paper p-8 md:p-10">
              <span className="font-display text-4xl leading-none tracking-tight text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-6 font-display text-2xl tracking-tight text-ink">
                {s.title}
              </h3>
              <p className="mt-3 text-mute-600">{s.description}</p>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
