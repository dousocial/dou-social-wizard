import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import type { AccordionItem } from "@/components/ui/Accordion";

export function ServiceFAQ({ slug }: { slug: string }) {
  const t = useTranslations(`ServicesDetail.${slug}.faq`);
  const tShared = useTranslations("ServicesDetail._shared");
  const items = t.raw("items") as AccordionItem[];

  return (
    <Section spacing="md" className="border-t border-mute-100">
      <Container>
        <Reveal className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {tShared("faqEyebrow")}
            </p>
            <h2
              className="mt-4 font-display leading-tight tracking-tight text-ink"
              style={{ fontSize: "var(--text-3xl)" }}
            >
              {t("title")}
            </h2>
          </div>

          <Accordion items={items} />
        </Reveal>
      </Container>
    </Section>
  );
}
