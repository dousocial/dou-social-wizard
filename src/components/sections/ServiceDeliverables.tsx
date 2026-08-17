import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal";

export function ServiceDeliverables({ slug }: { slug: string }) {
  const t = useTranslations(`ServicesDetail.${slug}.deliverables`);
  const tShared = useTranslations("ServicesDetail._shared");
  const items = t.raw("items") as string[];

  return (
    <Section spacing="md" className="bg-ink text-paper">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {tShared("deliverablesEyebrow")}
          </p>
          <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight md:text-5xl">
            {t("title")}
          </h2>
        </Reveal>

        <Reveal stagger as="ul" className="mt-12 grid gap-x-12 gap-y-6 md:grid-cols-2">
          {items.map((item, i) => (
            <RevealItem key={i} as="li" className="flex items-start gap-4 border-b border-mute-700 pb-6">
              <span className="font-display text-sm tracking-widest text-mute-500">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-paper">{item}</p>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
