"use client";

import { useActionState, useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  createProject,
  updateProject,
  deleteProject,
  type ProjectActionState,
} from "@/lib/actions/projects";
import { uploadImage } from "@/lib/actions/upload";

interface Step { title: string; description: string; }
interface Metric { value: string; label: string; }

interface ProjectFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    locale: string;
    title: string;
    seoTitle: string;
    slug: string;
    industry: string;
    duration: string;
    summary: string;
    coverMetric: string;
    coverMetricLabel: string;
    coverImage: string;
    challengeTitle: string;
    challengeIntro: string;
    challengePoints: string[];
    approachTitle: string;
    approachSteps: Step[];
    resultsTitle: string;
    resultsSummary: string;
    resultsMetrics: Metric[];
    galleryImages: string[];
    isPublished: boolean;
  };
}

const TABS = ["Genel", "Sorun", "Yaklaşım", "Sonuçlar", "Galeri"] as const;
type Tab = (typeof TABS)[number];

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

export function ProjectForm({ mode, initialData }: ProjectFormProps) {
  const router = useRouter();
  const action = mode === "create" ? createProject : updateProject;
  const [state, formAction, pending] = useActionState<ProjectActionState, FormData>(action, null);

  const [activeTab, setActiveTab] = useState<Tab>("Genel");

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle ?? "");
  const [seoEdited, setSeoEdited] = useState(mode === "edit" && !!initialData?.seoTitle);
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [industry, setIndustry] = useState(initialData?.industry ?? "");
  const [duration, setDuration] = useState(initialData?.duration ?? "");
  const [summary, setSummary] = useState(initialData?.summary ?? "");
  const [coverMetric, setCoverMetric] = useState(initialData?.coverMetric ?? "");
  const [coverMetricLabel, setCoverMetricLabel] = useState(initialData?.coverMetricLabel ?? "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? "");
  const [locale, setLocale] = useState(initialData?.locale ?? "tr");
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false);

  const [challengeTitle, setChallengeTitle] = useState(initialData?.challengeTitle ?? "");
  const [challengeIntro, setChallengeIntro] = useState(initialData?.challengeIntro ?? "");
  const [challengePoints, setChallengePoints] = useState<string[]>(
    initialData?.challengePoints?.length ? initialData.challengePoints : [""]
  );

  const [approachTitle, setApproachTitle] = useState(initialData?.approachTitle ?? "");
  const [approachSteps, setApproachSteps] = useState<Step[]>(
    initialData?.approachSteps?.length
      ? initialData.approachSteps
      : [{ title: "", description: "" }, { title: "", description: "" }]
  );

  const [resultsTitle, setResultsTitle] = useState(initialData?.resultsTitle ?? "");
  const [resultsSummary, setResultsSummary] = useState(initialData?.resultsSummary ?? "");
  const [resultsMetrics, setResultsMetrics] = useState<Metric[]>(
    initialData?.resultsMetrics?.length
      ? initialData.resultsMetrics
      : [{ value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }]
  );

  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialData?.galleryImages?.length ? initialData.galleryImages : [""]
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePending, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadPending, startUploadTransition] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFileChange(file: File | null) {
    if (!file) return;
    setUploadError(null);
    startUploadTransition(async () => {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("folder", "projeler");
      const result = await uploadImage(fd);
      if (result.error) setUploadError(result.error);
      else if (result.url) setCoverImage(result.url);
    });
  }

  useEffect(() => {
    if (!slugEdited && title) setSlug(slugify(title));
  }, [title, slugEdited]);

  useEffect(() => {
    if (!seoEdited && title) setSeoTitle(title);
  }, [title, seoEdited]);

  useEffect(() => {
    if (state?.success) router.push("/yonetim/projeler");
  }, [state?.success, router]);

  function handleDelete() {
    if (!initialData) return;
    startDeleteTransition(async () => {
      const fd = new FormData();
      fd.set("id", initialData.id);
      const result = await deleteProject(null, fd);
      if (result?.error) setDeleteError(result.error);
      else router.push("/yonetim/projeler");
    });
  }

  const seoLen = seoTitle.length;
  const summaryLen = summary.length;

  return (
    <>
      <form action={formAction}>
        {/* Hidden inputs */}
        {mode === "edit" && initialData && <input type="hidden" name="id" value={initialData.id} />}
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="is_published" value={String(isPublished)} />
        <input type="hidden" name="title" value={title} />
        <input type="hidden" name="seo_title" value={seoTitle} />
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="industry" value={industry} />
        <input type="hidden" name="duration" value={duration} />
        <input type="hidden" name="summary" value={summary} />
        <input type="hidden" name="cover_metric" value={coverMetric} />
        <input type="hidden" name="cover_metric_label" value={coverMetricLabel} />
        <input type="hidden" name="cover_image" value={coverImage} />
        <input type="hidden" name="challenge_title" value={challengeTitle} />
        <input type="hidden" name="challenge_intro" value={challengeIntro} />
        {challengePoints.map((p, i) => <input key={i} type="hidden" name={`challenge_point_${i}`} value={p} />)}
        <input type="hidden" name="approach_title" value={approachTitle} />
        {approachSteps.map((s, i) => (
          <span key={i}>
            <input type="hidden" name={`approach_step_title_${i}`} value={s.title} />
            <input type="hidden" name={`approach_step_desc_${i}`} value={s.description} />
          </span>
        ))}
        <input type="hidden" name="results_title" value={resultsTitle} />
        <input type="hidden" name="results_summary" value={resultsSummary} />
        {resultsMetrics.map((m, i) => (
          <span key={i}>
            <input type="hidden" name={`metric_value_${i}`} value={m.value} />
            <input type="hidden" name={`metric_label_${i}`} value={m.label} />
          </span>
        ))}
        {galleryImages.map((img, i) => <input key={i} type="hidden" name={`gallery_image_${i}`} value={img} />)}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 40, alignItems: "start" }}>

          {/* ── Sol: Belge editörü ── */}
          <div>

            {/* Başlık — büyük ve belge hissi */}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Proje başlığı..."
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

            {/* Slug satırı */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 10,
              paddingBottom: 20,
              borderBottom: "1px solid var(--c-border)",
            }}>
              <span style={{ fontSize: 12, color: "var(--c-dim)", fontFamily: "monospace" }}>
                dousocial.com/projeler/
              </span>
              <input
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

            {/* Tab bar */}
            <div style={{ display: "flex", gap: 0, marginTop: 24, marginBottom: 28, borderBottom: "2px solid var(--c-border)" }}>
              {TABS.map((tab) => {
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: "8px 18px",
                      fontSize: 13,
                      fontWeight: active ? 700 : 500,
                      border: "none",
                      background: "transparent",
                      color: active ? "var(--c-text)" : "var(--c-dim)",
                      cursor: "pointer",
                      borderBottom: active ? "2px solid #fca5a5" : "2px solid transparent",
                      marginBottom: -2,
                      letterSpacing: active ? "-0.01em" : "0",
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Tab içerikleri */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* ── Genel ── */}
              {activeTab === "Genel" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Sektör</label>
                      <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="E-ticaret, Sağlık..." style={fieldInput} />
                    </div>
                    <div>
                      <label style={labelStyle}>Proje Süresi</label>
                      <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="3 ay, 90 gün..." style={fieldInput} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      Özet / Meta Açıklama
                      <span style={{
                        float: "right",
                        fontWeight: 400,
                        color: summaryLen > 160 ? "#f87171" : summaryLen > 140 ? "#fde68a" : "var(--c-dim)",
                      }}>
                        {summaryLen} / 160
                      </span>
                    </label>
                    <textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Projenin kısa özeti. Google arama sonucunda görünür."
                      rows={4}
                      style={{ ...fieldInput, resize: "vertical", lineHeight: 1.6 }}
                    />
                  </div>

                  <div style={{ padding: 18, background: "var(--c-surface2)", border: "1px solid var(--c-border)", borderRadius: 10 }}>
                    <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 700, color: "var(--c-text3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Kapak Metriği
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Değer</label>
                        <input value={coverMetric} onChange={(e) => setCoverMetric(e.target.value)} placeholder="3.4x" style={{ ...fieldInput, fontSize: 20, fontWeight: 800 }} />
                      </div>
                      <div>
                        <label style={labelStyle}>Açıklama</label>
                        <input value={coverMetricLabel} onChange={(e) => setCoverMetricLabel(e.target.value)} placeholder="dönüşüm artışı" style={fieldInput} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Kapak Görseli</label>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                    />

                    {/* Drop zone */}
                    <div
                      onClick={() => !uploadPending && fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files?.[0] ?? null); }}
                      style={{
                        position: "relative",
                        borderRadius: 9,
                        overflow: "hidden",
                        aspectRatio: "16/9",
                        background: "var(--c-surface2)",
                        border: dragOver ? "2px dashed #fca5a5" : coverImage ? "none" : "2px dashed var(--c-border)",
                        cursor: uploadPending ? "wait" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {coverImage && !uploadPending ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={coverImage} alt="önizleme" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.15s" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "0"; }}
                          >
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Değiştir</span>
                          </div>
                        </>
                      ) : uploadPending ? (
                        <div style={{ textAlign: "center" }}>
                          <div style={{ width: 28, height: 28, border: "3px solid var(--c-border)", borderTopColor: "#fca5a5", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 8px" }} />
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
                          <p style={{ margin: 0, fontSize: 11, color: "var(--c-dim)" }}>JPG, PNG, WEBP · maks 20 MB</p>
                        </div>
                      )}
                    </div>

                    {uploadError && <p style={{ margin: "8px 0 0", fontSize: 12, color: "#f87171" }}>⚠ {uploadError}</p>}

                    <input
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="Ya da URL yapıştır..."
                      style={{ ...fieldInput, marginTop: 8, fontSize: 12, color: "var(--c-dim)" }}
                    />

                    {coverImage && (
                      <button type="button" onClick={() => { setCoverImage(""); setUploadError(null); }}
                        style={{ ...outlineBtn, marginTop: 6, width: "100%", padding: "6px", fontSize: 12, color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}>
                        Görseli Kaldır
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* ── Sorun ── */}
              {activeTab === "Sorun" && (
                <>
                  <div>
                    <label style={labelStyle}>Sorun Başlığı</label>
                    <input
                      value={challengeTitle}
                      onChange={(e) => setChallengeTitle(e.target.value)}
                      placeholder="Müşterinin karşılaştığı temel zorluk"
                      style={{ ...fieldInput, fontSize: 18, fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Giriş Paragrafı</label>
                    <textarea
                      value={challengeIntro}
                      onChange={(e) => setChallengeIntro(e.target.value)}
                      placeholder="Sorunun arka planını anlatan paragraf..."
                      rows={5}
                      style={{ ...fieldInput, resize: "vertical", lineHeight: 1.7 }}
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <label style={{ ...labelStyle, marginBottom: 0 }}>Sorun Maddeleri</label>
                      <button type="button" onClick={() => setChallengePoints((p) => [...p, ""])} style={outlineBtn}>
                        + Ekle
                      </button>
                    </div>
                    {challengePoints.map((pt, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <input
                          value={pt}
                          onChange={(e) => setChallengePoints((p) => p.map((x, idx) => idx === i ? e.target.value : x))}
                          placeholder={`Madde ${i + 1}...`}
                          style={{ ...fieldInput, flex: 1 }}
                        />
                        {challengePoints.length > 1 && (
                          <button type="button" onClick={() => setChallengePoints((p) => p.filter((_, idx) => idx !== i))} style={{ ...outlineBtn, color: "#f87171", borderColor: "rgba(248,113,113,0.3)", flexShrink: 0 }}>
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── Yaklaşım ── */}
              {activeTab === "Yaklaşım" && (
                <>
                  <div>
                    <label style={labelStyle}>Yaklaşım Başlığı</label>
                    <input
                      value={approachTitle}
                      onChange={(e) => setApproachTitle(e.target.value)}
                      placeholder="Sorunu nasıl çözdük?"
                      style={{ ...fieldInput, fontSize: 18, fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <label style={{ ...labelStyle, marginBottom: 0 }}>Çözüm Adımları</label>
                      <button type="button" onClick={() => setApproachSteps((s) => [...s, { title: "", description: "" }])} style={outlineBtn}>
                        + Adım Ekle
                      </button>
                    </div>
                    {approachSteps.map((step, i) => (
                      <div key={i} style={{
                        background: "var(--c-surface2)",
                        border: "1px solid var(--c-border)",
                        borderRadius: 10,
                        padding: 16,
                        marginBottom: 12,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: "var(--c-dim)", letterSpacing: "0.08em" }}>
                            ADIM {String(i + 1).padStart(2, "0")}
                          </span>
                          {approachSteps.length > 1 && (
                            <button type="button" onClick={() => setApproachSteps((s) => s.filter((_, idx) => idx !== i))} style={{ ...outlineBtn, color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}>
                              Kaldır
                            </button>
                          )}
                        </div>
                        <input
                          value={step.title}
                          onChange={(e) => setApproachSteps((s) => s.map((x, idx) => idx === i ? { ...x, title: e.target.value } : x))}
                          placeholder="Adım başlığı..."
                          style={{ ...fieldInput, marginBottom: 10, fontWeight: 600 }}
                        />
                        <textarea
                          value={step.description}
                          onChange={(e) => setApproachSteps((s) => s.map((x, idx) => idx === i ? { ...x, description: e.target.value } : x))}
                          placeholder="Bu adımda ne yaptık? Ne öğrendik?"
                          rows={4}
                          style={{ ...fieldInput, resize: "vertical", lineHeight: 1.65 }}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── Sonuçlar ── */}
              {activeTab === "Sonuçlar" && (
                <>
                  <div>
                    <label style={labelStyle}>Sonuçlar Başlığı</label>
                    <input
                      value={resultsTitle}
                      onChange={(e) => setResultsTitle(e.target.value)}
                      placeholder="Elde ettiğimiz sonuçlar."
                      style={{ ...fieldInput, fontSize: 18, fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Özet Cümle</label>
                    <textarea
                      value={resultsSummary}
                      onChange={(e) => setResultsSummary(e.target.value)}
                      placeholder="Sonuçları özetleyen güçlü bir cümle..."
                      rows={3}
                      style={{ ...fieldInput, resize: "none", lineHeight: 1.6 }}
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <label style={{ ...labelStyle, marginBottom: 0 }}>Metrikler</label>
                      <button type="button" onClick={() => setResultsMetrics((m) => [...m, { value: "", label: "" }])} style={outlineBtn}>
                        + Metrik Ekle
                      </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {resultsMetrics.map((m, i) => (
                        <div key={i} style={{
                          background: "var(--c-surface2)",
                          border: "1px solid var(--c-border)",
                          borderRadius: 10,
                          padding: 14,
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--c-dim)", letterSpacing: "0.1em" }}>METRİK {i + 1}</span>
                            {resultsMetrics.length > 1 && (
                              <button type="button" onClick={() => setResultsMetrics((ms) => ms.filter((_, idx) => idx !== i))} style={{ ...outlineBtn, fontSize: 11, padding: "2px 8px", color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}>×</button>
                            )}
                          </div>
                          <input
                            value={m.value}
                            onChange={(e) => setResultsMetrics((ms) => ms.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))}
                            placeholder="3.4x"
                            style={{ ...fieldInput, marginBottom: 8, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", textAlign: "center" }}
                          />
                          <input
                            value={m.label}
                            onChange={(e) => setResultsMetrics((ms) => ms.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))}
                            placeholder="dönüşüm artışı"
                            style={{ ...fieldInput, fontSize: 12, textAlign: "center", color: "var(--c-dim)" }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── Galeri ── */}
              {activeTab === "Galeri" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Galeri Görselleri</label>
                    <button type="button" onClick={() => setGalleryImages((g) => [...g, ""])} style={outlineBtn}>
                      + Görsel Ekle
                    </button>
                  </div>
                  <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--c-dim)", lineHeight: 1.5 }}>
                    Her satıra bir görsel URL&apos;si girin. 4 görsel en iyi görünümü verir.
                  </p>
                  {galleryImages.map((img, i) => (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: img ? 8 : 0 }}>
                        <input
                          value={img}
                          onChange={(e) => setGalleryImages((g) => g.map((x, idx) => idx === i ? e.target.value : x))}
                          placeholder={`Görsel ${i + 1} URL...`}
                          style={{ ...fieldInput, flex: 1 }}
                        />
                        {galleryImages.length > 1 && (
                          <button type="button" onClick={() => setGalleryImages((g) => g.filter((_, idx) => idx !== i))} style={{ ...outlineBtn, color: "#f87171", borderColor: "rgba(248,113,113,0.3)", flexShrink: 0 }}>
                            ×
                          </button>
                        )}
                      </div>
                      {img && (
                        <div style={{ height: 90, borderRadius: 8, overflow: "hidden", background: "var(--c-surface2)" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Sağ: Yayın paneli ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 76 }}>

            {/* Yayın durumu */}
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

              <label style={fieldLabel}>Dil</label>
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
                value={seoTitle}
                onChange={(e) => { setSeoTitle(e.target.value); setSeoEdited(true); }}
                placeholder="<title> etiketi..."
                style={{
                  ...fieldInput,
                  borderColor: seoLen > 60 ? "rgba(248,113,113,0.5)" : undefined,
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
                  dousocial.com › projeler › {slug || "slug"}
                </p>
                <p style={{ margin: "0 0 3px", fontSize: 14, color: "#60a5fa", fontWeight: 600, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical" as const }}>
                  {seoTitle || title || "Proje Başlığı..."}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--c-dim)", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical" as const }}>
                  {summary || "Proje özeti burada görünecek..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Sil — ayrı */}
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
            <button type="button" onClick={() => setShowDeleteConfirm(true)} style={{ ...outlineBtn, width: "100%", padding: "9px 14px", color: "#f87171", borderColor: "rgba(248,113,113,0.35)" }}>
              Projeyi Sil
            </button>
          ) : (
            <div>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--c-text3)", lineHeight: 1.5 }}>Bu işlem geri alınamaz. Emin misiniz?</p>
              {deleteError && <p style={{ margin: "0 0 10px", fontSize: 13, color: "#f87171" }}>{deleteError}</p>}
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setShowDeleteConfirm(false)} style={{ ...outlineBtn, flex: 1, padding: "9px" }}>İptal</button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deletePending}
                  style={{ ...outlineBtn, flex: 1, padding: "9px", color: "#f87171", borderColor: "rgba(248,113,113,0.35)", background: "rgba(248,113,113,0.08)", opacity: deletePending ? 0.7 : 1 }}
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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--c-text3)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: 7,
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

const outlineBtn: React.CSSProperties = {
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
