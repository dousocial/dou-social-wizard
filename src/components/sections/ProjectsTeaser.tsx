import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Marquee } from "@/components/ui/Marquee";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { CASE_SLUGS } from "@/lib/cases";

const COPY = {
  tr: {
    eyebrow: "Projeler",
    title: "Birlikte çalıştığımız markalar.",
    cta: "Tüm projeleri incele",
  },
  en: {
    eyebrow: "Projects",
    title: "Brands we work with.",
    cta: "View all projects",
  },
} as const;

// Ana sayfadaki kayan proje başlıkları — /projeler'deki gerçek vaka
// çalışmalarından besleniyor, CASE_SLUGS güncellendikçe otomatik senkron kalır.
export async function ProjectsTeaser({ locale }: { locale: "tr" | "en" }) {
  const t = await getTranslations({ locale, namespace: "Cases.items" });
  const copy = COPY[locale];

  const marqueeItems = CASE_SLUGS.map((slug) => (
    <Link
      key={slug}
      href={`/projeler/${slug}` as never}
      className="group flex shrink-0 items-center gap-5 px-8"
    >
      <span className="font-display text-2xl tracking-tight text-paper transition-colors duration-200 group-hover:text-accent md:text-4xl">
        {t(`${slug}.title`)}
      </span>
      <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">
        {t(`${slug}.industry`)}
      </span>
      <span aria-hidden className="text-2xl text-paper/20 md:text-4xl">
        •
      </span>
    </Link>
  ));

  return (
    <Section spacing="md" className="overflow-hidden border-t border-mute-100 bg-ink">
      <Container>
        <Reveal className="flex flex-col items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {copy.eyebrow}
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-paper md:text-5xl">
            {copy.title}
          </h2>
        </Reveal>
      </Container>

      <div className="mt-14">
        <Marquee items={marqueeItems} direction="left" speed={38} gapClass="gap-0" />
      </div>

      <Container>
        <Reveal className="mt-14 flex justify-center">
          <Link
            href="/projeler"
            className="inline-flex items-center gap-2 rounded-full border border-paper/20 px-6 py-3 text-sm font-semibold text-paper transition hover:border-paper/50 hover:bg-paper/5"
          >
            {copy.cta}
            <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none" aria-hidden>
              <path d="M1 7h12m0 0L8 2m5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </Reveal>
      </Container>
    </Section>
  );
}
