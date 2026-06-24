"use client";

import { useState, useMemo } from "react";
import {
  addInfluencer,
  updateInfluencer,
  deleteInfluencer,
  addCollaboration,
  updateCollaboration,
  deleteCollaboration,
  type InfluencerInput,
  type CollaborationInput,
  type HesapEntry,
} from "@/lib/actions/crmInfluencers";

// ─── Types ────────────────────────────────────────────────────────────────────

type Influencer = {
  id: string;
  created_at: string;
  updated_at: string;
  ad: string;
  soyad: string;
  email: string;
  telefon: string;
  sehir: string;
  ulke: string;
  hesaplar: HesapEntry[];
  kategori: string;
  nis_etiketler: string[];
  durum: "havuz" | "aktif" | "kara_liste";
  kara_liste_nedeni: string;
  min_ucret: number;
  max_ucret: number;
  para_birimi: string;
  ajans_adi: string;
  temsilci_adi: string;
  temsilci_telefon: string;
  notlar: string;
  ic_notlar: string;
  sorumlu: string;
};

type Collaboration = {
  id: string;
  created_at: string;
  influencer_id: string;
  musteri_id: string | null;
  musteri_adi: string;
  kampanya_adi: string;
  icerik_tipi: string;
  platform: string;
  baslangic_tarihi: string | null;
  bitis_tarihi: string | null;
  durum: "planlandi" | "uretimde" | "yayinda" | "tamamlandi" | "iptal";
  anlasilan_ucret: number;
  odenen_ucret: number;
  para_birimi: string;
  erisim: number;
  izlenme: number;
  etkilesim: number;
  tiklama: number;
  donusum: number;
  icerik_url: string;
  brief_notlar: string;
  sonuc_notlar: string;
};

type Musteri = { id: string; ad: string };

// ─── Constants ────────────────────────────────────────────────────────────────

const DURUM_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
  havuz:       { label: "Havuz",       color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)" },
  aktif:       { label: "Aktif",       color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)" },
  kara_liste:  { label: "Kara Liste",  color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)" },
};

const COLLAB_STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
  planlandi:   { label: "Planlandı",   color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.3)" },
  uretimde:    { label: "Üretimde",    color: "#c084fc", bg: "rgba(192,132,252,0.12)", border: "rgba(192,132,252,0.3)" },
  yayinda:     { label: "Yayında",     color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)" },
  tamamlandi:  { label: "Tamamlandı",  color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)" },
  iptal:       { label: "İptal",       color: "#64748b", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.3)" },
};

const PLATFORMS = ["instagram", "youtube", "tiktok", "twitter", "linkedin", "diger"];
const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📸",
  youtube: "▶️",
  tiktok: "🎵",
  twitter: "𝕏",
  linkedin: "💼",
  diger: "🌐",
};
const KATEGORILER = [
  { value: "", label: "Seçin" },
  { value: "moda", label: "Moda" },
  { value: "yemek", label: "Yemek" },
  { value: "teknoloji", label: "Teknoloji" },
  { value: "spor", label: "Spor" },
  { value: "seyahat", label: "Seyahat" },
  { value: "guzellik", label: "Güzellik" },
  { value: "eglence", label: "Eğlence" },
  { value: "oyun", label: "Oyun" },
  { value: "saglik", label: "Sağlık" },
  { value: "egitim", label: "Eğitim" },
  { value: "diger", label: "Diğer" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

function fmtMoney(n: number, cur = "TRY") {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: cur,
    maximumFractionDigits: 0,
  }).format(n);
}

function totalFollowers(hesaplar: HesapEntry[]) {
  return hesaplar.reduce((s, h) => s + h.followers, 0);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ status, map }: { status: string; map: Record<string, { label: string; color: string; bg: string; border: string }> }) {
  const s = map[status] ?? { label: status, color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.3)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      color: s.color, background: s.bg,
      border: `1px solid ${s.border}`,
    }}>{s.label}</span>
  );
}

function Tag({ text }: { text: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 12,
      fontSize: 11, fontWeight: 500,
      color: "#94a3b8", background: "rgba(148,163,184,0.1)",
      border: "1px solid rgba(148,163,184,0.2)",
    }}>{text}</span>
  );
}

function PlatformChip({ hesap }: { hesap: HesapEntry }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 8,
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      fontSize: 12,
    }}>
      <span>{PLATFORM_ICONS[hesap.platform] || "🌐"}</span>
      <span style={{ color: "var(--c-text1)", fontWeight: 600 }}>@{hesap.handle}</span>
      <span style={{ color: "#60a5fa" }}>{fmt(hesap.followers)}</span>
      {hesap.engagement_rate > 0 && (
        <span style={{ color: "#34d399", fontSize: 10 }}>{hesap.engagement_rate.toFixed(1)}%</span>
      )}
    </div>
  );
}

// ─── Influencer Form Modal ────────────────────────────────────────────────────

function InfluencerFormModal({
  influencer,
  onClose,
  onSave,
}: {
  influencer: Influencer | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const isEdit = !!influencer;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<InfluencerInput>({
    ad: influencer?.ad ?? "",
    soyad: influencer?.soyad ?? "",
    email: influencer?.email ?? "",
    telefon: influencer?.telefon ?? "",
    sehir: influencer?.sehir ?? "",
    hesaplar: influencer?.hesaplar ?? [],
    kategori: influencer?.kategori ?? "",
    nis_etiketler: influencer?.nis_etiketler ?? [],
    durum: influencer?.durum ?? "havuz",
    kara_liste_nedeni: influencer?.kara_liste_nedeni ?? "",
    min_ucret: influencer?.min_ucret ?? 0,
    max_ucret: influencer?.max_ucret ?? 0,
    para_birimi: influencer?.para_birimi ?? "TRY",
    ajans_adi: influencer?.ajans_adi ?? "",
    temsilci_adi: influencer?.temsilci_adi ?? "",
    temsilci_telefon: influencer?.temsilci_telefon ?? "",
    notlar: influencer?.notlar ?? "",
    ic_notlar: influencer?.ic_notlar ?? "",
    sorumlu: influencer?.sorumlu ?? "",
  });

  // Hesap (sosyal medya) yönetimi
  const [newHesap, setNewHesap] = useState<HesapEntry>({
    platform: "instagram", handle: "", followers: 0, engagement_rate: 0,
  });
  const [nisInput, setNisInput] = useState("");

  function addHesap() {
    if (!newHesap.handle.trim()) return;
    setForm(f => ({ ...f, hesaplar: [...(f.hesaplar ?? []), { ...newHesap }] }));
    setNewHesap({ platform: "instagram", handle: "", followers: 0, engagement_rate: 0 });
  }

  function removeHesap(i: number) {
    setForm(f => ({ ...f, hesaplar: (f.hesaplar ?? []).filter((_, idx) => idx !== i) }));
  }

  function addNis() {
    const tag = nisInput.trim();
    if (!tag) return;
    setForm(f => ({ ...f, nis_etiketler: [...(f.nis_etiketler ?? []), tag] }));
    setNisInput("");
  }

  function removeNis(tag: string) {
    setForm(f => ({ ...f, nis_etiketler: (f.nis_etiketler ?? []).filter(t => t !== tag) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.ad?.trim()) { setError("Ad zorunludur."); return; }
    setLoading(true);
    setError("");
    const result = isEdit
      ? await updateInfluencer(influencer!.id, form)
      : await addInfluencer(form);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    onSave();
    onClose();
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
    color: "var(--c-text1)", fontSize: 13, outline: "none", boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: "var(--c-dim)", marginBottom: 4, display: "block" };
  const row: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "var(--c-card)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)",
        width: "100%", maxWidth: 720, maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 25px 80px rgba(0,0,0,0.6)",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0,
          background: "var(--c-card)", zIndex: 10,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{isEdit ? "İnfluencer Düzenle" : "Yeni İnfluencer Ekle"}</div>
            <div style={{ fontSize: 12, color: "var(--c-dim)", marginTop: 2 }}>
              Hesaplar, ücret aralığı ve ajans bilgilerini girin
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--c-dim)", fontSize: 22, cursor: "pointer" }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Kişisel Bilgiler */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Kişisel Bilgiler
            </div>
            <div style={row}>
              <div>
                <label style={lbl}>Ad *</label>
                <input style={inp} value={form.ad} onChange={e => setForm(f => ({ ...f, ad: e.target.value }))} placeholder="Ad" />
              </div>
              <div>
                <label style={lbl}>Soyad</label>
                <input style={inp} value={form.soyad} onChange={e => setForm(f => ({ ...f, soyad: e.target.value }))} placeholder="Soyad" />
              </div>
              <div>
                <label style={lbl}>E-posta</label>
                <input style={inp} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="ornek@mail.com" />
              </div>
              <div>
                <label style={lbl}>Telefon</label>
                <input style={inp} value={form.telefon} onChange={e => setForm(f => ({ ...f, telefon: e.target.value }))} placeholder="+90 5xx xxx xx xx" />
              </div>
              <div>
                <label style={lbl}>Şehir</label>
                <input style={inp} value={form.sehir} onChange={e => setForm(f => ({ ...f, sehir: e.target.value }))} placeholder="İstanbul" />
              </div>
              <div>
                <label style={lbl}>Durum</label>
                <select style={inp} value={form.durum} onChange={e => setForm(f => ({ ...f, durum: e.target.value as any }))}>
                  <option value="havuz">Havuz</option>
                  <option value="aktif">Aktif</option>
                  <option value="kara_liste">Kara Liste</option>
                </select>
              </div>
            </div>
            {form.durum === "kara_liste" && (
              <div style={{ marginTop: 12 }}>
                <label style={lbl}>Kara Liste Nedeni</label>
                <input style={inp} value={form.kara_liste_nedeni} onChange={e => setForm(f => ({ ...f, kara_liste_nedeni: e.target.value }))} placeholder="Nedeni açıklayın..." />
              </div>
            )}
          </div>

          {/* Sosyal Medya Hesapları */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#60a5fa", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Sosyal Medya Hesapları
            </div>
            {(form.hesaplar ?? []).length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                {(form.hesaplar ?? []).map((h, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 12px", borderRadius: 8,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  }}>
                    <span>{PLATFORM_ICONS[h.platform] || "🌐"}</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>@{h.handle}</span>
                    <span style={{ color: "#60a5fa", fontSize: 12 }}>{fmt(h.followers)} takipçi</span>
                    {h.engagement_rate > 0 && <span style={{ color: "#34d399", fontSize: 12 }}>{h.engagement_rate}% eng.</span>}
                    <button type="button" onClick={() => removeHesap(i)} style={{
                      marginLeft: "auto", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                      borderRadius: 6, color: "#ef4444", fontSize: 11, padding: "2px 8px", cursor: "pointer",
                    }}>Kaldır</button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 110px 100px auto", gap: 8, alignItems: "flex-end" }}>
              <div>
                <label style={lbl}>Platform</label>
                <select style={inp} value={newHesap.platform} onChange={e => setNewHesap(h => ({ ...h, platform: e.target.value as any }))}>
                  {PLATFORMS.map(p => <option key={p} value={p}>{PLATFORM_ICONS[p]} {p}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Kullanıcı Adı</label>
                <input style={inp} value={newHesap.handle} onChange={e => setNewHesap(h => ({ ...h, handle: e.target.value }))} placeholder="@kullanici" />
              </div>
              <div>
                <label style={lbl}>Takipçi</label>
                <input style={inp} type="number" value={newHesap.followers || ""} onChange={e => setNewHesap(h => ({ ...h, followers: +e.target.value }))} placeholder="50000" />
              </div>
              <div>
                <label style={lbl}>Etkileşim Oranı (%)</label>
                <input style={inp} type="number" step="0.1" value={newHesap.engagement_rate || ""} onChange={e => setNewHesap(h => ({ ...h, engagement_rate: +e.target.value }))} placeholder="3.5" />
              </div>
              <button type="button" onClick={addHesap} style={{
                padding: "9px 14px", borderRadius: 8, border: "1px solid rgba(96,165,250,0.4)",
                background: "rgba(96,165,250,0.12)", color: "#60a5fa", cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
              }}>+ Ekle</button>
            </div>
          </div>

          {/* Kategori & Niş */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Kategori & Niş
            </div>
            <div style={{ ...row, marginBottom: 12 }}>
              <div>
                <label style={lbl}>Ana Kategori</label>
                <select style={inp} value={form.kategori} onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))}>
                  {KATEGORILER.map(k => <option key={k.value} value={k.value} style={{ background: "#1a1a2e", color: "#e2e8f0" }}>{k.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={lbl}>Niş Etiketler</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input style={{ ...inp, flex: 1 }} value={nisInput} onChange={e => setNisInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addNis())}
                  placeholder="Örn: fitness, vegan, anne-bebek..." />
                <button type="button" onClick={addNis} style={{
                  padding: "9px 14px", borderRadius: 8, border: "1px solid rgba(245,158,11,0.4)",
                  background: "rgba(245,158,11,0.12)", color: "#f59e0b", cursor: "pointer", fontSize: 13, fontWeight: 600,
                }}>+ Ekle</button>
              </div>
              {(form.nis_etiketler ?? []).length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(form.nis_etiketler ?? []).map(t => (
                    <button key={t} type="button" onClick={() => removeNis(t)} style={{
                      display: "flex", alignItems: "center", gap: 4,
                      padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(245,158,11,0.3)",
                      background: "rgba(245,158,11,0.1)", color: "#f59e0b", cursor: "pointer", fontSize: 12, fontWeight: 500,
                    }}>{t} ×</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ücret */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#34d399", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Ücret Aralığı
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px", gap: 12 }}>
              <div>
                <label style={lbl}>Min. Ücret</label>
                <input style={inp} type="number" value={form.min_ucret || ""} onChange={e => setForm(f => ({ ...f, min_ucret: +e.target.value }))} placeholder="0" />
              </div>
              <div>
                <label style={lbl}>Max. Ücret</label>
                <input style={inp} type="number" value={form.max_ucret || ""} onChange={e => setForm(f => ({ ...f, max_ucret: +e.target.value }))} placeholder="0" />
              </div>
              <div>
                <label style={lbl}>Para Birimi</label>
                <select style={inp} value={form.para_birimi} onChange={e => setForm(f => ({ ...f, para_birimi: e.target.value }))}>
                  <option value="TRY">TRY ₺</option>
                  <option value="USD">USD $</option>
                  <option value="EUR">EUR €</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ajans */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#c084fc", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Ajans / Temsilci
            </div>
            <div style={row}>
              <div>
                <label style={lbl}>Ajans Adı</label>
                <input style={inp} value={form.ajans_adi} onChange={e => setForm(f => ({ ...f, ajans_adi: e.target.value }))} placeholder="Ajans adı" />
              </div>
              <div>
                <label style={lbl}>Temsilci Adı</label>
                <input style={inp} value={form.temsilci_adi} onChange={e => setForm(f => ({ ...f, temsilci_adi: e.target.value }))} placeholder="Temsilci adı" />
              </div>
              <div>
                <label style={lbl}>Temsilci Telefon</label>
                <input style={inp} value={form.temsilci_telefon} onChange={e => setForm(f => ({ ...f, temsilci_telefon: e.target.value }))} placeholder="+90..." />
              </div>
              <div>
                <label style={lbl}>Sorumlu</label>
                <input style={inp} value={form.sorumlu} onChange={e => setForm(f => ({ ...f, sorumlu: e.target.value }))} placeholder="Ekipten kişi adı" />
              </div>
            </div>
          </div>

          {/* Notlar */}
          <div style={row}>
            <div>
              <label style={lbl}>Notlar (Genel)</label>
              <textarea style={{ ...inp, minHeight: 80, resize: "vertical" }} value={form.notlar} onChange={e => setForm(f => ({ ...f, notlar: e.target.value }))} placeholder="Genel notlar..." />
            </div>
            <div>
              <label style={lbl}>İç Notlar (Gizli)</label>
              <textarea style={{ ...inp, minHeight: 80, resize: "vertical" }} value={form.ic_notlar} onChange={e => setForm(f => ({ ...f, ic_notlar: e.target.value }))} placeholder="Dahili notlar..." />
            </div>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8 }}>
            <button type="button" onClick={onClose} style={{
              padding: "10px 20px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)",
              background: "transparent", color: "var(--c-dim)", cursor: "pointer", fontSize: 13,
            }}>İptal</button>
            <button type="submit" disabled={loading} style={{
              padding: "10px 28px", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg, #a78bfa, #818cf8)",
              color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600,
              opacity: loading ? 0.6 : 1,
            }}>{loading ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Kaydet"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Collaboration Form Modal ─────────────────────────────────────────────────

function CollaborationModal({
  influencer,
  collab,
  musteriler,
  onClose,
  onSave,
}: {
  influencer: Influencer;
  collab: Collaboration | null;
  musteriler: Musteri[];
  onClose: () => void;
  onSave: () => void;
}) {
  const isEdit = !!collab;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<CollaborationInput>({
    influencer_id: influencer.id,
    musteri_id: collab?.musteri_id ?? null,
    musteri_adi: collab?.musteri_adi ?? "",
    kampanya_adi: collab?.kampanya_adi ?? "",
    icerik_tipi: collab?.icerik_tipi ?? "",
    platform: collab?.platform ?? "",
    baslangic_tarihi: collab?.baslangic_tarihi ?? null,
    bitis_tarihi: collab?.bitis_tarihi ?? null,
    durum: collab?.durum ?? "planlandi",
    anlasilan_ucret: collab?.anlasilan_ucret ?? 0,
    odenen_ucret: collab?.odenen_ucret ?? 0,
    para_birimi: collab?.para_birimi ?? "TRY",
    erisim: collab?.erisim ?? 0,
    izlenme: collab?.izlenme ?? 0,
    etkilesim: collab?.etkilesim ?? 0,
    tiklama: collab?.tiklama ?? 0,
    donusum: collab?.donusum ?? 0,
    icerik_url: collab?.icerik_url ?? "",
    brief_notlar: collab?.brief_notlar ?? "",
    sonuc_notlar: collab?.sonuc_notlar ?? "",
  });

  const inp: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
    color: "var(--c-text1)", fontSize: 13, outline: "none", boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: "var(--c-dim)", marginBottom: 4, display: "block" };
  const row2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.kampanya_adi?.trim()) { setError("Kampanya adı zorunludur."); return; }
    setLoading(true);
    setError("");
    const result = isEdit
      ? await updateCollaboration(collab!.id, form)
      : await addCollaboration(form);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    onSave();
    onClose();
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "var(--c-card)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)",
        width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 25px 80px rgba(0,0,0,0.6)",
      }}>
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0,
          background: "var(--c-card)", zIndex: 10,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{isEdit ? "İş Birliği Düzenle" : "Yeni İş Birliği"}</div>
            <div style={{ fontSize: 12, color: "var(--c-dim)", marginTop: 2 }}>{influencer.ad} {influencer.soyad}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--c-dim)", fontSize: 22, cursor: "pointer" }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={lbl}>Kampanya Adı *</label>
            <input style={inp} value={form.kampanya_adi} onChange={e => setForm(f => ({ ...f, kampanya_adi: e.target.value }))} placeholder="Kampanya adını girin" />
          </div>

          <div style={row2}>
            <div>
              <label style={lbl}>Müşteri (Opsiyonel)</label>
              <select style={inp} value={form.musteri_id ?? ""} onChange={e => {
                const val = e.target.value;
                const m = musteriler.find(m => m.id === val);
                setForm(f => ({ ...f, musteri_id: val || null, musteri_adi: m?.ad ?? f.musteri_adi }));
              }}>
                <option value="">— Seçilmedi —</option>
                {musteriler.map(m => <option key={m.id} value={m.id}>{m.ad}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Müşteri Adı (Manuel)</label>
              <input style={inp} value={form.musteri_adi} onChange={e => setForm(f => ({ ...f, musteri_adi: e.target.value }))} placeholder="Müşteri listesinde yoksa..." />
            </div>
            <div>
              <label style={lbl}>Platform</label>
              <select style={inp} value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
                <option value="">— Seçin —</option>
                {PLATFORMS.map(p => <option key={p} value={p}>{PLATFORM_ICONS[p]} {p}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>İçerik Tipi</label>
              <select style={inp} value={form.icerik_tipi} onChange={e => setForm(f => ({ ...f, icerik_tipi: e.target.value }))}>
                <option value="">— Seçin —</option>
                {["reels", "post", "story", "youtube", "tiktok", "podcast", "etkinlik", "diger"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Başlangıç Tarihi</label>
              <input style={inp} type="date" value={form.baslangic_tarihi ?? ""} onChange={e => setForm(f => ({ ...f, baslangic_tarihi: e.target.value || null }))} />
            </div>
            <div>
              <label style={lbl}>Bitiş Tarihi</label>
              <input style={inp} type="date" value={form.bitis_tarihi ?? ""} onChange={e => setForm(f => ({ ...f, bitis_tarihi: e.target.value || null }))} />
            </div>
            <div>
              <label style={lbl}>Durum</label>
              <select style={inp} value={form.durum} onChange={e => setForm(f => ({ ...f, durum: e.target.value as any }))}>
                <option value="planlandi">Planlandı</option>
                <option value="uretimde">Üretimde</option>
                <option value="yayinda">Yayında</option>
                <option value="tamamlandi">Tamamlandı</option>
                <option value="iptal">İptal</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px", gap: 12 }}>
            <div>
              <label style={lbl}>Anlaşılan Ücret</label>
              <input style={inp} type="number" value={form.anlasilan_ucret || ""} onChange={e => setForm(f => ({ ...f, anlasilan_ucret: +e.target.value }))} placeholder="0" />
            </div>
            <div>
              <label style={lbl}>Ödenen Ücret</label>
              <input style={inp} type="number" value={form.odenen_ucret || ""} onChange={e => setForm(f => ({ ...f, odenen_ucret: +e.target.value }))} placeholder="0" />
            </div>
            <div>
              <label style={lbl}>Para Birimi</label>
              <select style={inp} value={form.para_birimi} onChange={e => setForm(f => ({ ...f, para_birimi: e.target.value }))}>
                <option value="TRY">TRY ₺</option>
                <option value="USD">USD $</option>
                <option value="EUR">EUR €</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[
              { key: "erisim", label: "Erişim" },
              { key: "izlenme", label: "İzlenme" },
              { key: "etkilesim", label: "Etkileşim" },
              { key: "tiklama", label: "Tıklama" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label style={lbl}>{label}</label>
                <input style={inp} type="number" value={(form as any)[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: +e.target.value }))} placeholder="0" />
              </div>
            ))}
          </div>

          <div>
            <label style={lbl}>İçerik URL</label>
            <input style={inp} value={form.icerik_url} onChange={e => setForm(f => ({ ...f, icerik_url: e.target.value }))} placeholder="https://..." />
          </div>
          <div style={row2}>
            <div>
              <label style={lbl}>Brief Notları</label>
              <textarea style={{ ...inp, minHeight: 70, resize: "vertical" }} value={form.brief_notlar} onChange={e => setForm(f => ({ ...f, brief_notlar: e.target.value }))} placeholder="Kampanya briefingi..." />
            </div>
            <div>
              <label style={lbl}>Sonuç Notları</label>
              <textarea style={{ ...inp, minHeight: 70, resize: "vertical" }} value={form.sonuc_notlar} onChange={e => setForm(f => ({ ...f, sonuc_notlar: e.target.value }))} placeholder="Kampanya sonuçları ve yorumlar..." />
            </div>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{
              padding: "10px 20px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)",
              background: "transparent", color: "var(--c-dim)", cursor: "pointer", fontSize: 13,
            }}>İptal</button>
            <button type="submit" disabled={loading} style={{
              padding: "10px 28px", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg, #34d399, #10b981)",
              color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600,
              opacity: loading ? 0.6 : 1,
            }}>{loading ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Kaydet"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Influencer Detail Drawer ─────────────────────────────────────────────────

function InfluencerDrawer({
  influencer,
  collabs,
  musteriler,
  onClose,
  onEdit,
  onDelete,
  onAddCollab,
  onDeleteCollab,
  onEditCollab,
}: {
  influencer: Influencer;
  collabs: Collaboration[];
  musteriler: Musteri[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddCollab: () => void;
  onDeleteCollab: (id: string) => void;
  onEditCollab: (c: Collaboration) => void;
}) {
  const myCollabs = collabs.filter(c => c.influencer_id === influencer.id);
  const totalSpend = myCollabs.reduce((s, c) => s + c.odenen_ucret, 0);
  const totalReach = myCollabs.reduce((s, c) => s + c.erisim, 0);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
      display: "flex", justifyContent: "flex-end", zIndex: 900,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        width: "100%", maxWidth: 560, height: "100%", overflowY: "auto",
        background: "var(--c-card)", borderLeft: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <div style={{
          padding: "24px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "sticky", top: 0, background: "var(--c-card)", zIndex: 10,
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{influencer.ad} {influencer.soyad}</div>
            <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              <Badge status={influencer.durum} map={DURUM_MAP} />
              {influencer.kategori && <Tag text={influencer.kategori} />}
              {influencer.sehir && <span style={{ fontSize: 12, color: "var(--c-dim)" }}>📍 {influencer.sehir}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onEdit} style={{
              padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(167,139,250,0.4)",
              background: "rgba(167,139,250,0.1)", color: "#a78bfa", cursor: "pointer", fontSize: 13, fontWeight: 600,
            }}>Düzenle</button>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--c-dim)", fontSize: 22, cursor: "pointer" }}>×</button>
          </div>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Stats bento */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {[
              { label: "Toplam Takipçi", value: fmt(totalFollowers(influencer.hesaplar)), color: "#60a5fa" },
              { label: "İş Birliği", value: myCollabs.length, color: "#a78bfa" },
              { label: "Toplam Harcama", value: fmtMoney(totalSpend, influencer.para_birimi), color: "#34d399" },
            ].map(s => (
              <div key={s.label} style={{
                padding: "14px 16px", borderRadius: 12,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Hesaplar */}
          {influencer.hesaplar?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Sosyal Medya
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {influencer.hesaplar.map((h, i) => <PlatformChip key={i} hesap={h} />)}
              </div>
            </div>
          )}

          {/* İletişim */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {influencer.email && (
              <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize: 10, color: "var(--c-dim)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>E-posta</div>
                <div style={{ fontSize: 13, color: "var(--c-text1)" }}>{influencer.email}</div>
              </div>
            )}
            {influencer.telefon && (
              <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize: 10, color: "var(--c-dim)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Telefon</div>
                <div style={{ fontSize: 13, color: "var(--c-text1)" }}>{influencer.telefon}</div>
              </div>
            )}
            {influencer.min_ucret > 0 && (
              <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize: 10, color: "var(--c-dim)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Ücret Aralığı</div>
                <div style={{ fontSize: 13, color: "#34d399" }}>
                  {fmtMoney(influencer.min_ucret, influencer.para_birimi)} — {fmtMoney(influencer.max_ucret, influencer.para_birimi)}
                </div>
              </div>
            )}
            {influencer.ajans_adi && (
              <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize: 10, color: "var(--c-dim)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Ajans</div>
                <div style={{ fontSize: 13, color: "var(--c-text1)" }}>{influencer.ajans_adi}</div>
              </div>
            )}
          </div>

          {/* Niş etiketler */}
          {influencer.nis_etiketler?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Niş Etiketler
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {influencer.nis_etiketler.map(t => <Tag key={t} text={t} />)}
              </div>
            </div>
          )}

          {influencer.notlar && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Notlar</div>
              <div style={{ fontSize: 13, color: "var(--c-text2)", lineHeight: 1.6, padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                {influencer.notlar}
              </div>
            </div>
          )}

          {/* İş Birlikleri */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                İş Birlikleri ({myCollabs.length})
              </div>
              <button onClick={onAddCollab} style={{
                padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(52,211,153,0.4)",
                background: "rgba(52,211,153,0.1)", color: "#34d399", cursor: "pointer", fontSize: 12, fontWeight: 600,
              }}>+ Ekle</button>
            </div>
            {myCollabs.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--c-dim)", fontSize: 13,
                borderRadius: 10, border: "1px dashed rgba(255,255,255,0.1)" }}>
                Henüz iş birliği kaydı yok
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {myCollabs.map(c => (
                  <div key={c.id} style={{
                    padding: "14px 16px", borderRadius: 10,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{c.kampanya_adi}</div>
                        <div style={{ fontSize: 12, color: "var(--c-dim)", marginTop: 4, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                          {c.musteri_adi && <span>👤 {c.musteri_adi}</span>}
                          {c.platform && <span>{PLATFORM_ICONS[c.platform] || "🌐"} {c.platform}</span>}
                          {c.icerik_tipi && <span>📌 {c.icerik_tipi}</span>}
                          {c.baslangic_tarihi && <span>📅 {c.baslangic_tarihi}</span>}
                        </div>
                        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
                          <Badge status={c.durum} map={COLLAB_STATUS_MAP} />
                          {c.anlasilan_ucret > 0 && (
                            <span style={{ fontSize: 12, color: "#34d399", fontWeight: 600 }}>
                              {fmtMoney(c.anlasilan_ucret, c.para_birimi)}
                            </span>
                          )}
                          {c.erisim > 0 && <span style={{ fontSize: 11, color: "var(--c-dim)" }}>👁 {fmt(c.erisim)}</span>}
                          {c.etkilesim > 0 && <span style={{ fontSize: 11, color: "var(--c-dim)" }}>❤️ {fmt(c.etkilesim)}</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button onClick={() => onEditCollab(c)} style={{
                          padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(167,139,250,0.3)",
                          background: "rgba(167,139,250,0.1)", color: "#a78bfa", cursor: "pointer", fontSize: 11,
                        }}>Düzenle</button>
                        <button onClick={() => onDeleteCollab(c.id)} style={{
                          padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.3)",
                          background: "rgba(239,68,68,0.1)", color: "#ef4444", cursor: "pointer", fontSize: 11,
                        }}>Sil</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delete */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
            <button onClick={onDelete} style={{
              width: "100%", padding: "10px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)",
              background: "rgba(239,68,68,0.08)", color: "#ef4444", cursor: "pointer", fontSize: 13, fontWeight: 600,
            }}>İnfluencer'ı Sil</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export function InfluencersClient({
  initialInfluencers,
  initialCollaborations,
  musteriler,
}: {
  initialInfluencers: Influencer[];
  initialCollaborations: Collaboration[];
  musteriler: Musteri[];
}) {
  const [influencers, setInfluencers] = useState<Influencer[]>(initialInfluencers);
  const [collabs, setCollabs] = useState<Collaboration[]>(initialCollaborations);

  // Tabs
  const [tab, setTab] = useState<"hepsi" | "aktif" | "havuz" | "kara_liste">("hepsi");

  // Search & filter
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("");

  // Modals / drawers
  const [showForm, setShowForm] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState<Influencer | null>(null);
  const [drawerInfluencer, setDrawerInfluencer] = useState<Influencer | null>(null);
  const [showCollabForm, setShowCollabForm] = useState(false);
  const [editingCollab, setEditingCollab] = useState<Collaboration | null>(null);

  // Reload helper
  function reload() { window.location.reload(); }

  // Delete influencer
  async function handleDeleteInfluencer(id: string) {
    if (!confirm("Bu influencer ve tüm iş birlikleri silinecek. Onaylıyor musunuz?")) return;
    await deleteInfluencer(id);
    setDrawerInfluencer(null);
    reload();
  }

  // Delete collab
  async function handleDeleteCollab(id: string) {
    if (!confirm("Bu iş birliği silinecek. Onaylıyor musunuz?")) return;
    await deleteCollaboration(id);
    reload();
  }

  // Filtered list
  const filtered = useMemo(() => {
    let list = influencers;
    if (tab !== "hepsi") list = list.filter(i => i.durum === tab);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(i =>
        `${i.ad} ${i.soyad}`.toLowerCase().includes(s) ||
        i.email.toLowerCase().includes(s) ||
        i.kategori.toLowerCase().includes(s) ||
        i.nis_etiketler.some(t => t.toLowerCase().includes(s)) ||
        i.hesaplar.some(h => h.handle.toLowerCase().includes(s))
      );
    }
    if (filterKategori) list = list.filter(i => i.kategori === filterKategori);
    return list;
  }, [influencers, tab, search, filterKategori]);

  // Stats
  const stats = useMemo(() => ({
    total: influencers.length,
    aktif: influencers.filter(i => i.durum === "aktif").length,
    havuz: influencers.filter(i => i.durum === "havuz").length,
    kara: influencers.filter(i => i.durum === "kara_liste").length,
    totalCollabs: collabs.length,
    totalSpend: collabs.reduce((s, c) => s + c.odenen_ucret, 0),
  }), [influencers, collabs]);

  // Open edit
  function openEdit(inf: Influencer) {
    setEditingInfluencer(inf);
    setShowForm(true);
    setDrawerInfluencer(null);
  }

  return (
    <div style={{ padding: "0 0 40px 0" }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>
              <span style={{ background: "linear-gradient(135deg, #c084fc, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                İnfluencer
              </span>
              {" "}Yönetimi
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--c-dim)" }}>
              İnfluencer havuzunu, iş birliklerini ve kampanya performansını takip edin
            </p>
          </div>
          <button onClick={() => { setEditingInfluencer(null); setShowForm(true); }} style={{
            padding: "11px 22px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, #a78bfa, #818cf8)",
            color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 4px 20px rgba(167,139,250,0.35)",
          }}>
            <span style={{ fontSize: 16 }}>+</span> Yeni İnfluencer
          </button>
        </div>
      </div>

      {/* Stats bento row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Toplam", value: stats.total, color: "#c084fc", icon: "👥" },
          { label: "Aktif", value: stats.aktif, color: "#10b981", icon: "✅" },
          { label: "Havuz", value: stats.havuz, color: "#f59e0b", icon: "⏳" },
          { label: "Kara Liste", value: stats.kara, color: "#ef4444", icon: "🚫" },
          { label: "İş Birlikleri", value: stats.totalCollabs, color: "#60a5fa", icon: "🤝" },
          { label: "Toplam Harcama", value: fmtMoney(stats.totalSpend), color: "#34d399", icon: "💰" },
        ].map(s => (
          <div key={s.label} style={{
            padding: "14px 14px", borderRadius: 12,
            background: "var(--c-card)", border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
          }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "var(--c-dim)", marginTop: 2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        {(["hepsi", "aktif", "havuz", "kara_liste"] as const).map(t => {
          const labels: Record<string, string> = { hepsi: "Hepsi", aktif: "Aktif", havuz: "Havuz", kara_liste: "Kara Liste" };
          const active = tab === t;
          return (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "7px 16px", borderRadius: 20,
              border: active ? "1px solid rgba(167,139,250,0.5)" : "1px solid rgba(255,255,255,0.08)",
              background: active ? "rgba(167,139,250,0.15)" : "transparent",
              color: active ? "#c084fc" : "var(--c-dim)",
              cursor: "pointer", fontSize: 12, fontWeight: active ? 700 : 500,
            }}>{labels[t]}</button>
          );
        })}

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Ara... (isim, hesap, etiket)"
            style={{
              padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)", color: "var(--c-text1)", fontSize: 12, outline: "none", width: 220,
            }}
          />
          <select value={filterKategori} onChange={e => setFilterKategori(e.target.value)} style={{
            padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.05)", color: "var(--c-text1)", fontSize: 12, outline: "none",
          }}>
            <option value="" style={{ background: "#1a1a2e", color: "#e2e8f0" }}>Tüm Kategoriler</option>
            {KATEGORILER.filter(k => k.value).map(k => <option key={k.value} value={k.value} style={{ background: "#1a1a2e", color: "#e2e8f0" }}>{k.label}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{
          padding: "60px 20px", textAlign: "center",
          borderRadius: 16, border: "1px dashed rgba(255,255,255,0.1)",
          color: "var(--c-dim)", fontSize: 14,
        }}>
          {influencers.length === 0
            ? "Henüz influencer kaydı yok. İlk influencer'ı ekleyin!"
            : "Arama kriterlerine uygun influencer bulunamadı."}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {filtered.map(inf => {
            const myCollabCount = collabs.filter(c => c.influencer_id === inf.id).length;
            const totalF = totalFollowers(inf.hesaplar);
            return (
              <div key={inf.id} onClick={() => setDrawerInfluencer(inf)} style={{
                padding: 18, borderRadius: 14,
                background: "var(--c-card)", border: "1px solid rgba(255,255,255,0.07)",
                cursor: "pointer", transition: "all 0.18s",
                boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(167,139,250,0.3)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
              >
                {/* Card Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                      {inf.ad} {inf.soyad}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      <Badge status={inf.durum} map={DURUM_MAP} />
                      {inf.kategori && <Tag text={inf.kategori} />}
                    </div>
                  </div>
                  {totalF > 0 && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#60a5fa" }}>{fmt(totalF)}</div>
                      <div style={{ fontSize: 10, color: "var(--c-dim)" }}>takipçi</div>
                    </div>
                  )}
                </div>

                {/* Hesaplar */}
                {inf.hesaplar?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                    {inf.hesaplar.slice(0, 3).map((h, i) => <PlatformChip key={i} hesap={h} />)}
                    {inf.hesaplar.length > 3 && <Tag text={`+${inf.hesaplar.length - 3}`} />}
                  </div>
                )}

                {/* Footer */}
                <div style={{
                  paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  fontSize: 12, color: "var(--c-dim)",
                }}>
                  <span>🤝 {myCollabCount} iş birliği</span>
                  {inf.sehir && <span>📍 {inf.sehir}</span>}
                  {inf.min_ucret > 0 && (
                    <span style={{ color: "#34d399", fontWeight: 600 }}>
                      {fmtMoney(inf.min_ucret, inf.para_birimi)}+
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <InfluencerFormModal
          influencer={editingInfluencer}
          onClose={() => { setShowForm(false); setEditingInfluencer(null); }}
          onSave={reload}
        />
      )}

      {drawerInfluencer && (
        <InfluencerDrawer
          influencer={drawerInfluencer}
          collabs={collabs}
          musteriler={musteriler}
          onClose={() => setDrawerInfluencer(null)}
          onEdit={() => openEdit(drawerInfluencer)}
          onDelete={() => handleDeleteInfluencer(drawerInfluencer.id)}
          onAddCollab={() => { setEditingCollab(null); setShowCollabForm(true); }}
          onDeleteCollab={handleDeleteCollab}
          onEditCollab={(c) => { setEditingCollab(c); setShowCollabForm(true); }}
        />
      )}

      {showCollabForm && drawerInfluencer && (
        <CollaborationModal
          influencer={drawerInfluencer}
          collab={editingCollab}
          musteriler={musteriler}
          onClose={() => { setShowCollabForm(false); setEditingCollab(null); }}
          onSave={reload}
        />
      )}
    </div>
  );
}
