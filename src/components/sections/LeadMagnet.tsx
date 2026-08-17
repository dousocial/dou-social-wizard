import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const POINTS = ["instagram", "ads", "linkedin"] as const;

export function LeadMagnet() {
  const t = useTranslations("LeadMagnet");

  return (
    <Section spacing="md" className="bg-mute-50">
      <Container>
        <Reveal className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {t("eyebrow")}
            </p>
            <h2 className="mt-4 font-display text-4xl leading-[1.1] tracking-tight text-ink md:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-6 text-lg text-mute-600">{t("subtitle")}</p>
            <ButtonLink
              href="/dijital-checkup"
              variant="primary"
              className="mt-8"
            >
              {t("cta")}
            </ButtonLink>
            <p className="mt-4 text-xs text-mute-500">{t("note")}</p>
          </div>

          <ul className="space-y-4">
            {POINTS.map((p, i) => (
              <li
                key={p}
                className="flex gap-6 border-b border-mute-200 pb-4 last:border-0"
              >
                <span className="font-display text-2xl text-mute-400">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="font-display text-xl text-ink">
                    {t(`${p}.title`)}
                  </h3>
                  <p className="mt-1 text-sm text-mute-600">
                    {t(`${p}.description`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}
