import type { BlogPostMeta } from "@/lib/blog";
import { buildArticleSchema } from "@/lib/article-schema";

interface Props {
  post: BlogPostMeta;
  url: string;
  siteUrl: string;
}

export function ArticleSchema({ post, url, siteUrl }: Props) {
  const data = buildArticleSchema(post, url, siteUrl);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
