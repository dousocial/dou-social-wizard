"use client";

import { useActionState, useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createProject,
  updateProject,
  deleteProject,
  type ProjectActionState,
} from "@/lib/actions/projects";

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

  // Genel
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

  // Sorun
  const [challengeTitle, setChallengeTitle] = useState(initialData?.challengeTitle ?? "");
  const [challengeIntro, setChallengeIntro] = useState(initialData?.challengeIntro ?? "");
  const [challengePoints, setChallengePoints] = useState<string[]>(
    initialData?.challengePoints?.length ? initialData.challengePoints : [""]
  );

  // Yaklaşım
  const [approachTitle, setApproachTitle] = useState(initialData?.approachTitle ?? "");
  const [approachSteps, setApproachSteps] = useState<Step[]>(
    initialData?.approachSteps?.length
      ? initialData.approachSteps
      : [{ title: "", description: "" }, { title: "", description: "" }]
  );

  // Sonuçlar
  const [resultsTitle, setResultsTitle] = useState(initialData?.resultsTitle ?? "");
  const [resultsSummary, setResultsSummary] = useState(initialData?.resultsSummary ?? "");
  const [resultsMetrics, setResultsMetrics] = useState<Metric[]>(
    initialData?.resultsMetrics?.length
      ? initialData.resultsMetrics
      : [{ value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }]
  );

  // Galeri
  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialData?.galleryImages?.length ? initialData.galleryImages : [""]
  );

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePending, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Auto-derive slug and seoTitle
  useEffect(() => {
    if (!slugEdited && title) setSlug(slugify(title));
  }, [title, slugEdited]);

  useEffect(() => {
    if (!seoEdited && title) setSeoTitle(title);
  }, [title, seoEdited]);

  // Redirect on success
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
        {mode === "edit" && initialData && (
          <input type="hidden" name="id" value={initialData.id} />
        )}
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
        {challengePoints.map((p, i) => (
          <input key={i} type="hidden" name={`challenge_point_${i}`} value={p} />
        ))}
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
        {galleryImages.map((img, i) => (
          <input key={i} type="hidden" name={`gallery_image_${i}`} value={img} />
        ))}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>

          {/* ── Left: Tabbed sections ── */}
          <div>
            {/* Tab bar */}
            <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid var(--c-border)", paddingBottom: 0 }}>
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "7px 7px 0 0",
                    fontSize: 13,
                    fontWeight: 600,
                    border: "1px solid",
                    borderBottom: activeTab === tab ? "1px solid var(--c-surface)" : "1px solid var(--c-border)",
                    cursor: "pointer",
                    background: activeTab === tab ? "var(--c-surface)" : "transparent",
                    color: activeTab === tab ? "var(--c-text)" : "var(--c-text3)",
                    borderColor: activeTab === tab ? "var(--c-border)" : "transparent",
                    marginBottom: activeTab === tab ? -1 : 0,
                    position: "relative",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* ── Genel ── */}
              {activeTab === "Genel" && (
                <>
                  <div>
                    <label style={labelStyle}>Başlık</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Proje başlığı..." required style={inputStyle} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Sektör</label>
                      <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="E-ticaret, Sağlık..." style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Süre</label>
                      <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="3 ay, 90 gün..." style={inputStyle} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>URL Slug</label>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "var(--c-dim)", whiteSpace: "nowrap" }}>/projeler/</span>
                      <input
                        value={slug}
                        onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
                        placeholder="proje-slug"
                        style={{ ...inputStyle, flex: 1 }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      Özet (meta açıklama)
                      <span style={{ float: "right", color: summaryLen > 160 ? "#f87171" : summaryLen > 140 ? "#fde68a" : "var(--c-dim)" }}>
                        {summaryLen}/160
                      </span>
                    </label>
                    <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Projenin kısa özeti. Google arama sonucunda görünür." rows={3} style={{ ...inputStyle, resize: "none" }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Kapak Metriği</label>
                      <input value={coverMetric} onChange={(e) => setCoverMetric(e.target.value)} placeholder="3.4x, %48, 940..." style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Metrik Açıklaması</label>
                      <input value={coverMetricLabel} onChange={(e) => setCoverMetricLabel(e.target.value)} placeholder="dönüşüm artışı" style={inputStyle} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Kapak Görseli URL</label>
                    <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="/projeler/proje-slug/kapak.jpg" style={inputStyle} />
                    {coverImage && (
                      <div style={{ marginTop: 8, borderRadius: 8, overflow: "hidden", aspectRatio: "16/9", background: "var(--c-surface2)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={coverImage} alt="önizleme" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── Sorun ── */}
              {activeTab === "Sorun" && (
                <>
                  <div>
                    <label style={labelStyle}>Sorun Başlığı</label>
                    <input value={challengeTitle} onChange={(e) => setChallengeTitle(e.target.value)} placeholder="Müşterinin karşılaştığı zorluk" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Giriş Paragrafı</label>
                    <textarea value={challengeIntro} onChange={(e) => setChallengeIntro(e.target.value)} placeholder="Sorunun arka planını anlatan paragraf..." rows={4} style={{ ...inputStyle, resize: "vertical" }} />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <label style={{ ...labelStyle, marginBottom: 0 }}>Sorun Maddeleri</label>
                      <button type="button" onClick={() => setChallengePoints((p) => [...p, ""])} style={smallBtnStyle}>+ Ekle</button>
                    </div>
                    {challengePoints.map((pt, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <input value={pt} onChange={(e) => setChallengePoints((p) => p.map((x, idx) => idx === i ? e.target.value : x))} placeholder={`Madde ${i + 1}...`} style={{ ...inputStyle, flex: 1 }} />
                        {challengePoints.length > 1 && (
                          <button type="button" onClick={() => setChallengePoints((p) => p.filter((_, idx) => idx !== i))} style={{ ...smallBtnStyle, color: "#f87171", borderColor: "rgba(248,113,113,0.3)", flexShrink: 0 }}>×</button>
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
                    <input value={approachTitle} onChange={(e) => setApproachTitle(e.target.value)} placeholder="Nasıl çözdük?" style={inputStyle} />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <label style={{ ...labelStyle, marginBottom: 0 }}>Adımlar</label>
                      <button type="button" onClick={() => setApproachSteps((s) => [...s, { title: "", description: "" }])} style={smallBtnStyle}>+ Adım Ekle</button>
                    </div>
                    {approachSteps.map((step, i) => (
                      <div key={i} style={{ background: "var(--c-surface2)", border: "1px solid var(--c-border)", borderRadius: 8, padding: 14, marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontSize: 12, color: "var(--c-dim)", fontWeight: 700 }}>Adım {String(i + 1).padStart(2, "0")}</span>
                          {approachSteps.length > 1 && (
                            <button type="button" onClick={() => setApproachSteps((s) => s.filter((_, idx) => idx !== i))} style={{ ...smallBtnStyle, color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}>Kaldır</button>
                          )}
                        </div>
                        <input value={step.title} onChange={(e) => setApproachSteps((s) => s.map((x, idx) => idx === i ? { ...x, title: e.target.value } : x))} placeholder="Adım başlığı..." style={{ ...inputStyle, marginBottom: 8 }} />
                        <textarea value={step.description} onChange={(e) => setApproachSteps((s) => s.map((x, idx) => idx === i ? { ...x, description: e.target.value } : x))} placeholder="Bu adımda ne yaptık?" rows={3} style={{ ...inputStyle, resize: "vertical" }} />
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
                    <input value={resultsTitle} onChange={(e) => setResultsTitle(e.target.value)} placeholder="Elde ettiğimiz sonuçlar." style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Özet Cümle</label>
                    <textarea value={resultsSummary} onChange={(e) => setResultsSummary(e.target.value)} placeholder="Sonuçları özetleyen bir cümle..." rows={2} style={{ ...inputStyle, resize: "none" }} />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <label style={{ ...labelStyle, marginBottom: 0 }}>Metrikler</label>
                      <button type="button" onClick={() => setResultsMetrics((m) => [...m, { value: "", label: "" }])} style={smallBtnStyle}>+ Metrik Ekle</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {resultsMetrics.map((m, i) => (
                        <div key={i} style={{ background: "var(--c-surface2)", border: "1px solid var(--c-border)", borderRadius: 8, padding: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <span style={{ fontSize: 11, color: "var(--c-dim)", fontWeight: 700 }}>METRİK {i + 1}</span>
                            {resultsMetrics.length > 1 && (
                              <button type="button" onClick={() => setResultsMetrics((ms) => ms.filter((_, idx) => idx !== i))} style={{ ...smallBtnStyle, fontSize: 11, padding: "2px 8px", color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}>×</button>
                            )}
                          </div>
                          <input value={m.value} onChange={(e) => setResultsMetrics((ms) => ms.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))} placeholder="3.4x" style={{ ...inputStyle, marginBottom: 6, fontSize: 18, fontWeight: 700 }} />
                          <input value={m.label} onChange={(e) => setResultsMetrics((ms) => ms.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} placeholder="dönüşüm artışı" style={{ ...inputStyle, fontSize: 12 }} />
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
                    <button type="button" onClick={() => setGalleryImages((g) => [...g, ""])} style={smallBtnStyle}>+ Görsel Ekle</button>
                  </div>
                  <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--c-dim)" }}>Her satıra bir görsel URL'si girin. 4 görsel en iyi görünümü verir.</p>
                  {galleryImages.map((img, i) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: img ? 6 : 0 }}>
                        <input value={img} onChange={(e) => setGalleryImages((g) => g.map((x, idx) => idx === i ? e.target.value : x))} placeholder={`Görsel ${i + 1} URL...`} style={{ ...inputStyle, flex: 1 }} />
                        {galleryImages.length > 1 && (
                          <button type="button" onClick={() => setGalleryImages((g) => g.filter((_, idx) => idx !== i))} style={{ ...smallBtnStyle, color: "#f87171", borderColor: "rgba(248,113,113,0.3)", flexShrink: 0 }}>×</button>
                        )}
                      </div>
                      {img && (
                        <div style={{ height: 80, borderRadius: 6, overflow: "hidden", background: "var(--c-surface2)" }}>
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

          {/* ── Right sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 80 }}>

            {/* Publish */}
            <div style={panelStyle}>
              <p style={panelTitleStyle}>Yayın</p>

              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <button type="button" onClick={() => setIsPublished(false)} style={{ ...toggleBtnStyle, background: !isPublished ? "rgba(251,191,36,0.12)" : "transparent", color: !isPublished ? "#fde68a" : "var(--c-text3)", borderColor: !isPublished ? "rgba(251,191,36,0.35)" : "var(--c-border)" }}>
                  Taslak
                </button>
                <button type="button" onClick={() => setIsPublished(true)} style={{ ...toggleBtnStyle, background: isPublished ? "rgba(34,197,94,0.12)" : "transparent", color: isPublished ? "#86efac" : "var(--c-text3)", borderColor: isPublished ? "rgba(34,197,94,0.35)" : "var(--c-border)" }}>
                  Yayınla
                </button>
              </div>

              <label style={labelStyle}>Dil</label>
              <select value={locale} onChange={(e) => setLocale(e.target.value)} style={inputStyle}>
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>

              <button type="submit" disabled={pending} style={{ marginTop: 14, width: "100%", padding: "10px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600, border: "none", cursor: pending ? "not-allowed" : "pointer", background: "#9b1c1c", color: "#fff", opacity: pending ? 0.7 : 1 }}>
                {pending ? "Kaydediliyor..." : mode === "create" ? "Oluştur" : "Güncelle"}
              </button>

              {state?.error && (
                <p style={{ margin: "10px 0 0", fontSize: 13, color: "#f87171" }}>Hata: {state.error}</p>
              )}
            </div>

            {/* SEO */}
            <div style={panelStyle}>
              <p style={panelTitleStyle}>SEO</p>

              <label style={labelStyle}>
                SEO Başlığı
                <span style={{ float: "right", color: seoLen > 60 ? "#f87171" : seoLen > 50 ? "#fde68a" : "var(--c-dim)" }}>{seoLen}/60</span>
              </label>
              <input value={seoTitle} onChange={(e) => { setSeoTitle(e.target.value); setSeoEdited(true); }} placeholder="Google'da <title> olarak görünecek..." style={{ ...inputStyle, borderColor: seoLen > 60 ? "rgba(248,113,113,0.5)" : undefined }} />

              {/* SERP preview */}
              <div style={{ marginTop: 14, padding: 12, background: "var(--c-surface2)", borderRadius: 8, border: "1px solid var(--c-border)" }}>
                <p style={{ margin: "0 0 6px", fontSize: 10, color: "var(--c-dim)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Google Önizleme</p>
                <p style={{ margin: "0 0 1px", fontSize: 12, color: "#6ee7b7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  dousocial.com › projeler › {slug || "slug"}
                </p>
                <p style={{ margin: "0 0 2px", fontSize: 14, color: "#60a5fa", fontWeight: 500, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical" as const }}>
                  {seoTitle || title || "Proje Başlığı..."}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--c-dim)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical" as const }}>
                  {summary || "Proje özeti burada görünecek..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Delete — outside main form */}
      {mode === "edit" && initialData && (
        <div style={{ marginTop: 24, maxWidth: 300, marginLeft: "auto", background: "var(--c-surface)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 10, padding: 16 }}>
          <p style={{ ...panelTitleStyle, color: "#f87171" }}>Tehlikeli Bölge</p>
          {!showDeleteConfirm ? (
            <button type="button" onClick={() => setShowDeleteConfirm(true)} style={{ ...smallBtnStyle, width: "100%", padding: "8px 14px", color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}>
              Projeyi Sil
            </button>
          ) : (
            <div>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--c-text3)" }}>Bu işlem geri alınamaz. Emin misiniz?</p>
              {deleteError && <p style={{ margin: "0 0 10px", fontSize: 13, color: "#f87171" }}>Hata: {deleteError}</p>}
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setShowDeleteConfirm(false)} style={{ ...smallBtnStyle, flex: 1, padding: "8px 14px" }}>İptal</button>
                <button type="button" onClick={handleDelete} disabled={deletePending} style={{ ...smallBtnStyle, flex: 1, padding: "8px 14px", color: "#f87171", borderColor: "rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.1)", opacity: deletePending ? 0.7 : 1 }}>
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

const labelStyle: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", borderRadius: 7, border: "1px solid var(--c-border)", background: "var(--c-surface2)", color: "var(--c-text)", fontSize: 14, outline: "none", boxSizing: "border-box" };
const smallBtnStyle: React.CSSProperties = { padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-text3)", cursor: "pointer" };
const panelStyle: React.CSSProperties = { background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 10, padding: 16 };
const panelTitleStyle: React.CSSProperties = { margin: "0 0 14px", fontSize: 11, fontWeight: 700, color: "var(--c-text2)", textTransform: "uppercase", letterSpacing: "0.07em" };
const toggleBtnStyle: React.CSSProperties = { flex: 1, padding: "8px 12px", borderRadius: 7, fontSize: 13, fontWeight: 500, border: "1px solid", cursor: "pointer" };
