"use client";

import { useActionState, useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  type BlogActionState,
} from "@/lib/actions/blog";

interface FAQ {
  q: string;
  a: string;
}

interface BlogFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    title: string;
    seoTitle: string;
    description: string;
    slug: string;
    content: string;
    cover: string;
    tags: string;
    faqItems: FAQ[];
    publishedAt: string;
    isPublished: boolean;
    locale: string;
  };
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

export function BlogForm({ mode, initialData }: BlogFormProps) {
  const router = useRouter();
  const action = mode === "create" ? createBlogPost : updateBlogPost;
  const [state, formAction, pending] = useActionState<BlogActionState, FormData>(action, null);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle ?? "");
  const [seoTitleEdited, setSeoTitleEdited] = useState(mode === "edit" && !!initialData?.seoTitle);
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [cover, setCover] = useState(initialData?.cover ?? "");
  const [tags, setTags] = useState(initialData?.tags ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [faqItems, setFaqItems] = useState<FAQ[]>(
    initialData?.faqItems?.length ? initialData.faqItems : [{ q: "", a: "" }]
  );
  const [publishedAt, setPublishedAt] = useState(
    initialData?.publishedAt ?? new Date().toISOString().slice(0, 10)
  );
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false);
  const [locale, setLocale] = useState(initialData?.locale ?? "tr");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePending, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugEdited && title) setSlug(slugify(title));
  }, [title, slugEdited]);

  // Auto-fill SEO title from title if user hasn't edited it
  useEffect(() => {
    if (!seoTitleEdited && title) setSeoTitle(title);
  }, [title, seoTitleEdited]);

  // Redirect on success
  useEffect(() => {
    if (state?.success) router.push("/yonetim/blog");
  }, [state?.success, router]);

  function handleDelete() {
    if (!initialData) return;
    startDeleteTransition(async () => {
      const fd = new FormData();
      fd.set("id", initialData.id);
      const result = await deleteBlogPost(null, fd);
      if (result?.error) setDeleteError(result.error);
      else router.push("/yonetim/blog");
    });
  }

  function addFAQ() {
    setFaqItems((prev) => [...prev, { q: "", a: "" }]);
  }

  function removeFAQ(i: number) {
    setFaqItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateFAQ(i: number, field: "q" | "a", val: string) {
    setFaqItems((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: val } : item))
    );
  }

  const seoLen = seoTitle.length;
  const descLen = description.length;

  return (
    <>
      <form action={formAction}>
        {mode === "edit" && initialData && (
          <input type="hidden" name="id" value={initialData.id} />
        )}
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="is_published" value={String(isPublished)} />

        {/* Hidden FAQ inputs */}
        {faqItems.map((item, i) => (
          <span key={i}>
            <input type="hidden" name={`faq_q_${i}`} value={item.q} />
            <input type="hidden" name={`faq_a_${i}`} value={item.a} />
          </span>
        ))}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>

          {/* ── Left column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Title */}
            <div>
              <label style={labelStyle}>Başlık</label>
              <input
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Blog yazısının başlığı..."
                required
                style={inputStyle}
              />
            </div>

            {/* Slug */}
            <div>
              <label style={labelStyle}>URL Slug</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--c-dim)", whiteSpace: "nowrap" }}>/blog/</span>
                <input
                  name="slug"
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
                  placeholder="url-slug"
                  style={{ ...inputStyle, flex: 1 }}
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <label style={labelStyle}>İçerik (Markdown)</label>
              <textarea
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={"Blog içeriğini buraya yazın...\n\nMarkdown kullanabilirsiniz:\n## Başlık\n**kalın** *italik*\n- liste"}
                rows={26}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  fontFamily: "monospace",
                  fontSize: 13,
                  lineHeight: 1.7,
                }}
              />
            </div>

            {/* FAQ builder */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Sıkça Sorulan Sorular</label>
                <button type="button" onClick={addFAQ} style={smallBtnStyle}>+ Soru Ekle</button>
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--c-dim)" }}>
                SSS bölümü içeriğin sonuna otomatik eklenir ve Google&apos;da öne çıkan snippet olarak görünebilir.
              </p>
              {faqItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--c-surface2)",
                    border: "1px solid var(--c-border)",
                    borderRadius: 8,
                    padding: 14,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--c-dim)", fontWeight: 600 }}>SSS #{i + 1}</span>
                    {faqItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFAQ(i)}
                        style={{ ...smallBtnStyle, color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}
                      >
                        Kaldır
                      </button>
                    )}
                  </div>
                  <input
                    value={item.q}
                    onChange={(e) => updateFAQ(i, "q", e.target.value)}
                    placeholder="Soru..."
                    style={{ ...inputStyle, marginBottom: 8 }}
                  />
                  <textarea
                    value={item.a}
                    onChange={(e) => updateFAQ(i, "a", e.target.value)}
                    placeholder="Cevap..."
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column (sidebar) ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 80 }}>

            {/* Publish panel */}
            <div style={panelStyle}>
              <p style={panelTitleStyle}>Yayın</p>

              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <button
                  type="button"
                  onClick={() => setIsPublished(false)}
                  style={{
                    ...toggleBtnStyle,
                    background: !isPublished ? "rgba(251,191,36,0.12)" : "transparent",
                    color: !isPublished ? "#fde68a" : "var(--c-text3)",
                    borderColor: !isPublished ? "rgba(251,191,36,0.35)" : "var(--c-border)",
                  }}
                >
                  Taslak
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublished(true)}
                  style={{
                    ...toggleBtnStyle,
                    background: isPublished ? "rgba(34,197,94,0.12)" : "transparent",
                    color: isPublished ? "#86efac" : "var(--c-text3)",
                    borderColor: isPublished ? "rgba(34,197,94,0.35)" : "var(--c-border)",
                  }}
                >
                  Yayınla
                </button>
              </div>

              <label style={labelStyle}>Yayın Tarihi</label>
              <input
                name="published_at"
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                style={inputStyle}
              />

              <label style={{ ...labelStyle, marginTop: 12 }}>Dil</label>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                style={inputStyle}
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>

              <button
                type="submit"
                disabled={pending}
                style={{
                  marginTop: 14,
                  width: "100%",
                  padding: "10px 18px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  border: "none",
                  cursor: pending ? "not-allowed" : "pointer",
                  background: "#9b1c1c",
                  color: "#fff",
                  opacity: pending ? 0.7 : 1,
                }}
              >
                {pending ? "Kaydediliyor..." : mode === "create" ? "Oluştur" : "Güncelle"}
              </button>

              {state?.error && (
                <p style={{ margin: "10px 0 0", fontSize: 13, color: "#f87171" }}>
                  Hata: {state.error}
                </p>
              )}
            </div>

            {/* SEO panel */}
            <div style={panelStyle}>
              <p style={panelTitleStyle}>SEO</p>

              <label style={labelStyle}>
                SEO Başlığı
                <span style={{ float: "right", color: seoLen > 60 ? "#f87171" : seoLen > 50 ? "#fde68a" : "var(--c-dim)" }}>
                  {seoLen}/60
                </span>
              </label>
              <input
                name="seo_title"
                value={seoTitle}
                onChange={(e) => { setSeoTitle(e.target.value); setSeoTitleEdited(true); }}
                placeholder="Google'da <title> olarak görünecek..."
                style={{
                  ...inputStyle,
                  borderColor: seoLen > 60 ? "rgba(248,113,113,0.5)" : undefined,
                }}
              />

              <label style={{ ...labelStyle, marginTop: 12 }}>
                Meta Açıklama
                <span style={{ float: "right", color: descLen > 160 ? "#f87171" : descLen > 140 ? "#fde68a" : "var(--c-dim)" }}>
                  {descLen}/160
                </span>
              </label>
              <textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Google arama sonucunda gösterilecek açıklama..."
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "none",
                  borderColor: descLen > 160 ? "rgba(248,113,113,0.5)" : undefined,
                }}
              />

              {/* SERP preview */}
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  background: "var(--c-surface2)",
                  borderRadius: 8,
                  border: "1px solid var(--c-border)",
                }}
              >
                <p style={{ margin: "0 0 6px", fontSize: 10, color: "var(--c-dim)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Google Önizleme
                </p>
                <p style={{ margin: "0 0 1px", fontSize: 12, color: "#6ee7b7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  dousocial.com › blog › {slug || "slug"}
                </p>
                <p style={{ margin: "0 0 2px", fontSize: 14, color: "#60a5fa", fontWeight: 500, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical" as const }}>
                  {seoTitle || title || "SEO Başlığı..."}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--c-dim)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical" as const }}>
                  {description || "Meta açıklama buraya gelecek..."}
                </p>
              </div>
            </div>

            {/* Cover + Tags */}
            <div style={panelStyle}>
              <p style={panelTitleStyle}>Görsel & Etiketler</p>

              <label style={labelStyle}>Kapak Görseli URL</label>
              <input
                name="cover"
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                placeholder="/blog/yazi-slug/kapak.jpg"
                style={inputStyle}
              />
              {cover && (
                <div style={{ marginTop: 8, borderRadius: 6, overflow: "hidden", aspectRatio: "16/9", background: "var(--c-surface2)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cover}
                    alt="kapak önizleme"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}

              <label style={{ ...labelStyle, marginTop: 12 }}>Etiketler</label>
              <input
                name="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Dijital Pazarlama, SEO, Trendler"
                style={inputStyle}
              />
              <p style={{ margin: "5px 0 0", fontSize: 12, color: "var(--c-dim)" }}>Virgülle ayırın</p>
            </div>
          </div>
        </div>
      </form>

      {/* Delete section — outside main form to avoid nested forms */}
      {mode === "edit" && initialData && (
        <div
          style={{
            marginTop: 24,
            maxWidth: 320,
            marginLeft: "auto",
            background: "var(--c-surface)",
            border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: 10,
            padding: 16,
          }}
        >
          <p style={{ ...panelTitleStyle, color: "#f87171" }}>Tehlikeli Bölge</p>
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              style={{ ...smallBtnStyle, width: "100%", padding: "8px 14px", color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}
            >
              Yazıyı Sil
            </button>
          ) : (
            <div>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--c-text3)" }}>
                Bu işlem geri alınamaz. Emin misiniz?
              </p>
              {deleteError && (
                <p style={{ margin: "0 0 10px", fontSize: 13, color: "#f87171" }}>Hata: {deleteError}</p>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{ ...smallBtnStyle, flex: 1, padding: "8px 14px" }}
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deletePending}
                  style={{
                    ...smallBtnStyle,
                    flex: 1,
                    padding: "8px 14px",
                    color: "#f87171",
                    borderColor: "rgba(248,113,113,0.3)",
                    background: "rgba(248,113,113,0.1)",
                    opacity: deletePending ? 0.7 : 1,
                  }}
                >
                  {deletePending ? "Siliniyor..." : "Evet, Sil"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--c-text3)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 7,
  border: "1px solid var(--c-border)",
  background: "var(--c-surface2)",
  color: "var(--c-text)",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const smallBtnStyle: React.CSSProperties = {
  padding: "5px 12px",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  border: "1px solid var(--c-border)",
  background: "transparent",
  color: "var(--c-text3)",
  cursor: "pointer",
};

const panelStyle: React.CSSProperties = {
  background: "var(--c-surface)",
  border: "1px solid var(--c-border)",
  borderRadius: 10,
  padding: 16,
};

const panelTitleStyle: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--c-text2)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
};

const toggleBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: "8px 12px",
  borderRadius: 7,
  fontSize: 13,
  fontWeight: 500,
  border: "1px solid",
  cursor: "pointer",
};
