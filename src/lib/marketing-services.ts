import services from "@/content/marketing-services.json";
export const MARKETING_SERVICES = services;
export function getMarketingService(slug: string, locale: string) {
  const service = services.find((item) => item.slug === slug);
  if (!service) return null;
  return {
    slug: service.slug,
    cover: `/services/${service.slug}.png`,
    ...(locale === "en" ? service.en : service.tr),
  };
}
