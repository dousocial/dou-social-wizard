import { use } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SEOLandingTemplate } from "@/components/seo/SEOLandingTemplate";
import { LocalBusinessSchema } from "@/components/seo/LocalBusinessSchema";

const SLUG = "denizli-sosyal-medya-ajansi";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://dousocial.com";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/denizli-sosyal-medya-ajansi">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: `SeoLanding.${SLUG}`,
  });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function Page({
  params,
}: PageProps<"/[locale]/denizli-sosyal-medya-ajansi">) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <>
      <LocalBusinessSchema url={SITE_URL} />
      <SEOLandingTemplate slug={SLUG} />
    </>
  );
}
