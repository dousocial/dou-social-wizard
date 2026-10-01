import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { MarketingServicePage } from "@/components/seo/MarketingServicePage";
import { getMarketingService } from "@/lib/marketing-services";
import { alternatesFor } from "@/lib/site";

const SLUG = "facebook-reklam-yonetimi";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const service = getMarketingService(SLUG, locale)!;
  return { title: service.title, description: service.lead, alternates: alternatesFor(`/${SLUG}`, locale as "tr" | "en") };
}
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MarketingServicePage slug={SLUG} locale={locale} />;
}
