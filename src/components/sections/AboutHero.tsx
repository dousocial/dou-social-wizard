import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export async function AboutHero() {
  const t = await getTranslations("About");

  return (
    <Section spacing="hero" className="border-b border-mute-100">
      <Container>
        {/* Editorial 2-column split: giant headline left, lead text bottom-right */}
        <Reveal className="grid items-end gap-10 md:grid-cols-[3fr_2fr] md:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {t("eyebrow")}
            </p>
            <h1
              className="mt-6 font-display leading-[1.02] tracking-tight text-ink"
              style={{ fontSize: "var(--text-6xl)" }}
            >
              {t("heroTitle")}
            </h1>
          </div>

          <div className="md:pb-2">
            <p
              className="leading-relaxed text-mute-500"
              style={{ fontSize: "var(--text-xl)" }}
            >
              {t("heroLead")}
            </p>
            <p className="mt-5 text-xs text-mute-400">
              © {t("legalNote")}
            </p>
          </div>
        </Reveal>

        {/* Bottom editorial rule */}
        <Reveal delay={0.35} variant="fadeOnly" className="mt-14 flex items-center gap-6">
          <div className="h-px flex-1 bg-mute-100" />
          <span className="text-xs uppercase tracking-[0.2em] text-mute-300">
            Denizli · Türkiye
          </span>
        </Reveal>
      </Container>
    </Section>
  );
}
