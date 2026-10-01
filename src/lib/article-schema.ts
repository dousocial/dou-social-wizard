import type { BlogPostMeta } from "@/lib/blog";

export function buildArticleSchema(
  post: BlogPostMeta,
  url: string,
  siteUrl: string
) {
  const organizationId = `${siteUrl}#organization`;
  const organizationAuthor =
    !post.author || post.author.trim() === "DOU Social";
  const updated =
    post.updated &&
    !Number.isNaN(Date.parse(post.updated)) &&
    Date.parse(post.updated) >= Date.parse(post.date)
      ? post.updated
      : post.date;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    image: post.cover ? new URL(post.cover, siteUrl).href : undefined,
    description: post.description,
    datePublished: post.date,
    dateModified: updated,
    inLanguage: post.locale === "en" ? "en-US" : "tr-TR",
    author: organizationAuthor
      ? {
          "@type": "Organization",
          "@id": organizationId,
          name: "DOU Social",
          url: new URL(
            post.locale === "en" ? "/en/hakkimizda" : "/hakkimizda",
            siteUrl
          ).href,
        }
      : { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      "@id": organizationId,
      name: "DOU Social",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/brand/dou-logo-dark.png`,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: { "@id": `${siteUrl}#website` },
  };
}
