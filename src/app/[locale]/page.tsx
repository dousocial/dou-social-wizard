import { use } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { MarqueeStrip } from "@/components/sections/MarqueeStrip";
import { ClientLogos } from "@/components/sections/ClientLogos";
import { Services } from "@/components/sections/Services";
import { HowWeWork } from "@/components/sections/HowWeWork";
import { Team } from "@/components/sections/Team";
import { ProjectsTeaser } from "@/components/sections/ProjectsTeaser";
import { TestimonialsServer } from "@/components/sections/TestimonialsServer";
import { FinalCTA } from "@/components/sections/FinalCTA";
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

      <ProjectsTeaser locale={locale === "en" ? "en" : "tr"} />

      <TestimonialsServer />
      <FinalCTA />
    </>
  );
}
