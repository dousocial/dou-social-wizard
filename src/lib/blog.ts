import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTimeCalc from "reading-time";
import { supabase } from "@/lib/supabase";

const BLOG_ROOT = path.join(process.cwd(), "content", "blog");

export interface BlogFrontmatter {
  title: string;
  seoTitle?: string;
  description: string;
  date: string; // ISO date (YYYY-MM-DD)
  author?: string;
  updated?: string; // Actual editorial update, never a generated current date
  tags?: string[];
  cover?: string;
}

export interface BlogPostMeta extends BlogFrontmatter {
  slug: string;
  locale: string;
  readingMinutes: number;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

// ─── MDX helpers ─────────────────────────────────────────────────────────────

async function readMDXDir(localeDir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(localeDir);
    return entries.filter((f) => f.endsWith(".mdx"));
  } catch {
    return [];
  }
}

async function getAllPostsMDX(locale: string): Promise<BlogPostMeta[]> {
  const dir = path.join(BLOG_ROOT, locale);
  const files = await readMDXDir(dir);
  const posts = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = await fs.readFile(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      const fm = data as BlogFrontmatter;
      if (!fm.title?.trim() || !content.trim()) return null;
      const stats = readingTimeCalc(content);
      return {
        ...fm,
        slug,
        locale,
        readingMinutes: Math.max(1, Math.round(stats.minutes)),
      } satisfies BlogPostMeta;
    })
  );
  return posts
    .filter((post): post is BlogPostMeta => post !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

async function getPostBySlugMDX(
  locale: string,
  slug: string
): Promise<BlogPost | null> {
  const file = path.join(BLOG_ROOT, locale, `${slug}.mdx`);
  let raw: string;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch {
    return null;
  }
  const { data, content } = matter(raw);
  const fm = data as BlogFrontmatter;
  if (!fm.title?.trim() || !content.trim()) return null;
  const stats = readingTimeCalc(content);
  return {
    ...fm,
    slug,
    locale,
    content,
    readingMinutes: Math.max(1, Math.round(stats.minutes)),
  };
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────

function dbRowToMeta(
  row: Record<string, unknown>,
  locale: string
): BlogPostMeta {
  const content = String(row.content ?? "");
  return {
    slug: String(row.slug),
    locale,
    title: String(row.title),
    seoTitle: row.seo_title ? String(row.seo_title) : undefined,
    description: String(row.description ?? ""),
    date: String(row.published_at),
    author: String(row.author ?? "DOU Social"),
    updated: row.updated_at ? String(row.updated_at) : undefined,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    cover: row.cover ? String(row.cover) : "/services/reklam-yonetimi.webp",
    readingMinutes: Math.max(1, Math.round(readingTimeCalc(content).minutes)),
  };
}

function dbRowToPost(row: Record<string, unknown>, locale: string): BlogPost {
  return {
    ...dbRowToMeta(row, locale),
    content: String(row.content ?? ""),
  };
}

async function getAllPostsDB(locale: string): Promise<BlogPostMeta[]> {
  // A database outage must not turn a real blog into a noindex empty hub.
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  if (!configured) return [];
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "slug, locale, title, seo_title, description, cover, tags, author, published_at, updated_at, content"
    )
    .eq("locale", locale)
    .eq("is_published", true)
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });
  if (error) throw error;
  if (!data) throw new Error("Published blog content could not be loaded");
  return data
    .filter(
      (row: Record<string, unknown>) =>
        String(row.title ?? "").trim() && String(row.content ?? "").trim()
    )
    .map((row: Record<string, unknown>) => dbRowToMeta(row, locale));
}

async function getPostBySlugDB(
  locale: string,
  slug: string
): Promise<BlogPost | null> {
  try {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("locale", locale)
      .eq("slug", slug)
      .eq("is_published", true)
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .single();
    if (
      !data ||
      !String(data.title ?? "").trim() ||
      !String(data.content ?? "").trim()
    )
      return null;
    return dbRowToPost(data as Record<string, unknown>, locale);
  } catch {
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getAllPosts(locale: string): Promise<BlogPostMeta[]> {
  const [mdxPosts, dbPosts] = await Promise.all([
    getAllPostsMDX(locale),
    getAllPostsDB(locale),
  ]);
  const mdxSlugs = new Set(mdxPosts.map((p) => p.slug));
  const uniqueDbPosts = dbPosts.filter((p) => !mdxSlugs.has(p.slug));
  return [...mdxPosts, ...uniqueDbPosts].sort((a, b) =>
    a.date < b.date ? 1 : -1
  );
}

export async function getPostBySlug(
  locale: string,
  slug: string
): Promise<BlogPost | null> {
  const mdx = await getPostBySlugMDX(locale, slug);
  if (mdx) return mdx;
  return getPostBySlugDB(locale, slug);
}

export async function getAllSlugs(locale: string): Promise<string[]> {
  const files = await readMDXDir(path.join(BLOG_ROOT, locale));
  return files.map((f) => f.replace(/\.mdx$/, ""));
}
