export const SERVICE_SLUGS = [
  "sosyal-medya-marka",
  "meta-reklamlari",
  "icerik-video",
  "performans-pazarlama",
  "google-seo",
  "web-yazilim",
  "kurumsal-kimlik",
  "influencer-marketing",
  "eticaret-buyume",
  "crm-dijital",
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export function isServiceSlug(value: string): value is ServiceSlug {
  return (SERVICE_SLUGS as readonly string[]).includes(value);
}
