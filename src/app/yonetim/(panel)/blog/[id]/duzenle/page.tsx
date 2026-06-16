import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { BlogForm } from "../../_components/BlogForm";

async function getPost(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

function extractFAQ(content: string): { q: string; a: string }[] {
  const sectionMatch = content.match(/##\s+S[ıi]kça Sorulan Sorular\s*([\s\S]*?)(?:\n##|$)/);
  if (!sectionMatch) return [];
  const section = sectionMatch[1];
  const items: { q: string; a: string }[] = [];
  const pattern = /\*\*([^*]+)\*\*\s*\n([\s\S]*?)(?=\n\*\*|$)/g;
  let match;
  while ((match = pattern.exec(section)) !== null) {
    const q = match[1].trim();
    const a = match[2].trim().replace(/\n+/g, " ");
    if (q && a) items.push({ q, a });
  }
  return items;
}

function stripFAQ(content: string): string {
  return content.replace(/\n*##\s+S[ıi]kça Sorulan Sorular[\s\S]*$/, "").trim();
}

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  const rawContent = post.content ?? "";
  const faqItems = extractFAQ(rawContent);
  const contentWithoutFAQ = stripFAQ(rawContent);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <a
          href="/yonetim/blog"
          style={{ fontSize: 13, color: "var(--c-dim)", textDecoration: "none" }}
        >
          ← Blog Yazıları
        </a>
        <h1 style={{ margin: "8px 0 0", fontSize: 17, fontWeight: 600, color: "var(--c-text)" }}>
          Yazıyı Düzenle
        </h1>
      </div>

      <BlogForm
        mode="edit"
        initialData={{
          id: post.id,
          title: post.title ?? "",
          seoTitle: post.seo_title ?? "",
          description: post.description ?? "",
          slug: post.slug ?? "",
          content: contentWithoutFAQ,
          cover: post.cover ?? "",
          tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
          faqItems: faqItems.length > 0 ? faqItems : [{ q: "", a: "" }],
          publishedAt: post.published_at ?? new Date().toISOString().slice(0, 10),
          isPublished: post.is_published ?? false,
          locale: post.locale ?? "tr",
        }}
      />
    </div>
  );
}
