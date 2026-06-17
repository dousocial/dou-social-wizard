"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { addMusteri, updateMusteri, deleteMusteri } from "@/lib/actions/musteriler";

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
};

const DURUM: Record<string, { label: string; color: string; bg: string }> = {
  aktif:      { label: "Aktif",      color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  pasif:      { label: "Pasif",      color: "#64748b", bg: "rgba(100,116,139,0.12)" },
  potansiyel: { label: "Potansiyel", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
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
  instagram: "#e1306c",
  facebook:  "#1877f2",
  google:    "#4285f4",
  linkedin:  "#0a66c2",
  tiktok:    "#010101",
  youtube:   "#ff0000",
  twitter:   "#1da1f2",
};

function fmt(n: number) {
  return new Intl.NumberFormat("tr-TR").format(n);
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR", { year: "numeric", month: "short" });
}

const INPUT: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid var(--c-border)",
  background: "var(--c-input)",
  color: "var(--c-text)",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const LABEL: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: "var(--c-dim)",
  marginBottom: 5,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

type ModalState = { open: false } | { open: true; editing: Musteri | null };

const EMPTY_FORM = {
  ad: "", sektor: "", website: "", email: "", telefon: "",
  sorumlu: "", durum: "aktif", aylik_ucret: "", baslangic_tarihi: "", notlar: "",
  platformlar: [] as string[],
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
    return {
      toplam: musteriler.length,
      aktif: aktif.length,
      potansiyel: musteriler.filter((m) => m.durum === "potansiyel").length,
      gelir: aktif.reduce((s, m) => s + (m.aylik_ucret || 0), 0),
    };
  }, [musteriler]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return musteriler
      .filter((m) => durumFilter === "all" || m.durum === durumFilter)
      .filter(
        (m) =>
          m.ad.toLowerCase().includes(q) ||
          m.sektor.toLowerCase().includes(q) ||
          (m.sorumlu || "").toLowerCase().includes(q)
      );
  }, [musteriler, search, durumFilter]);

  function openAdd() {
    setForm(EMPTY_FORM);
    setFormError("");
    setModal({ open: true, editing: null });
  }

  function openEdit(m: Musteri) {
    setForm({
      ad: m.ad,
      sektor: m.sektor,
      website: m.website || "",
      email: m.email || "",
      telefon: m.telefon || "",
      sorumlu: m.sorumlu || "",
      durum: m.durum,
      aylik_ucret: m.aylik_ucret ? String(m.aylik_ucret) : "",
      baslangic_tarihi: m.baslangic_tarihi || "",
      notlar: m.notlar || "",
      platformlar: m.platformlar || [],
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
    if (!form.ad.trim()) { setFormError("Müşteri adı zorunludur."); return; }
    if (!form.sektor.trim()) { setFormError("Sektör zorunludur."); return; }

    const data = {
      ad: form.ad.trim(),
      sektor: form.sektor.trim(),
      website: form.website.trim(),
      email: form.email.trim(),
      telefon: form.telefon.trim(),
      sorumlu: form.sorumlu.trim(),
      durum: form.durum,
      platformlar: form.platformlar,
      aylik_ucret: parseFloat(form.aylik_ucret) || 0,
      baslangic_tarihi: form.baslangic_tarihi || null,
      notlar: form.notlar.trim(),
    };

    setFormError("");
    setIsPending(true);
    try {
      if (modal.open && modal.editing) {
        await updateMusteri(modal.editing.id, data);
      } else {
        await addMusteri(data);
      }
      setModal({ open: false });
      router.refresh();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsPending(true);
    try {
      await deleteMusteri(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div>
      {/* ── Başlık ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "var(--c-text)" }}>Müşteriler</h1>
          <p style={{ margin: 0, fontSize: 12, color: "var(--c-dim)" }}>{musteriler.length} kayıt</p>
        </div>
        <button onClick={openAdd} style={{
          padding: "9px 18px", borderRadius: 8, background: "#ef4444", color: "#fff",
          border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14 }}>
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Yeni Müşteri
        </button>
      </div>

      {/* ── Stat Kartları ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Toplam Müşteri", value: stats.toplam, color: "#6366f1" },
          { label: "Aktif", value: stats.aktif, color: "#10b981" },
          { label: "Potansiyel", value: stats.potansiyel, color: "#f59e0b" },
          { label: "Aylık Gelir", value: `₺${fmt(stats.gelir)}`, color: "#3b82f6" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "var(--c-surface)", border: "1px solid var(--c-border)",
            borderRadius: 12, padding: "18px 20px",
          }}>
            <div style={{ fontSize: 11, color: "var(--c-dim)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Filtre Çubuğu ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
          <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--c-dim)" }}>
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...INPUT, paddingLeft: 32 }}
          />
        </div>
        <div style={{ display: "flex", gap: 4, background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 8, padding: 3 }}>
          {[
            { key: "all", label: "Tümü" },
            { key: "aktif", label: "Aktif" },
            { key: "pasif", label: "Pasif" },
            { key: "potansiyel", label: "Potansiyel" },
          ].map((f) => (
            <button key={f.key} onClick={() => setDurumFilter(f.key)} style={{
              padding: "5px 12px", borderRadius: 6, border: "none",
              background: durumFilter === f.key ? "var(--c-border2)" : "transparent",
              color: durumFilter === f.key ? "var(--c-text)" : "var(--c-dim)",
              fontSize: 12, fontWeight: 500, cursor: "pointer",
            }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tablo ── */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "72px 0", color: "var(--c-dim)", fontSize: 14,
          background: "var(--c-surface2)", borderRadius: 10, border: "1px solid var(--c-border)",
        }}>
          {musteriler.length === 0 ? "Henüz müşteri eklenmedi." : "Arama kriterlerine uyan müşteri bulunamadı."}
        </div>
      ) : (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, overflow: "hidden" }}>
          {/* Tablo başlığı */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 100px 160px 120px 110px 100px 88px",
            padding: "10px 16px",
            borderBottom: "1px solid var(--c-border)",
            background: "var(--c-surface2)",
          }}>
            {["Müşteri", "Durum", "Platformlar", "Aylık Ücret", "Sorumlu", "Başlangıç", ""].map((h) => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {h}
              </div>
            ))}
          </div>

          {filtered.map((m) => (
            <div key={m.id} style={{
              display: "grid",
              gridTemplateColumns: "1fr 100px 160px 120px 110px 100px 88px",
              padding: "12px 16px",
              borderBottom: "1px solid var(--c-border)",
              alignItems: "center",
            }}>
              {/* Müşteri */}
              <div>
                <a href={`/yonetim/musteriler/${m.id}`} style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)", textDecoration: "none" }}>
                  {m.ad}
                </a>
                <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 2 }}>{m.sektor}</div>
              </div>
              {/* Durum */}
              <div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
                  color: DURUM[m.durum]?.color ?? "#64748b",
                  background: DURUM[m.durum]?.bg ?? "rgba(100,116,139,0.12)",
                }}>
                  {DURUM[m.durum]?.label ?? m.durum}
                </span>
              </div>
              {/* Platformlar */}
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {(m.platformlar || []).slice(0, 4).map((p) => (
                  <span key={p} style={{
                    fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 5,
                    color: PLATFORM_COLORS[p] ?? "var(--c-text3)",
                    background: "var(--c-surface2)",
                    border: "1px solid var(--c-border)",
                    textTransform: "capitalize",
                  }}>
                    {p}
                  </span>
                ))}
                {(m.platformlar || []).length > 4 && (
                  <span style={{ fontSize: 10, color: "var(--c-dim)" }}>+{m.platformlar.length - 4}</span>
                )}
              </div>
              {/* Aylık Ücret */}
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text2)" }}>
                {m.aylik_ucret ? `₺${fmt(m.aylik_ucret)}` : "—"}
              </div>
              {/* Sorumlu */}
              <div style={{ fontSize: 12, color: "var(--c-text3)" }}>{m.sorumlu || "—"}</div>
              {/* Başlangıç */}
              <div style={{ fontSize: 12, color: "var(--c-dim)" }}>{fmtDate(m.baslangic_tarihi)}</div>
              {/* İşlemler */}
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => openEdit(m)}
                  title="Düzenle"
                  style={{
                    padding: "5px 8px", borderRadius: 6, background: "transparent",
                    border: "1px solid var(--c-border)", color: "var(--c-text3)",
                    cursor: "pointer", display: "flex", alignItems: "center",
                  }}
                >
                  <svg viewBox="0 0 16 16" fill="none" style={{ width: 13, height: 13 }}>
                    <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                  </svg>
                </button>
                <a href={`/yonetim/musteriler/${m.id}`} title="Detay" style={{
                  padding: "5px 8px", borderRadius: 6, background: "transparent",
                  border: "1px solid var(--c-border)", color: "var(--c-text3)",
                  display: "flex", alignItems: "center", textDecoration: "none",
                }}>
                  <svg viewBox="0 0 16 16" fill="none" style={{ width: 13, height: 13 }}>
                    <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.4"/>
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/>
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Ekle/Düzenle Modal ── */}
      {modal.open && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 50, padding: 20,
        }}>
          <div style={{
            background: "var(--c-surface)", border: "1px solid var(--c-border)",
            borderRadius: 14, padding: 28, width: "100%", maxWidth: 640,
            maxHeight: "90vh", overflowY: "auto",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--c-text)" }}>
                {modal.editing ? "Müşteri Düzenle" : "Yeni Müşteri"}
              </h2>
              <button onClick={() => setModal({ open: false })} style={{
                background: "none", border: "none", color: "var(--c-dim)", cursor: "pointer",
                padding: 4, display: "flex", alignItems: "center",
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
                  <label style={LABEL}>Durum</label>
                  <select style={INPUT} value={form.durum} onChange={(e) => setForm((f) => ({ ...f, durum: e.target.value }))}>
                    <option value="aktif">Aktif</option>
                    <option value="potansiyel">Potansiyel</option>
                    <option value="pasif">Pasif</option>
                  </select>
                </div>
                <div>
                  <label style={LABEL}>Aylık Yönetim Ücreti (₺)</label>
                  <input type="number" style={INPUT} value={form.aylik_ucret} onChange={(e) => setForm((f) => ({ ...f, aylik_ucret: e.target.value }))} placeholder="0" min="0" />
                </div>
                <div>
                  <label style={LABEL}>Başlangıç Tarihi</label>
                  <input type="date" style={INPUT} value={form.baslangic_tarihi} onChange={(e) => setForm((f) => ({ ...f, baslangic_tarihi: e.target.value }))} />
                </div>
                <div>
                  <label style={LABEL}>Sorumlu</label>
                  <input style={INPUT} value={form.sorumlu} onChange={(e) => setForm((f) => ({ ...f, sorumlu: e.target.value }))} placeholder="Hesap yöneticisi" />
                </div>
                <div>
                  <label style={LABEL}>E-posta</label>
                  <input type="email" style={INPUT} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="info@sirket.com" />
                </div>
                <div>
                  <label style={LABEL}>Telefon</label>
                  <input type="tel" style={INPUT} value={form.telefon} onChange={(e) => setForm((f) => ({ ...f, telefon: e.target.value }))} placeholder="+90 5xx xxx xx xx" />
                </div>
              </div>

              <div>
                <label style={LABEL}>Website</label>
                <input style={INPUT} value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} placeholder="https://sirket.com" />
              </div>

              <div>
                <label style={LABEL}>Platformlar</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {PLATFORMS.map((p) => {
                    const active = form.platformlar.includes(p.key);
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => togglePlatform(p.key)}
                        style={{
                          padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 500,
                          cursor: "pointer", border: "1px solid",
                          borderColor: active ? PLATFORM_COLORS[p.key] : "var(--c-border)",
                          background: active ? `${PLATFORM_COLORS[p.key]}18` : "transparent",
                          color: active ? PLATFORM_COLORS[p.key] : "var(--c-dim)",
                        }}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={LABEL}>Notlar</label>
                <textarea
                  style={{ ...INPUT, height: 80, resize: "vertical" }}
                  value={form.notlar}
                  onChange={(e) => setForm((f) => ({ ...f, notlar: e.target.value }))}
                  placeholder="Müşteriyle ilgili notlar..."
                />
              </div>

              {formError && (
                <div style={{ fontSize: 12, color: "#f87171", background: "rgba(248,113,113,0.08)", padding: "8px 12px", borderRadius: 8 }}>
                  {formError}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setModal({ open: false })}
                  style={{
                    padding: "9px 18px", borderRadius: 8, background: "transparent",
                    border: "1px solid var(--c-border)", color: "var(--c-text2)",
                    fontSize: 13, fontWeight: 500, cursor: "pointer",
                  }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    padding: "9px 18px", borderRadius: 8, background: "#ef4444",
                    border: "none", color: "#fff", fontSize: 13, fontWeight: 600,
                    cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1,
                  }}
                >
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
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 50,
        }}>
          <div style={{
            background: "var(--c-surface)", border: "1px solid var(--c-border)",
            borderRadius: 14, padding: 28, width: "100%", maxWidth: 380,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--c-text)", marginBottom: 10 }}>Müşteriyi Sil</div>
            <p style={{ fontSize: 13, color: "var(--c-text2)", margin: "0 0 20px" }}>
              <strong>{deleteTarget.ad}</strong> müşterisini ve tüm metriklerini silmek istediğinizden emin misiniz?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  padding: "8px 16px", borderRadius: 8, background: "transparent",
                  border: "1px solid var(--c-border)", color: "var(--c-text2)",
                  fontSize: 13, fontWeight: 500, cursor: "pointer",
                }}
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                style={{
                  padding: "8px 16px", borderRadius: 8, background: "#ef4444",
                  border: "none", color: "#fff", fontSize: 13, fontWeight: 600,
                  cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1,
                }}
              >
                {isPending ? "Siliniyor..." : "Evet, Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
