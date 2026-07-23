import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal";

const STATS = ["projects", "brands", "satisfaction"] as const;

export function Values() {
  const t = useTranslations("About.values");

  return (
    <Section spacing="md">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 font-display text-4xl leading-[1.1] tracking-tight text-ink md:text-5xl">
            {t("title")}
          </h2>
        </Reveal>

        <Reveal stagger className="mt-16 grid gap-12 md:grid-cols-3">
          {STATS.map((s) => (
            <RevealItem key={s}>
              <div className="flex flex-col border-t-2 border-accent pt-8">
                <span
                  className="font-display font-bold leading-none tracking-tight text-ink"
                  style={{ fontSize: "var(--text-6xl)" }}
                >
                  {t(`${s}.value`)}
                </span>
                <span className="mt-4 text-sm uppercase tracking-[0.15em] text-mute-500">
                  {t(`${s}.label`)}
                </span>
              </div>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
