import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTimeCalc from "reading-time";

const BLOG_ROOT = path.join(process.cwd(), "content", "blog");

export interface BlogFrontmatter {
  title: string;
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

async function readDir(localeDir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(localeDir);
    return entries.filter((f) => f.endsWith(".mdx"));
  } catch {
    return [];
  }
}

export async function getAllPosts(locale: string): Promise<BlogPostMeta[]> {
  const dir = path.join(BLOG_ROOT, locale);
  const files = await readDir(dir);
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

export async function getPostBySlug(
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
  const stats = readingTimeCalc(content);
  return {
    ...fm,
    slug,
    locale,
    content,
    readingMinutes: Math.max(1, Math.round(stats.minutes)),
  };
}

export async function getAllSlugs(locale: string): Promise<string[]> {
  const files = await readDir(path.join(BLOG_ROOT, locale));
  return files.map((f) => f.replace(/\.mdx$/, ""));
}
