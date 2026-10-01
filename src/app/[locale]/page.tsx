import { use } from "react";
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

export default function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(locale);

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

        {/* <ClientsGrid /> */}
        <Section spacing="md" className="border-mute-100 border-t">
          <Container>
            <Reveal className="flex flex-col items-center py-24 text-center">
              <span className="border-accent/30 bg-accent/5 text-accent inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
                <span className="bg-accent h-1.5 w-1.5 animate-pulse rounded-full" />
                Çok Yakında
              </span>
              <h2
                className="font-display text-ink mt-8 font-bold tracking-tight"
                style={{ fontSize: "var(--text-5xl)" }}
              >
                Projelerimiz hazırlanıyor.
              </h2>
              <p
                className="text-mute-500 mt-5 max-w-md"
                style={{ fontSize: "var(--text-lg)" }}
              >
                Gerçekleştirdiğimiz çalışmaları en kısa sürede burada paylaşıyor
                olacağız.
              </p>
            </Reveal>
          </Container>
        </Section>

        <TestimonialsServer />
        <FinalCTA />
      </div>
    </>
  );
}
