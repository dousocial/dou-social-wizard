"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { addMusteri, updateMusteri, deleteMusteri } from "@/lib/actions/musteriler";
import { DatePicker } from "./DatePicker";

type Musteri = {
  id: string;
  created_at: string;
  ad: string;
  sektor: string;
  website: string;
  email: string;
  telefon: string;
  sorumlu: string;
  durum: "aktif" | "pasif" | "potansiyel";
  platformlar: string[];
  aylik_ucret: number;
  baslangic_tarihi: string | null;
  notlar: string;
  sozlesme_bitis_tarihi: string | null;
  yenileme_hatirlatma_gun: number;
};

const DURUM: Record<string, { label: string; color: string; bg: string; border: string }> = {
  aktif:      { label: "Aktif",      color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)" },
  pasif:      { label: "Pasif",      color: "#64748b", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.3)" },
  potansiyel: { label: "Potansiyel", color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)" },
};

const PLATFORMS = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook",  label: "Facebook" },
  { key: "google",    label: "Google Ads" },
  { key: "linkedin",  label: "LinkedIn" },
  { key: "tiktok",    label: "TikTok" },
  { key: "youtube",   label: "YouTube" },
  { key: "twitter",   label: "Twitter/X" },
];

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#e1306c", facebook: "#1877f2", google: "#4285f4",
  linkedin: "#0a66c2", tiktok: "#818cf8", youtube: "#ff0000", twitter: "#1da1f2",
};

function fmt(n: number) { return new Intl.NumberFormat("tr-TR").format(n); }

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR", { year: "numeric", month: "short" });
}

function getSozlesmeTag(sozlesme_bitis_tarihi: string | null, hatirlatma: number) {
  if (!sozlesme_bitis_tarihi) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bitis = new Date(sozlesme_bitis_tarihi);
  const diffDays = Math.ceil((bitis.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: "SÖZ. DOLDU", color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)" };
  if (diffDays <= hatirlatma) return { label: `${diffDays} gün`, color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" };
  return null;
}

function formatTelefon(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  if (digits.length <= 11) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
}

function telefonValid(t: string) {
  const digits = t.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("0");
}

const INPUT: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1px solid var(--c-border)", background: "var(--c-input)",
  color: "var(--c-text)", fontSize: 13, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
};

const LABEL: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 600, color: "var(--c-dim)",
  marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em",
};

const CARD: React.CSSProperties = {
  background: "var(--c-surface)", border: "1px solid var(--c-border)",
  borderRadius: 14, padding: "20px 24px",
};

type ModalState = { open: false } | { open: true; editing: Musteri | null };

const EMPTY_FORM = {
  ad: "", sektor: "", website: "", email: "", telefon: "",
  sorumlu: "", durum: "aktif", aylik_ucret: "", baslangic_tarihi: "", notlar: "",
  platformlar: [] as string[],
  sozlesme_bitis_tarihi: "", yenileme_hatirlatma_gun: "30",
};

function validate(form: typeof EMPTY_FORM) {
  if (!form.ad.trim()) return "Müşteri adı zorunludur.";
  if (!form.sektor.trim()) return "Sektör zorunludur.";
  if (!form.sorumlu.trim()) return "Sorumlu kişi zorunludur.";
  if (!form.telefon.trim()) return "Telefon zorunludur.";
  if (!telefonValid(form.telefon)) return "Telefon formatı geçersiz. Örnek: 0555 555 5555";
  if (!form.aylik_ucret || parseFloat(form.aylik_ucret) <= 0) return "Aylık ücret girilmelidir.";
  if (!form.baslangic_tarihi) return "Başlangıç tarihi zorunludur.";
  return null;
}

const Icons = {
  users: (
    <svg viewBox="0 0 20 20" fill="none" style={{ width: 20, height: 20 }}>
      <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M1 17c0-3.314 2.686-6 6-6M13 17c0-3.314-2.686-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="15" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M19 17c0-2.761-1.79-5-4-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 20 20" fill="none" style={{ width: 20, height: 20 }}>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 20 20" fill="none" style={{ width: 20, height: 20 }}>
      <path d="M10 2l2.09 4.26L17 7.27l-3.5 3.41.83 4.82L10 13.27l-4.33 2.23.83-4.82L3 7.27l4.91-.71L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  money: (
    <svg viewBox="0 0 20 20" fill="none" style={{ width: 20, height: 20 }}>
      <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="10" cy="10.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 5V4M14 5V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

export function MusterilerClient({ musteriler }: { musteriler: Musteri[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<Musteri | null>(null);
  const [search, setSearch] = useState("");
  const [durumFilter, setDurumFilter] = useState("all");
  const [form, setForm] = useState(EMPTY_FORM);
  const [isPending, setIsPending] = useState(false);
  const [formError, setFormError] = useState("");

  const stats = useMemo(() => {
    const aktif = musteriler.filter((m) => m.durum === "aktif");
    const pot   = musteriler.filter((m) => m.durum === "potansiyel");
    return {
      toplam:     musteriler.length,
      aktif:      aktif.length,
      potansiyel: pot.length,
      gelir:      aktif.reduce((s, m) => s + (m.aylik_ucret || 0), 0),
    };
  }, [musteriler]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return musteriler
      .filter((m) => durumFilter === "all" || m.durum === durumFilter)
      .filter((m) =>
        m.ad.toLowerCase().includes(q) ||
        m.sektor.toLowerCase().includes(q) ||
        (m.sorumlu || "").toLowerCase().includes(q) ||
        (m.telefon || "").includes(q)
      );
  }, [musteriler, search, durumFilter]);

  function openAdd() { setForm(EMPTY_FORM); setFormError(""); setModal({ open: true, editing: null }); }

  function openEdit(m: Musteri) {
    setForm({
      ad: m.ad, sektor: m.sektor, website: m.website || "",
      email: m.email || "", telefon: m.telefon || "",
      sorumlu: m.sorumlu || "", durum: m.durum,
      aylik_ucret: m.aylik_ucret ? String(m.aylik_ucret) : "",
      baslangic_tarihi: m.baslangic_tarihi || "", notlar: m.notlar || "",
      platformlar: m.platformlar || [],
      sozlesme_bitis_tarihi: m.sozlesme_bitis_tarihi || "",
      yenileme_hatirlatma_gun: m.yenileme_hatirlatma_gun ? String(m.yenileme_hatirlatma_gun) : "30",
    });
    setFormError("");
    setModal({ open: true, editing: m });
  }

  function togglePlatform(key: string) {
    setForm((f) => ({
      ...f,
      platformlar: f.platformlar.includes(key)
        ? f.platformlar.filter((p) => p !== key)
        : [...f.platformlar, key],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate(form);
    if (err) { setFormError(err); return; }

    const data = {
      ad: form.ad.trim(), sektor: form.sektor.trim(),
      website: form.website.trim(), email: form.email.trim(),
      telefon: form.telefon.trim(), sorumlu: form.sorumlu.trim(),
      durum: form.durum, platformlar: form.platformlar,
      aylik_ucret: parseFloat(form.aylik_ucret) || 0,
      baslangic_tarihi: form.baslangic_tarihi || null,
      notlar: form.notlar.trim(),
      sozlesme_bitis_tarihi: form.sozlesme_bitis_tarihi || null,
      yenileme_hatirlatma_gun: parseInt(form.yenileme_hatirlatma_gun) || 30,
    };

    setFormError("");
    setIsPending(true);
    const result = modal.open && modal.editing
      ? await updateMusteri(modal.editing.id, data)
      : await addMusteri(data);
    setIsPending(false);
    if (result.error) { setFormError(result.error); }
    else { setModal({ open: false }); router.refresh(); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsPending(true);
    const result = await deleteMusteri(deleteTarget.id);
    setIsPending(false);
    if (!result.error) { setDeleteTarget(null); router.refresh(); }
  }

  const statCards = [
    {
      label: "Toplam Müşteri", value: stats.toplam,
      icon: Icons.users, color: "#a78bfa",
      border: "rgba(167,139,250,0.3)", gradient: "linear-gradient(135deg, rgba(167,139,250,0.18) 0%, rgba(139,92,246,0.06) 100%)",
      bg: "rgba(167,139,250,0.12)",
    },
    {
      label: "Aktif Müşteri", value: stats.aktif,
      icon: Icons.check, color: "#34d399",
      border: "rgba(52,211,153,0.3)", gradient: "linear-gradient(135deg, rgba(52,211,153,0.18) 0%, rgba(16,185,129,0.06) 100%)",
      bg: "rgba(52,211,153,0.12)",
    },
    {
      label: "Potansiyel", value: stats.potansiyel,
      icon: Icons.star, color: "#fbbf24",
      border: "rgba(251,191,36,0.3)", gradient: "linear-gradient(135deg, rgba(251,191,36,0.18) 0%, rgba(245,158,11,0.06) 100%)",
      bg: "rgba(251,191,36,0.12)",
    },
    {
      label: "Aylık Gelir", value: `₺${fmt(stats.gelir)}`,
      icon: Icons.money, color: "#60a5fa",
      border: "rgba(96,165,250,0.3)", gradient: "linear-gradient(135deg, rgba(96,165,250,0.18) 0%, rgba(59,130,246,0.06) 100%)",
      bg: "rgba(96,165,250,0.12)",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Başlık ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--c-text)", letterSpacing: "-0.03em" }}>
            Müşteriler
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--c-dim)" }}>
            {musteriler.length} kayıt · CRM
          </p>
        </div>
        <button onClick={openAdd} style={{
          padding: "10px 20px", borderRadius: 9, background: "#ef4444", color: "#fff",
          border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 7,
          boxShadow: "0 4px 14px rgba(239,68,68,0.35)",
        }}>
          <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14 }}>
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Yeni Müşteri
        </button>
      </div>

      {/* ── Stat Kartları ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {statCards.map((s) => (
          <div key={s.label} style={{
            padding: 20, borderRadius: 14, display: "flex", flexDirection: "column", gap: 14,
            border: `1px solid ${s.border}`, background: s.gradient,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: -20, right: -20, width: 80, height: 80,
              borderRadius: "50%", background: s.color, opacity: 0.1,
              filter: "blur(20px)", pointerEvents: "none",
            }} />
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: s.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: s.color, border: `1px solid ${s.border}`,
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{
                fontSize: 30, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1,
                color: s.color, fontVariantNumeric: "tabular-nums",
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 5, fontWeight: 500 }}>
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filtre Çubuğu ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
          <svg viewBox="0 0 16 16" fill="none" style={{
            width: 13, height: 13, position: "absolute", left: 11, top: "50%",
            transform: "translateY(-50%)", color: "var(--c-dim)", pointerEvents: "none",
          }}>
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text" placeholder="Ad, sektör, sorumlu veya telefon..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...INPUT, paddingLeft: 33 }}
          />
        </div>
        <div style={{ display: "flex", gap: 4, background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 8, padding: 3 }}>
          {[
            { key: "all", label: "Tümü" },
            { key: "aktif", label: "Aktif" },
            { key: "potansiyel", label: "Potansiyel" },
            { key: "pasif", label: "Pasif" },
          ].map((f) => (
            <button key={f.key} onClick={() => setDurumFilter(f.key)} style={{
              padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer",
              background: durumFilter === f.key ? "var(--c-border2)" : "transparent",
              color: durumFilter === f.key ? "var(--c-text)" : "var(--c-dim)",
              fontSize: 12, fontWeight: 500,
            }}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "var(--c-dim)", marginLeft: "auto" }}>
          {filtered.length} sonuç
        </div>
      </div>

      {/* ── Tablo ── */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "72px 0", color: "var(--c-dim)", fontSize: 14,
          background: "var(--c-surface)", borderRadius: 14, border: "1px solid var(--c-border)",
        }}>
          {musteriler.length === 0 ? "Henüz müşteri eklenmedi." : "Arama kriterlerine uyan müşteri bulunamadı."}
        </div>
      ) : (
        <div style={{ ...CARD, padding: 0, overflow: "hidden" }}>
          {/* Başlık satırı */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 90px 150px 130px 120px 110px 84px",
            padding: "11px 20px",
            borderBottom: "1px solid var(--c-border)",
            background: "var(--c-surface2)",
          }}>
            {["Müşteri / Sektör", "Durum", "Platformlar", "Aylık Ücret", "Sorumlu", "Başlangıç", ""].map((h) => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {h}
              </div>
            ))}
          </div>

          {filtered.map((m, i) => (
            <div key={m.id} style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 90px 150px 130px 120px 110px 84px",
              padding: "13px 20px",
              borderBottom: i < filtered.length - 1 ? "1px solid var(--c-border)" : "none",
              alignItems: "center",
              transition: "background 0.1s",
            }}>
              {/* Müşteri */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0,
                }}>
                  {m.ad[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <a href={`/yonetim/musteriler/${m.id}`} style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)", textDecoration: "none" }}>
                      {m.ad}
                    </a>
                    {(() => {
                      const tag = getSozlesmeTag(m.sozlesme_bitis_tarihi, m.yenileme_hatirlatma_gun ?? 30);
                      if (!tag) return null;
                      return (
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4,
                          color: tag.color, background: tag.bg, border: `1px solid ${tag.border}`,
                          whiteSpace: "nowrap",
                        }}>
                          {tag.label}
                        </span>
                      );
                    })()}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 1 }}>{m.sektor}</div>
                </div>
              </div>
              {/* Durum */}
              <div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
                  color: DURUM[m.durum]?.color, background: DURUM[m.durum]?.bg,
                  border: `1px solid ${DURUM[m.durum]?.border}`,
                }}>
                  {DURUM[m.durum]?.label ?? m.durum}
                </span>
              </div>
              {/* Platformlar */}
              <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                {(m.platformlar || []).slice(0, 3).map((p) => (
                  <span key={p} style={{
                    fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                    color: PLATFORM_COLORS[p] ?? "var(--c-text3)",
                    background: "var(--c-surface2)", border: "1px solid var(--c-border)",
                    textTransform: "capitalize",
                  }}>
                    {p === "google" ? "GDN" : p === "twitter" ? "X" : p.charAt(0).toUpperCase() + p.slice(1)}
                  </span>
                ))}
                {(m.platformlar || []).length > 3 && (
                  <span style={{ fontSize: 9, color: "var(--c-dim)", alignSelf: "center" }}>
                    +{m.platformlar.length - 3}
                  </span>
                )}
              </div>
              {/* Aylık Ücret */}
              <div style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}>
                {m.aylik_ucret ? `₺${fmt(m.aylik_ucret)}` : "—"}
              </div>
              {/* Sorumlu */}
              <div style={{ fontSize: 12, color: "var(--c-text3)" }}>{m.sorumlu || "—"}</div>
              {/* Başlangıç */}
              <div style={{ fontSize: 12, color: "var(--c-dim)" }}>{fmtDate(m.baslangic_tarihi)}</div>
              {/* İşlemler */}
              <div style={{ display: "flex", gap: 5 }}>
                <button onClick={() => openEdit(m)} title="Düzenle" style={{
                  padding: "5px 7px", borderRadius: 6, background: "transparent",
                  border: "1px solid var(--c-border)", color: "var(--c-text3)", cursor: "pointer",
                  display: "flex", alignItems: "center",
                }}>
                  <svg viewBox="0 0 14 14" fill="none" style={{ width: 12, height: 12 }}>
                    <path d="M10 2l2 2L4 12H2v-2L10 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  </svg>
                </button>
                <a href={`/yonetim/musteriler/${m.id}`} title="Detay" style={{
                  padding: "5px 7px", borderRadius: 6, background: "transparent",
                  border: "1px solid var(--c-border)", color: "var(--c-text3)",
                  display: "flex", alignItems: "center", textDecoration: "none",
                }}>
                  <svg viewBox="0 0 14 14" fill="none" style={{ width: 12, height: 12 }}>
                    <path d="M1 7s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.3"/>
                    <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                </a>
                <button onClick={() => setDeleteTarget(m)} title="Sil" style={{
                  padding: "5px 7px", borderRadius: 6, background: "transparent",
                  border: "1px solid rgba(248,113,113,0.25)", color: "#f87171", cursor: "pointer",
                  display: "flex", alignItems: "center",
                }}>
                  <svg viewBox="0 0 14 14" fill="none" style={{ width: 12, height: 12 }}>
                    <path d="M2 4h10M5 4V2h4v2M6 7v4M8 7v4M3 4l1 8h6l1-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Ekle/Düzenle Modal ── */}
      {modal.open && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)",
          backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 50, padding: 20,
        }}>
          <div style={{
            background: "var(--c-surface)", border: "1px solid var(--c-border)",
            borderRadius: 16, padding: 28, width: "100%", maxWidth: 660,
            maxHeight: "92vh", overflowY: "auto",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--c-text)" }}>
                  {modal.editing ? "Müşteri Düzenle" : "Yeni Müşteri Ekle"}
                </h2>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--c-dim)" }}>
                  * ile işaretli alanlar zorunludur
                </p>
              </div>
              <button onClick={() => setModal({ open: false })} style={{
                background: "none", border: "none", color: "var(--c-dim)", cursor: "pointer", padding: 4,
              }}>
                <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16 }}>
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={LABEL}>Müşteri Adı *</label>
                  <input style={INPUT} value={form.ad} onChange={(e) => setForm((f) => ({ ...f, ad: e.target.value }))} placeholder="Şirket adı" />
                </div>
                <div>
                  <label style={LABEL}>Sektör *</label>
                  <input style={INPUT} value={form.sektor} onChange={(e) => setForm((f) => ({ ...f, sektor: e.target.value }))} placeholder="ör. E-ticaret, Sağlık" />
                </div>
                <div>
                  <label style={LABEL}>Telefon * <span style={{ fontWeight: 400, textTransform: "none" }}>(0555 555 5555)</span></label>
                  <input
                    style={INPUT}
                    value={form.telefon}
                    onChange={(e) => setForm((f) => ({ ...f, telefon: formatTelefon(e.target.value) }))}
                    placeholder="0555 555 5555"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label style={LABEL}>Sorumlu *</label>
                  <input style={INPUT} value={form.sorumlu} onChange={(e) => setForm((f) => ({ ...f, sorumlu: e.target.value }))} placeholder="Hesap yöneticisi" />
                </div>
                <div>
                  <label style={LABEL}>Aylık Yönetim Ücreti (₺) *</label>
                  <input type="number" style={INPUT} value={form.aylik_ucret} onChange={(e) => setForm((f) => ({ ...f, aylik_ucret: e.target.value }))} placeholder="0" min="0" />
                </div>
                <div>
                  <label style={LABEL}>Başlangıç Tarihi *</label>
                  <DatePicker
                    value={form.baslangic_tarihi}
                    onChange={(v) => setForm((f) => ({ ...f, baslangic_tarihi: v }))}
                    placeholder="Gün Ay Yıl seçin"
                    required
                  />
                </div>
                <div>
                  <label style={LABEL}>E-posta</label>
                  <input type="email" style={INPUT} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="info@sirket.com" />
                </div>
                <div>
                  <label style={LABEL}>Durum</label>
                  <select style={INPUT} value={form.durum} onChange={(e) => setForm((f) => ({ ...f, durum: e.target.value }))}>
                    <option value="aktif">Aktif</option>
                    <option value="potansiyel">Potansiyel</option>
                    <option value="pasif">Pasif</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={LABEL}>Website</label>
                <input style={INPUT} value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} placeholder="https://sirket.com" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={LABEL}>Sözleşme Bitiş Tarihi</label>
                  <DatePicker
                    value={form.sozlesme_bitis_tarihi}
                    onChange={(v) => setForm((f) => ({ ...f, sozlesme_bitis_tarihi: v }))}
                    placeholder="Gün Ay Yıl seçin"
                  />
                </div>
                <div>
                  <label style={LABEL}>Yenileme Hatırlatması (gün)</label>
                  <input
                    type="number" style={INPUT} value={form.yenileme_hatirlatma_gun}
                    onChange={(e) => setForm((f) => ({ ...f, yenileme_hatirlatma_gun: e.target.value }))}
                    min="1" placeholder="30"
                  />
                </div>
              </div>

              <div>
                <label style={LABEL}>Platformlar</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 4 }}>
                  {PLATFORMS.map((p) => {
                    const active = form.platformlar.includes(p.key);
                    return (
                      <button key={p.key} type="button" onClick={() => togglePlatform(p.key)} style={{
                        padding: "5px 13px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer",
                        border: `1px solid ${active ? PLATFORM_COLORS[p.key] : "var(--c-border)"}`,
                        background: active ? `${PLATFORM_COLORS[p.key]}1a` : "transparent",
                        color: active ? PLATFORM_COLORS[p.key] : "var(--c-dim)",
                      }}>
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={LABEL}>Notlar</label>
                <textarea
                  style={{ ...INPUT, height: 72, resize: "vertical" }}
                  value={form.notlar}
                  onChange={(e) => setForm((f) => ({ ...f, notlar: e.target.value }))}
                  placeholder="Müşteriyle ilgili notlar..."
                />
              </div>

              {formError && (
                <div style={{
                  fontSize: 12, color: "#f87171", background: "rgba(248,113,113,0.08)",
                  padding: "10px 14px", borderRadius: 9, border: "1px solid rgba(248,113,113,0.2)",
                }}>
                  {formError}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setModal({ open: false })} style={{
                  padding: "9px 20px", borderRadius: 8, background: "transparent",
                  border: "1px solid var(--c-border)", color: "var(--c-text2)",
                  fontSize: 13, fontWeight: 500, cursor: "pointer",
                }}>
                  İptal
                </button>
                <button type="submit" disabled={isPending} style={{
                  padding: "9px 20px", borderRadius: 8, background: "#ef4444",
                  border: "none", color: "#fff", fontSize: 13, fontWeight: 600,
                  cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1,
                  boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
                }}>
                  {isPending ? "Kaydediliyor..." : modal.editing ? "Güncelle" : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Sil Onayı ── */}
      {deleteTarget && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)",
          backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 50,
        }}>
          <div style={{
            background: "var(--c-surface)", border: "1px solid var(--c-border)",
            borderRadius: 16, padding: 28, width: "100%", maxWidth: 380,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--c-text)", marginBottom: 10 }}>
              Müşteriyi Sil
            </div>
            <p style={{ fontSize: 13, color: "var(--c-text2)", margin: "0 0 22px", lineHeight: 1.6 }}>
              <strong>{deleteTarget.ad}</strong> müşterisini ve tüm aylık metriklerini kalıcı olarak silmek istediğinizden emin misiniz?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setDeleteTarget(null)} style={{
                padding: "8px 18px", borderRadius: 8, background: "transparent",
                border: "1px solid var(--c-border)", color: "var(--c-text2)",
                fontSize: 13, fontWeight: 500, cursor: "pointer",
              }}>
                İptal
              </button>
              <button onClick={handleDelete} disabled={isPending} style={{
                padding: "8px 18px", borderRadius: 8, background: "#ef4444",
                border: "none", color: "#fff", fontSize: 13, fontWeight: 600,
                cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1,
              }}>
                {isPending ? "Siliniyor..." : "Evet, Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
