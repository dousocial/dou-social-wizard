import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal";

const PILLARS = [
  { key: "mission" },
  { key: "vision" },
] as const;

export function BrandStory() {
  const t = useTranslations("About.story");

  return (
    <Section spacing="md" className="border-t border-mute-100 bg-mute-50">
      <Container>
        <Reveal className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {t("eyebrow")}
            </p>
            <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl">
              {t("title")}
            </h2>
          </div>
          <div className="space-y-6 text-lg text-mute-700">
            <p>{t("p1")}</p>
            <p>{t("p2")}</p>
          </div>
        </Reveal>

        <Reveal stagger className="mt-20 grid gap-px bg-mute-200 md:grid-cols-2">
          {PILLARS.map((p) => (
            <RevealItem key={p.key}>
              <div className="flex h-full flex-col bg-paper p-10">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  {t(`${p.key}.label`)}
                </span>
                <p className="mt-5 text-xl leading-relaxed text-ink">
                  {t(`${p.key}.description`)}
                </p>
              </div>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
