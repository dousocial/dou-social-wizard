import { BlogForm } from "../_components/BlogForm";

export default function NewBlogPage() {
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
          Yeni Blog Yazısı
        </h1>
      </div>
      <BlogForm mode="create" />
    </div>
  );
}
