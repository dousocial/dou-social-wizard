import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { WordReveal } from "@/components/ui/WordReveal";
import { Reveal } from "@/components/ui/Reveal";
import { Noise } from "@/components/ui/Noise";

/**
 * FinalCTA — full-bleed dark section with cinematic word-reveal heading.
 *
 * Uses `WordReveal` (client component) for the masked per-word animation.
 * The section itself remains a server component.
 */
export async function FinalCTA() {
  const t = await getTranslations("FinalCTA");

  return (
    <Section spacing="lg" className="relative bg-ink text-paper overflow-hidden">
      {/* Organic noise texture */}
      <Noise opacity={0.05} />

      {/* Maroon glow from top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -5%, rgb(128 0 0 / 0.18) 0%, transparent 65%)",
        }}
      />

      <Container className="relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Cinematic word-reveal heading */}
          <WordReveal
            text={t("title")}
            as="h2"
            className="max-w-4xl font-display leading-[1.05] tracking-tight"
            style={{ fontSize: "var(--text-6xl)" } as React.CSSProperties}
            stagger={0.09}
          />

          {/* Subtitle — standard reveal */}
          <Reveal variant="fadeUp" delay={0.3} className="mt-6 max-w-xl">
            <p
              className="text-mute-300 leading-relaxed"
              style={{ fontSize: "var(--text-lg)" }}
            >
              {t("subtitle")}
            </p>
          </Reveal>

          {/* CTA buttons */}
          <Reveal variant="fadeUp" delay={0.45} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              href="/iletisim"
              className="bg-paper text-ink hover:bg-mute-100"
              size="lg"
            >
              {t("ctaPrimary")}
            </ButtonLink>
            <ButtonLink
              href="https://wa.me/905300845468"
              variant="secondary"
              size="lg"
              className="border-mute-700 text-paper hover:bg-paper hover:text-ink"
            >
              {t("ctaSecondary")}
            </ButtonLink>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
