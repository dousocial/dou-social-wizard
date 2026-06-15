export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://dousocial.com";

export const STATIC_PATHS = [
  "/",
  "/hakkimizda",
  "/iletisim",
  "/hizmetler",
  "/projeler",
  "/blog",
  "/teklif-al",
  "/dijital-checkup",
  "/strateji-gorusmesi",
  "/denizli-sosyal-medya-ajansi",
  "/meta-ads-ajansi",
  "/instagram-reklam-yonetimi",
  "/dijital-pazarlama-ajansi",
  "/gizlilik-politikasi",
  "/kullanim-kosullari",
  "/cerez-politikasi",
] as const;

/**
 * Build a fully-qualified URL from a path + locale.
 * `tr` (default) → no prefix. `en` → /en prefix.
 */
export function localizedUrl(path: string, locale: "tr" | "en"): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (locale === "tr") return `${SITE_URL}${cleanPath === "/" ? "" : cleanPath}`;
  return `${SITE_URL}/en${cleanPath === "/" ? "" : cleanPath}`;
}

export function alternatesFor(path: string) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return {
    canonical: localizedUrl(cleanPath, "tr"),
    languages: {
      "tr-TR": localizedUrl(cleanPath, "tr"),
      "en-US": localizedUrl(cleanPath, "en"),
      "x-default": localizedUrl(cleanPath, "tr"),
    },
  };
}
