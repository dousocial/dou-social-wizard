export const CASE_SLUGS = [
  "e-ticaret-3x-donusum",
  "b2b-yazilim-lead-jenerasyonu",
  "restoran-yerel-buyume",
  "online-egitim-lansmani",
  "saglik-klinigi-marka-yenileme",
] as const;

export type CaseSlug = (typeof CASE_SLUGS)[number];

export function isCaseSlug(value: string): value is CaseSlug {
  return (CASE_SLUGS as readonly string[]).includes(value);
}
