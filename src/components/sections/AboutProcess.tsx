import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal";

const STEPS = [
  { num: "01", key: "analyze" },
  { num: "02", key: "strategy" },
  { num: "03", key: "produce" },
  { num: "04", key: "optimize" },
] as const;

export function AboutProcess() {
  const t = useTranslations("About.process");

  return (
    <Section spacing="md" className="bg-ink">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 font-display text-4xl leading-[1.1] tracking-tight text-paper md:text-5xl">
            {t("title")}
          </h2>
        </Reveal>

        <Reveal stagger className="mt-16 grid gap-px bg-mute-700 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <RevealItem key={s.key}>
              <div className="flex h-full flex-col bg-ink p-8 md:p-10">
                <span className="font-display text-sm tracking-widest text-mute-600">
                  {s.num}
                </span>
                <h3 className="mt-5 font-display text-xl tracking-tight text-paper">
                  {t(`${s.key}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-mute-400">
                  {t(`${s.key}.description`)}
                </p>
              </div>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
