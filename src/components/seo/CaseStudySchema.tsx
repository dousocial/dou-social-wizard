import { SITE_URL } from "@/lib/site";

interface Props {
  slug: string;
  title: string;
  summary: string;
  locale: "tr" | "en";
}

export function CaseStudySchema({ slug, title, summary, locale }: Props) {
  const prefix = locale === "tr" ? "" : "/en";
  const url = `${SITE_URL}${prefix}/projeler/${slug}`;

  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: title,
    description: summary,
    url,
    author: {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: "DOU Social",
    },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: "DOU Social",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/brand/dou-logo-dark.png`,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: locale === "tr" ? "tr-TR" : "en-US",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
