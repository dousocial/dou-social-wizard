import type { MetadataRoute } from "next";
import { NOINDEX_PATHS, SITE_URL, STATIC_PATHS } from "@/lib/site";
import { SERVICE_SLUGS } from "@/lib/services";
import { getAllPosts } from "@/lib/blog";

// Query published content at request time so CMS changes update indexing.
export const dynamic = "force-dynamic";

const LOCALES = ["tr", "en"] as const;

function url(path: string, locale: "tr" | "en"): string {
  const clean = path === "/" ? "" : path;
  return locale === "tr" ? `${SITE_URL}${clean}` : `${SITE_URL}/en${clean}`;
}

function alternateLanguages(path: string) {
  const clean = path === "/" ? "" : path;
  return {
    "tr-TR": `${SITE_URL}${clean}`,
    "en-US": `${SITE_URL}/en${clean}`,
    "x-default": `${SITE_URL}${clean}`,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const postsByLocale = await Promise.all(
    LOCALES.map(async (locale) => ({
      locale,
      posts: await getAllPosts(locale),
    }))
  );
  const blogLocales = postsByLocale
    .filter(({ posts }) => posts.length > 0)
    .map(({ locale }) => locale);
  const blogLanguages = Object.fromEntries(
    blogLocales.map((locale) => [
      locale === "tr" ? "tr-TR" : "en-US",
      url("/blog", locale),
    ])
  );
  const indexedStaticPaths = STATIC_PATHS.filter(
    (path) => !(NOINDEX_PATHS as readonly string[]).includes(path)
  );

  // Static paths
  for (const path of indexedStaticPaths) {
    for (const locale of LOCALES) {
      if (path === "/blog" && !blogLocales.includes(locale)) continue;
      entries.push({
        url: url(path, locale),
        changeFrequency: path === "/" ? "weekly" : "monthly",
        priority: path === "/" ? 1.0 : 0.7,
        alternates: {
          languages:
            path === "/blog" ? blogLanguages : alternateLanguages(path),
        },
      });
    }
  }

  // Service detail pages
  for (const slug of SERVICE_SLUGS) {
    const path = `/hizmetler/${slug}`;
    for (const locale of LOCALES) {
      entries.push({
        url: url(path, locale),
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: { languages: alternateLanguages(path) },
      });
    }
  }

  // Blog posts (per locale, since slugs differ between locales)
  for (const { locale, posts } of postsByLocale) {
    for (const post of posts) {
      entries.push({
        url: url(`/blog/${post.slug}`, locale),
        lastModified: post.date,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
