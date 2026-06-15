import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/sections/LegalPage";
import { alternatesFor } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/cerez-politikasi">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Cookies" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: alternatesFor("/cerez-politikasi"),
  };
}

export default async function CookiesPage({
  params,
}: PageProps<"/[locale]/cerez-politikasi">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage namespace="Cookies" />;
}
