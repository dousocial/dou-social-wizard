export const SEO_LANDING_SLUGS = [
  "denizli-sosyal-medya-ajansi",
  "meta-ads-ajansi",
  "instagram-reklam-yonetimi",
  "dijital-pazarlama-ajansi",
] as const;

export type SeoLandingSlug = (typeof SEO_LANDING_SLUGS)[number];
