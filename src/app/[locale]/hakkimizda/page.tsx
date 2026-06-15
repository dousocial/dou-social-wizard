import { use } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutHero } from "@/components/sections/AboutHero";
import { BrandStory } from "@/components/sections/BrandStory";
import { HowWeWork } from "@/components/sections/HowWeWork";
import { FinalCTA } from "@/components/sections/FinalCTA";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/hakkimizda">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function AboutPage({
  params,
}: PageProps<"/[locale]/hakkimizda">) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <>
      <AboutHero />
      <BrandStory />
      <HowWeWork />
      <FinalCTA />
    </>
  );
}
