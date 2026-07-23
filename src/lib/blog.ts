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
      const stats = readingTimeCalc(content);
      return {
        ...fm,
        slug,
        locale,
        readingMinutes: Math.max(1, Math.round(stats.minutes)),
      } satisfies BlogPostMeta;
    })
  );
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

async function getPostBySlugMDX(locale: string, slug: string): Promise<BlogPost | null> {
  const file = path.join(BLOG_ROOT, locale, `${slug}.mdx`);
  let raw: string;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch {
    return null;
  }
  const { data, content } = matter(raw);
  const fm = data as BlogFrontmatter;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbRowToMeta(row: Record<string, any>, locale: string): BlogPostMeta {
  const content = String(row.content ?? "");
  return {
    slug: String(row.slug),
    locale,
    title: String(row.title),
    seoTitle: row.seo_title ? String(row.seo_title) : undefined,
    description: String(row.description ?? ""),
    date: String(row.published_at),
    author: String(row.author ?? "DOU Social"),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    cover: row.cover ? String(row.cover) : undefined,
    readingMinutes: Math.max(1, Math.round(readingTimeCalc(content).minutes)),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbRowToPost(row: Record<string, any>, locale: string): BlogPost {
  return {
    ...dbRowToMeta(row, locale),
    content: String(row.content ?? ""),
  };
}

async function getAllPostsDB(locale: string): Promise<BlogPostMeta[]> {
  try {
    const { data } = await supabase
      .from("blog_posts")
      .select("slug, locale, title, seo_title, description, cover, tags, author, published_at, content")
      .eq("locale", locale)
      .eq("is_published", true)
      .not("published_at", "is", null)
      .is("deleted_at", null)
      .order("published_at", { ascending: false });
    if (!data) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((row: any) => dbRowToMeta(row as Record<string, any>, locale));
  } catch {
    return [];
  }
}

async function getPostBySlugDB(locale: string, slug: string): Promise<BlogPost | null> {
  try {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("locale", locale)
      .eq("slug", slug)
      .eq("is_published", true)
      .is("deleted_at", null)
      .single();
    if (!data) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return dbRowToPost(data as Record<string, any>, locale);
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
  return [...mdxPosts, ...uniqueDbPosts].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(locale: string, slug: string): Promise<BlogPost | null> {
  const mdx = await getPostBySlugMDX(locale, slug);
  if (mdx) return mdx;
  return getPostBySlugDB(locale, slug);
}

export async function getAllSlugs(locale: string): Promise<string[]> {
  const files = await readMDXDir(path.join(BLOG_ROOT, locale));
  return files.map((f) => f.replace(/\.mdx$/, ""));
}
