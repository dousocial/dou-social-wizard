"use client";

import { useActionState, useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  type BlogActionState,
} from "@/lib/actions/blog";
import { uploadImage } from "@/lib/actions/upload";

interface FAQ { q: string; a: string; }

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

  // Cover upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadPending, startUploadTransition] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFileChange(file: File | null) {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { setUploadError("20 MB'dan büyük dosya yüklenemez."); return; }
    setUploadError(null);
    startUploadTransition(async () => {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("folder", "blog");
      const result = await uploadImage(fd);
      if (result.error) setUploadError(result.error);
      else if (result.url) setCover(result.url);
    });
  }

  // Inline content image upload
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastCursorRef = useRef<number>(0);
  const inlineFileRef = useRef<HTMLInputElement>(null);
  const [inlineUploadPending, startInlineUploadTransition] = useTransition();
  const [inlineUploadError, setInlineUploadError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  function insertImageAtCursor(url: string) {
    const ta = textareaRef.current;
    const pos = ta ? ta.selectionStart ?? lastCursorRef.current : lastCursorRef.current;
    const before = content.slice(0, pos);
    const after = content.slice(pos);
    const insertion = `\n\n![](${url})\n\n`;
    const newContent = before + insertion + after;
    setContent(newContent);
    const newPos = pos + insertion.length;
    lastCursorRef.current = newPos;
    setTimeout(() => {
      if (ta) { ta.focus(); ta.setSelectionRange(newPos, newPos); }
    }, 0);
  }

  function handleInlineUpload(file: File | null) {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { setInlineUploadError("20 MB'dan büyük dosya yüklenemez."); return; }
    setInlineUploadError(null);
    startInlineUploadTransition(async () => {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("folder", "blog");
      const result = await uploadImage(fd);
      if (result.error) { setInlineUploadError(result.error); return; }
      if (result.url) {
        setUploadedImages((prev) => [...prev, result.url!]);
        insertImageAtCursor(result.url);
      }
    });
  }

  useEffect(() => {
    if (!slugEdited && title) setSlug(slugify(title));
  }, [title, slugEdited]);

  useEffect(() => {
    if (!seoTitleEdited && title) setSeoTitle(title);
  }, [title, seoTitleEdited]);

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
        {faqItems.map((item, i) => (
          <span key={i}>
            <input type="hidden" name={`faq_q_${i}`} value={item.q} />
            <input type="hidden" name={`faq_a_${i}`} value={item.a} />
          </span>
        ))}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 40, alignItems: "start" }}>

          {/* ── Sol: Belge editörü ── */}
          <div>

            {/* Başlık — büyük, belge hissi */}
            <input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Yazının başlığı..."
              required
              style={{
                display: "block",
                width: "100%",
                fontSize: 34,
                fontWeight: 800,
                color: "var(--c-text)",
                border: "none",
                outline: "none",
                background: "transparent",
                lineHeight: 1.15,
                padding: "6px 0",
                letterSpacing: "-0.025em",
                boxSizing: "border-box",
              }}
            />

            {/* Slug + meta satırı */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 10,
              paddingBottom: 20,
              borderBottom: "1px solid var(--c-border)",
            }}>
              <span style={{ fontSize: 12, color: "var(--c-dim)", fontFamily: "monospace" }}>
                dousocial.com/blog/
              </span>
              <input
                name="slug"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
                style={{
                  fontSize: 12,
                  color: "var(--c-dim)",
                  fontFamily: "monospace",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  flex: 1,
                  minWidth: 0,
                }}
              />
            </div>

            {/* İçerik editörü */}
            <div style={{ marginTop: 28 }}>
              {/* Toolbar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}>
                <span style={sectionLabel}>İçerik</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {inlineUploadPending ? (
                    <span style={{ fontSize: 12, color: "var(--c-dim)", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 14, height: 14, border: "2px solid var(--c-border)", borderTopColor: "#fca5a5", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                      Yükleniyor…
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => inlineFileRef.current?.click()}
                      title="Görsel yükle ve cursor konumuna ekle"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        border: "1px solid var(--c-border)",
                        background: "transparent",
                        color: "var(--c-text3)",
                        cursor: "pointer",
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                        <path d="m21 15-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Görsel Ekle
                    </button>
                  )}
                  <span style={{ fontSize: 11, color: "var(--c-dim)" }}>Markdown · Görsel için ≤2 MB önerilir</span>
                </div>
              </div>

              {inlineUploadError && (
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#f87171" }}>⚠ {inlineUploadError}</p>
              )}

              {/* Hidden inline file input */}
              <input
                ref={inlineFileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => { handleInlineUpload(e.target.files?.[0] ?? null); e.target.value = ""; }}
              />

              <textarea
                ref={textareaRef}
                name="content"
                value={content}
                onChange={(e) => { setContent(e.target.value); lastCursorRef.current = e.target.selectionStart; }}
                onSelect={(e) => { lastCursorRef.current = (e.target as HTMLTextAreaElement).selectionStart; }}
                onBlur={(e) => { lastCursorRef.current = e.target.selectionStart; }}
                placeholder={"Yazmaya başlayın...\n\n## Başlık\n\nMetin paragrafı **kalın** veya *italik* olabilir.\n\n- Liste maddesi"}
                rows={32}
                style={{
                  width: "100%",
                  border: "1px solid var(--c-border)",
                  borderRadius: 10,
                  background: "var(--c-surface)",
                  color: "var(--c-text)",
                  fontSize: 15,
                  lineHeight: 1.8,
                  fontFamily: "'SF Mono', 'Fira Code', Consolas, monospace",
                  resize: "vertical",
                  outline: "none",
                  padding: "20px 24px",
                  boxSizing: "border-box",
                  marginTop: 10,
                }}
              />
            </div>

            {/* Yüklenen Görseller */}
            {uploadedImages.length > 0 && (
              <div style={{ marginTop: 20, padding: 16, background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={sectionLabel}>Bu Yazıya Yüklenen Görseller</span>
                  <span style={{ fontSize: 11, color: "var(--c-dim)" }}>Tıkla → cursor konumuna ekle</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
                  {uploadedImages.map((url, i) => (
                    <div
                      key={i}
                      onClick={() => insertImageAtCursor(url)}
                      title="Metne ekle"
                      style={{
                        position: "relative",
                        aspectRatio: "16/9",
                        borderRadius: 7,
                        overflow: "hidden",
                        background: "var(--c-surface2)",
                        border: "1px solid var(--c-border)",
                        cursor: "pointer",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0,
                        transition: "opacity 0.15s",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#fff",
                      }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "0"; }}
                      >
                        + Ekle
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SSS builder */}
            <div style={{ marginTop: 36, paddingTop: 28, borderTop: "1px solid var(--c-border)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={sectionLabel}>Sıkça Sorulan Sorular</span>
                <button
                  type="button"
                  onClick={() => setFaqItems((p) => [...p, { q: "", a: "" }])}
                  style={outlineBtnStyle}
                >
                  + Soru Ekle
                </button>
              </div>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--c-dim)", lineHeight: 1.5 }}>
                SSS, içeriğin sonuna otomatik eklenir. Google&apos;da öne çıkan snippet olarak görünebilir.
              </p>
              {faqItems.map((item, i) => (
                <div key={i} style={{ marginBottom: 12, border: "1px solid var(--c-border)", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 16px",
                    background: "var(--c-surface2)",
                    borderBottom: "1px solid var(--c-border)",
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--c-text3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Soru {i + 1}
                    </span>
                    {faqItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFaqItems((p) => p.filter((_, idx) => idx !== i))}
                        style={{ ...outlineBtnStyle, color: "#f87171", borderColor: "rgba(248,113,113,0.35)" }}
                      >
                        Kaldır
                      </button>
                    )}
                  </div>
                  <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                    <input
                      value={item.q}
                      onChange={(e) => setFaqItems((p) => p.map((x, idx) => idx === i ? { ...x, q: e.target.value } : x))}
                      placeholder="Soru..."
                      style={{ ...fieldInput, fontWeight: 600 }}
                    />
                    <textarea
                      value={item.a}
                      onChange={(e) => setFaqItems((p) => p.map((x, idx) => idx === i ? { ...x, a: e.target.value } : x))}
                      placeholder="Cevap..."
                      rows={3}
                      style={{ ...fieldInput, resize: "vertical", lineHeight: 1.6 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Sağ: Yayın paneli ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 76 }}>

            {/* Yayın durumu + kaydet */}
            <div style={cardStyle}>
              <p style={cardTitle}>Yayın Durumu</p>

              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => setIsPublished(false)}
                  style={{
                    ...statusBtn,
                    background: !isPublished ? "rgba(251,191,36,0.12)" : "transparent",
                    color: !isPublished ? "#fde68a" : "var(--c-text3)",
                    borderColor: !isPublished ? "rgba(251,191,36,0.4)" : "var(--c-border)",
                  }}
                >
                  ○ Taslak
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublished(true)}
                  style={{
                    ...statusBtn,
                    background: isPublished ? "rgba(34,197,94,0.12)" : "transparent",
                    color: isPublished ? "#86efac" : "var(--c-text3)",
                    borderColor: isPublished ? "rgba(34,197,94,0.4)" : "var(--c-border)",
                  }}
                >
                  ● Yayınla
                </button>
              </div>

              <label style={fieldLabel}>Yayın Tarihi</label>
              <input
                name="published_at"
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                style={fieldInput}
              />

              <label style={{ ...fieldLabel, marginTop: 12 }}>Dil</label>
              <select value={locale} onChange={(e) => setLocale(e.target.value)} style={fieldInput}>
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>

              <button
                type="submit"
                disabled={pending}
                style={{
                  marginTop: 16,
                  width: "100%",
                  padding: "12px 18px",
                  borderRadius: 9,
                  fontSize: 14,
                  fontWeight: 700,
                  border: "none",
                  cursor: pending ? "not-allowed" : "pointer",
                  background: isPublished
                    ? "linear-gradient(135deg, #9b1c1c 0%, #7f1d1d 100%)"
                    : "var(--c-border)",
                  color: isPublished ? "#fff" : "var(--c-text3)",
                  opacity: pending ? 0.65 : 1,
                  letterSpacing: "0.01em",
                  boxShadow: isPublished ? "0 2px 8px rgba(155,28,28,0.3)" : "none",
                }}
              >
                {pending ? "Kaydediliyor..." : mode === "create" ? (isPublished ? "Yayınla" : "Taslak Kaydet") : "Güncelle"}
              </button>

              {state?.error && (
                <p style={{ margin: "10px 0 0", fontSize: 13, color: "#f87171", lineHeight: 1.4 }}>
                  ⚠ {state.error}
                </p>
              )}
            </div>

            {/* SEO */}
            <div style={cardStyle}>
              <p style={cardTitle}>SEO</p>

              <label style={fieldLabel}>
                Başlık
                <span style={{
                  float: "right",
                  fontWeight: 400,
                  color: seoLen > 60 ? "#f87171" : seoLen > 50 ? "#fde68a" : "var(--c-dim)",
                }}>
                  {seoLen} / 60
                </span>
              </label>
              <input
                name="seo_title"
                value={seoTitle}
                onChange={(e) => { setSeoTitle(e.target.value); setSeoTitleEdited(true); }}
                placeholder="<title> etiketi..."
                style={{
                  ...fieldInput,
                  borderColor: seoLen > 60 ? "rgba(248,113,113,0.5)" : undefined,
                }}
              />

              <label style={{ ...fieldLabel, marginTop: 12 }}>
                Meta Açıklama
                <span style={{
                  float: "right",
                  fontWeight: 400,
                  color: descLen > 160 ? "#f87171" : descLen > 140 ? "#fde68a" : "var(--c-dim)",
                }}>
                  {descLen} / 160
                </span>
              </label>
              <textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Arama sonucunda görünecek açıklama..."
                rows={4}
                style={{
                  ...fieldInput,
                  resize: "none",
                  lineHeight: 1.6,
                  borderColor: descLen > 160 ? "rgba(248,113,113,0.5)" : undefined,
                }}
              />

              {/* SERP önizleme */}
              <div style={{
                marginTop: 14,
                padding: "12px 14px",
                background: "var(--c-surface2)",
                borderRadius: 8,
                border: "1px solid var(--c-border)",
              }}>
                <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Google Önizleme
                </p>
                <p style={{ margin: "0 0 2px", fontSize: 11, color: "#6ee7b7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  dousocial.com › blog › {slug || "slug"}
                </p>
                <p style={{ margin: "0 0 3px", fontSize: 14, color: "#60a5fa", fontWeight: 600, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical" as const }}>
                  {seoTitle || title || "SEO Başlığı..."}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--c-dim)", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical" as const }}>
                  {description || "Meta açıklama buraya gelecek..."}
                </p>
              </div>
            </div>

            {/* Görsel & Etiketler */}
            <div style={cardStyle}>
              <p style={cardTitle}>Kapak Görseli</p>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
              {/* Hidden form input for cover URL (goes with form submit) */}
              <input type="hidden" name="cover" value={cover} />

              {/* Drop zone / preview */}
              <div
                onClick={() => !uploadPending && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFileChange(e.dataTransfer.files?.[0] ?? null);
                }}
                style={{
                  position: "relative",
                  borderRadius: 9,
                  overflow: "hidden",
                  aspectRatio: "16/9",
                  background: "var(--c-surface2)",
                  border: dragOver
                    ? "2px dashed #fca5a5"
                    : cover
                    ? "none"
                    : "2px dashed var(--c-border)",
                  cursor: uploadPending ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {cover && !uploadPending ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover}
                      alt="kapak"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    {/* Hover overlay */}
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.55)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.15s",
                    }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "0"; }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Değiştir</span>
                    </div>
                  </>
                ) : uploadPending ? (
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      width: 28, height: 28,
                      border: "3px solid var(--c-border)",
                      borderTopColor: "#fca5a5",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                      margin: "0 auto 8px",
                    }} />
                    <p style={{ margin: 0, fontSize: 12, color: "var(--c-dim)" }}>Yükleniyor…</p>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: 12 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto 8px", display: "block", opacity: 0.4 }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: "var(--c-text3)" }}>
                      {dragOver ? "Bırak!" : "Tıkla veya sürükle bırak"}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: "var(--c-dim)", lineHeight: 1.5 }}>
                      JPG, PNG, WEBP · maks 20 MB<br />
                      <span style={{ color: "#fbbf24" }}>Sitenin hızı için ≤2 MB önerilir</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Hata */}
              {uploadError && (
                <p style={{ margin: "8px 0 0", fontSize: 12, color: "#f87171" }}>⚠ {uploadError}</p>
              )}

              {/* URL elle giriş (opsiyonel) */}
              <div style={{ marginTop: 10 }}>
                <input
                  value={cover}
                  onChange={(e) => setCover(e.target.value)}
                  placeholder="Ya da URL yapıştır..."
                  style={{ ...fieldInput, fontSize: 12, color: "var(--c-dim)" }}
                />
              </div>

              {cover && (
                <button
                  type="button"
                  onClick={() => { setCover(""); setUploadError(null); }}
                  style={{ ...outlineBtnStyle, marginTop: 8, width: "100%", padding: "6px", fontSize: 12, color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}
                >
                  Görseli Kaldır
                </button>
              )}
            </div>

            {/* Etiketler */}
            <div style={cardStyle}>
              <p style={cardTitle}>Etiketler</p>
              <input
                name="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="SEO, Dijital Pazarlama, Trendler"
                style={fieldInput}
              />
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--c-dim)" }}>Virgülle ayırın</p>
            </div>
          </div>
        </div>
      </form>

      {/* Sil — ayrı form */}
      {mode === "edit" && initialData && (
        <div style={{
          marginTop: 32,
          maxWidth: 300,
          marginLeft: "auto",
          padding: 16,
          background: "var(--c-surface)",
          border: "1px solid rgba(248,113,113,0.2)",
          borderRadius: 10,
        }}>
          <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.07em" }}>Tehlikeli Bölge</p>
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              style={{ ...outlineBtnStyle, width: "100%", padding: "9px 14px", color: "#f87171", borderColor: "rgba(248,113,113,0.35)" }}
            >
              Yazıyı Sil
            </button>
          ) : (
            <div>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--c-text3)", lineHeight: 1.5 }}>
                Bu işlem geri alınamaz. Emin misiniz?
              </p>
              {deleteError && <p style={{ margin: "0 0 10px", fontSize: 13, color: "#f87171" }}>{deleteError}</p>}
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setShowDeleteConfirm(false)} style={{ ...outlineBtnStyle, flex: 1, padding: "9px" }}>İptal</button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deletePending}
                  style={{ ...outlineBtnStyle, flex: 1, padding: "9px", color: "#f87171", borderColor: "rgba(248,113,113,0.35)", background: "rgba(248,113,113,0.08)", opacity: deletePending ? 0.7 : 1 }}
                >
                  {deletePending ? "..." : "Evet, Sil"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "var(--c-text3)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const fieldLabel: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--c-text3)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: 6,
};

const fieldInput: React.CSSProperties = {
  width: "100%",
  padding: "9px 11px",
  borderRadius: 7,
  border: "1px solid var(--c-border)",
  background: "var(--c-surface2)",
  color: "var(--c-text)",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

const outlineBtnStyle: React.CSSProperties = {
  padding: "5px 12px",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  border: "1px solid var(--c-border)",
  background: "transparent",
  color: "var(--c-text3)",
  cursor: "pointer",
};

const cardStyle: React.CSSProperties = {
  background: "var(--c-surface)",
  border: "1px solid var(--c-border)",
  borderRadius: 12,
  padding: 18,
};

const cardTitle: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--c-text2)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const statusBtn: React.CSSProperties = {
  flex: 1,
  padding: "8px 10px",
  borderRadius: 7,
  fontSize: 12,
  fontWeight: 600,
  border: "1px solid",
  cursor: "pointer",
  letterSpacing: "0.02em",
};
