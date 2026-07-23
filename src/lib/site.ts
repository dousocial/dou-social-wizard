export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dousocial.com";

export const STATIC_PATHS = [
  "/",
  "/hakkimizda",
  "/iletisim",
  "/hizmetler",
  "/projeler",
  "/blog",
  "/sss",
  "/teklif-al",
  "/dijital-checkup",
  "/audit",
  "/strateji-gorusmesi",
  "/influencer",
  "/denizli-sosyal-medya-ajansi",
  "/meta-ads-ajansi",
  "/instagram-reklam-yonetimi",
  "/dijital-pazarlama-ajansi",
  "/gizlilik-politikasi",
  "/kullanim-kosullari",
  "/cerez-politikasi",
] as const;

export const NOINDEX_PATHS = ["/strateji-gorusmesi"] as const;

/**
 * Build a fully-qualified URL from a path + locale.
 * `tr` (default) → no prefix. `en` → /en prefix.
 */
export function localizedUrl(path: string, locale: "tr" | "en"): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (locale === "tr") return `${SITE_URL}${cleanPath === "/" ? "" : cleanPath}`;
  return `${SITE_URL}/en${cleanPath === "/" ? "" : cleanPath}`;
}

export function alternatesFor(path: string, locale: "tr" | "en") {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return {
    canonical: localizedUrl(cleanPath, locale),
    languages: {
      "tr-TR": localizedUrl(cleanPath, "tr"),
      "en-US": localizedUrl(cleanPath, "en"),
      "x-default": localizedUrl(cleanPath, "tr"),
    },
  };
}
