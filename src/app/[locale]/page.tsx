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
    title: "Denizli Dijital Pazarlama ve Meta Ads Ajansı",
    description:
      "DOU Social; Denizli merkezli Meta Ads, sosyal medya yönetimi, içerik üretimi, web tasarım ve yerel SEO ajansı. Reklam bütçenizi daha verimli, markanızı daha görünür hale getirir.",
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
      <MarqueeStrip />
      <ClientLogos />
      <Services />
      <HowWeWork />
      <Team />

      {/* <ClientsGrid /> */}
      <Section spacing="md" className="border-t border-mute-100">
        <Container>
          <Reveal className="flex flex-col items-center py-24 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              Çok Yakında
            </span>
            <h2
              className="mt-8 font-display font-bold tracking-tight text-ink"
              style={{ fontSize: "var(--text-5xl)" }}
            >
              Projelerimiz hazırlanıyor.
            </h2>
            <p className="mt-5 max-w-md text-mute-500" style={{ fontSize: "var(--text-lg)" }}>
              Gerçekleştirdiğimiz çalışmaları en kısa sürede burada paylaşıyor olacağız.
            </p>
          </Reveal>
        </Container>
      </Section>

      <TestimonialsServer />
      <FinalCTA />
    </>
  );
}
