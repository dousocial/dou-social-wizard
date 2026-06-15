import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const MAP_EMBED = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3152.4115788437934!2d29.073913376305217!3d37.80382751048527!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14c73f3cb1984391%3A0x33e4b6d1562e4f1c!2sDou%20Social!5e0!3m2!1str!2str!4v1781096228369!5m2!1str!2str";

const DIRECTIONS_URL = "https://maps.app.goo.gl/TJxDnehJCVooSquR7";

export function ContactMap() {
  const t = useTranslations("Contact.visit");

  return (
    <Section spacing="md" className="border-t border-mute-100">
      <Container>
        <Reveal className="grid gap-12 md:grid-cols-[1fr_2fr] md:items-start">

          {/* Left — info */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {t("eyebrow")}
            </p>
            <h2
              className="mt-4 font-display font-bold leading-tight tracking-tight text-ink"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              {t("title")}
            </h2>

            <address className="mt-6 not-italic text-mute-500 leading-relaxed">
              <p className="font-medium text-ink">Zafer Mah. Zafer Cd. No: 60/1</p>
              <p>Merkezefendi / Denizli</p>
            </address>

            <div className="mt-5 border-t border-mute-100 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mute-400">
                {t("hoursLabel")}
              </p>
              <p className="mt-1.5 text-mute-500">{t("hours")}</p>
            </div>

            {/* Yol tarifi al CTA */}
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex items-center gap-3 rounded-full border border-mute-200 px-5 py-2.5 text-sm font-semibold text-ink transition-all duration-200 hover:border-accent hover:bg-accent hover:text-paper"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="none" aria-hidden>
                <path d="M8 1.5l4.5 7.5H3.5L8 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M8 9.5V14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Yol tarifi al
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          {/* Right — map */}
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-mute-200 bg-mute-100">
            <iframe
              src={MAP_EMBED}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full transition-all duration-300 dark:[filter:invert(0.9)_hue-rotate(185deg)_saturate(0.7)_brightness(0.9)]"
              title="DOU Social Office"
            />
          </div>

        </Reveal>
      </Container>
    </Section>
  );
}
