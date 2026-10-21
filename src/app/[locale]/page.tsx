import { REAL_PROJECTS } from "@/lib/real-projects";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { MarqueeStrip } from "@/components/sections/MarqueeStrip";
import { ClientLogos } from "@/components/sections/ClientLogos";
import { Services } from "@/components/sections/Services";
import { HowWeWork } from "@/components/sections/HowWeWork";
// import { CaseStudies } from "@/components/sections/CaseStudies";
import { Team } from "@/components/sections/Team";
// import { ClientsGrid } from "@/components/sections/ClientsGrid";
import { TestimonialsServer } from "@/components/sections/TestimonialsServer";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { HomePageSchema } from "@/components/seo/HomePageSchema";
import { localizedUrl } from "@/lib/site";

const META = {
  tr: {
    title: "Denizli Reklam ve Sosyal Medya Ajansı",
    description:
      "Denizli’de Google Ads ve Meta reklam yönetimi, sosyal medya, web tasarım ve etkinlik çekimi. DOU Social’ın hizmetlerini inceleyin, ücretsiz analiz isteyin.",
    locale: "tr_TR",
  },
  en: {
    title: "Digital Marketing and Meta Ads Agency in Turkey",
    description:
      "DOU Social is a Denizli-based digital marketing agency for Meta Ads, social media management, content production, web design and local SEO.",
    locale: "en_US",
  },
} as const;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const currentLocale = locale === "en" ? "en" : "tr";
  const meta = META[currentLocale];
  const url = localizedUrl("/", currentLocale);

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: url,
      languages: {
        "tr-TR": localizedUrl("/", "tr"),
        "en-US": localizedUrl("/", "en"),
        "x-default": localizedUrl("/", "tr"),
      },
    },
    keywords:
      currentLocale === "tr"
        ? [
            "Denizli dijital pazarlama ajansı",
            "Denizli sosyal medya ajansı",
            "Meta Ads ajansı",
            "Instagram reklam yönetimi",
            "Google Haritalar SEO",
            "yerel SEO Denizli",
            "web tasarım Denizli",
          ]
        : [
            "digital marketing agency Turkey",
            "Meta Ads agency",
            "social media management",
            "local SEO Turkey",
            "web design agency",
          ],
    openGraph: {
      type: "website",
      url,
      title: meta.title,
      description: meta.description,
      locale: meta.locale,
      siteName: "DOU Social",
      images: [
        {
          url: "/brand/dou-logo-dark.png",
          width: 1000,
          height: 1000,
          alt: "DOU Social",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: ["/brand/dou-logo-dark.png"],
    },
  };
}

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ClientPortfolio");

  return (
    <>
      <HomePageSchema locale={locale === "en" ? "en" : "tr"} />
      <Hero />
      <div className="home-sections">
        <MarqueeStrip />
        <ClientLogos />
        <Services />
        <HowWeWork />
        <Team />

        <Section spacing="md" className="border-mute-100 border-t">
          <Container>
            <Reveal className="max-w-3xl py-8">
              <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase">
                {t("eyebrow")}
              </p>
              <h2 className="font-display text-ink mt-5 text-3xl leading-tight tracking-tight md:text-5xl">
                {t("title")}
              </h2>
              <p className="text-mute-600 mt-5 max-w-2xl text-lg leading-relaxed">
                {t("lead")}
              </p>
              <ul className="mt-7 grid gap-3">
                {REAL_PROJECTS.map((project) => (
                  <li key={project.slug}>
                    <Link
                      href={`/projeler/${project.slug}`}
                      className="border-mute-200 text-ink hover:text-accent block rounded-xl border p-4 text-base"
                    >
                      {project.title[locale === "en" ? "en" : "tr"]} →
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/projeler"
                className="bg-accent focus-visible:outline-accent mt-7 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                {t("cta")} →
              </Link>
            </Reveal>
          </Container>
        </Section>

        <TestimonialsServer />
        <FinalCTA />
      </div>
    </>
  );
}
