export const CASE_SLUGS = [
  "en20-spor-merkezi",
  "fitlife-kitchen",
  "yapigranit-mermer",
  "bkare-mimarlik-insaat",
  "kayra-designer-store",
] as const;

export type CaseSlug = (typeof CASE_SLUGS)[number];

export function isCaseSlug(value: string): value is CaseSlug {
  return (CASE_SLUGS as readonly string[]).includes(value);
}
