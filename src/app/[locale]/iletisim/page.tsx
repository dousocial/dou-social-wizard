import { use } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactHero } from "@/components/sections/ContactHero";
import { ContactMethods } from "@/components/sections/ContactMethods";
import { ContactFormSection } from "@/components/sections/ContactFormSection";
import { ContactMap } from "@/components/sections/ContactMap";
import { LocalBusinessSchema } from "@/components/seo/LocalBusinessSchema";
import { SITE_URL, alternatesFor } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/iletisim">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: alternatesFor("/iletisim", locale as "tr" | "en"),
  };
}

export default function ContactPage({
  params,
}: PageProps<"/[locale]/iletisim">) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <>
      <LocalBusinessSchema url={SITE_URL} />
      <ContactHero />
      <ContactMethods />
      <ContactFormSection />
      <ContactMap />
    </>
  );
}
