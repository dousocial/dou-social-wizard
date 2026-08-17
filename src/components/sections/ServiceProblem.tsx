import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal";

export function ServiceProblem({ slug }: { slug: string }) {
  const t = useTranslations(`ServicesDetail.${slug}.problem`);
  const tShared = useTranslations("ServicesDetail._shared");
  const points = t.raw("points") as string[];

  return (
    <Section spacing="md" className="border-t border-mute-100 bg-mute-50">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {tShared("problemEyebrow")}
          </p>
          <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-ink md:text-5xl">
            {t("title")}
          </h2>
        </Reveal>

        <Reveal stagger as="ul" className="mt-12 grid gap-px bg-mute-200 md:grid-cols-3">
          {points.map((point, i) => (
            <RevealItem key={i} as="li">
              <div className="flex h-full flex-col bg-paper p-8">
                <span className="font-display text-3xl text-accent">
                  ✕
                </span>
                <p className="mt-6 text-mute-700">{point}</p>
              </div>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
