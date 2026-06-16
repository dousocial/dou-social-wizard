"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/session";

export type BlogActionState = { error?: string; success?: boolean; id?: string } | null;

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("dou_sid")?.value;
  if (!token) redirect("/yonetim/giris");
  const session = verifyToken(token);
  if (!session) redirect("/yonetim/giris");
  return session;
}

function isNextRedirect(err: unknown): boolean {
  return (
    typeof err === "object" && err !== null && "digest" in err &&
    typeof (err as { digest: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseTags(raw: string): string[] {
  return raw.split(",").map((t) => t.trim()).filter(Boolean);
}

function parseFAQ(formData: FormData): { q: string; a: string }[] {
  const items: { q: string; a: string }[] = [];
  for (let i = 0; i < 50; i++) {
    const q = formData.get(`faq_q_${i}`);
    if (q === null) break;
    const a = String(formData.get(`faq_a_${i}`) ?? "");
    const qStr = String(q).trim();
    const aStr = a.trim();
    if (qStr && aStr) items.push({ q: qStr, a: aStr });
  }
  return items;
}

function buildFAQSection(items: { q: string; a: string }[]): string {
  if (!items.length) return "";
  const lines = items.map((item) => `**${item.q}**\n${item.a}`).join("\n\n");
  return `\n\n## Sıkça Sorulan Sorular\n\n${lines}`;
}

export async function createBlogPost(
  _prev: BlogActionState,
  formData: FormData
): Promise<BlogActionState> {
  try {
    await requireAdmin();

    const title = String(formData.get("title") ?? "").trim();
    const seoTitle = String(formData.get("seo_title") ?? "").trim() || null;
    const description = String(formData.get("description") ?? "").trim();
    const rawSlug = String(formData.get("slug") ?? "").trim();
    const slug = rawSlug || slugify(title);
    const content = String(formData.get("content") ?? "").trim();
    const cover = String(formData.get("cover") ?? "").trim() || null;
    const tags = parseTags(String(formData.get("tags") ?? ""));
    const faqItems = parseFAQ(formData);
    const faqSection = buildFAQSection(faqItems);
    const fullContent = content + faqSection;
    const publishedAt = String(formData.get("published_at") ?? "").trim() || null;
    const isPublished = formData.get("is_published") === "true";
    const locale = String(formData.get("locale") ?? "tr");

    if (!title) return { error: "Başlık gerekli" };
    if (!description) return { error: "Meta açıklama gerekli" };
    if (!slug) return { error: "Slug gerekli" };

    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        locale,
        slug,
        title,
        seo_title: seoTitle,
        description,
        content: fullContent,
        cover,
        tags,
        author: "DOU Social",
        published_at: publishedAt,
        is_published: isPublished,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    revalidatePath("/tr/blog");
    revalidatePath("/en/blog");
    if (isPublished && publishedAt) {
      revalidatePath(`/tr/blog/${slug}`);
    }

    return { success: true, id: data.id };
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function updateBlogPost(
  _prev: BlogActionState,
  formData: FormData
): Promise<BlogActionState> {
  try {
    await requireAdmin();

    const id = String(formData.get("id") ?? "");
    if (!id) return { error: "ID gerekli" };

    const title = String(formData.get("title") ?? "").trim();
    const seoTitle = String(formData.get("seo_title") ?? "").trim() || null;
    const description = String(formData.get("description") ?? "").trim();
    const rawSlug = String(formData.get("slug") ?? "").trim();
    const slug = rawSlug || slugify(title);
    const content = String(formData.get("content") ?? "").trim();
    const cover = String(formData.get("cover") ?? "").trim() || null;
    const tags = parseTags(String(formData.get("tags") ?? ""));
    const faqItems = parseFAQ(formData);
    const faqSection = buildFAQSection(faqItems);
    const fullContent = content + faqSection;
    const publishedAt = String(formData.get("published_at") ?? "").trim() || null;
    const isPublished = formData.get("is_published") === "true";

    if (!title) return { error: "Başlık gerekli" };

    const { error } = await supabase
      .from("blog_posts")
      .update({
        slug,
        title,
        seo_title: seoTitle,
        description,
        content: fullContent,
        cover,
        tags,
        published_at: publishedAt,
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/tr/blog");
    revalidatePath("/en/blog");
    revalidatePath(`/tr/blog/${slug}`);

    return { success: true };
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function deleteBlogPost(
  _prev: BlogActionState,
  formData: FormData
): Promise<BlogActionState> {
  try {
    await requireAdmin();

    const id = String(formData.get("id") ?? "");
    if (!id) return { error: "ID gerekli" };

    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/tr/blog");
    revalidatePath("/en/blog");
    return { success: true };
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
