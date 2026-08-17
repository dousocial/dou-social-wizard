import type { BlogPostMeta } from "@/lib/blog";

interface Props {
  post: BlogPostMeta;
  url: string;
  siteUrl: string;
}

export function ArticleSchema({ post, url, siteUrl }: Props) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: post.author ?? "DOU Social",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "DOU Social",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/brand/dou-logo-dark.png`,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
