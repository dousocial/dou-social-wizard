import { BlogForm } from "../_components/BlogForm";

export default function NewBlogPage() {
  return (
    <div>
      <a href="/yonetim/blog" style={{ display: "inline-block", marginBottom: 24, fontSize: 13, color: "var(--c-dim)", textDecoration: "none" }}>
        ← Blog Yazıları
      </a>
      <BlogForm mode="create" />
    </div>
  );
}
