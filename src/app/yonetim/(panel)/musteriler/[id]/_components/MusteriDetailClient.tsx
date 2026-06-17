"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateMusteri,
  deleteMusteri,
  addMetrik,
  updateMetrik,
  deleteMetrik,
  type MusteriInput,
  type MetrikInput,
} from "@/lib/actions/musteriler";
import { addGorev, updateGorev, deleteGorev } from "@/lib/actions/gorevler";
import { addTeklif, updateTeklif, deleteTeklif } from "@/lib/actions/teklifler";
import { addIletisim, deleteIletisim } from "@/lib/actions/iletisimler";
import { DatePicker } from "../../_components/DatePicker";

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

type Metrik = {
  id: string;
  musteri_id: string;
  ay: string;
  reklam_butcesi: number;
  etkilesim_orani: number;
  takipci_artisi: number;
  toplam_erisim: number;
  tiklama_orani: number;
  tiklama_sayisi: number;
  donusum_sayisi: number;
  musteri_cirosu: number;
  notlar: string;
};

type Gorev = {
  id: string;
  musteri_id: string;
  baslik: string;
  aciklama: string;
  bitis_tarihi: string | null;
  tamamlandi: boolean;
  oncelik: "dusuk" | "normal" | "yuksek";
  created_at: string;
};

type Teklif = {
  id: string;
  musteri_id: string;
  baslik: string;
  tutar: number;
  durum: "hazirlaniyor" | "gonderildi" | "gorusuluyor" | "kazanildi" | "kaybedildi";
  gonderim_tarihi: string | null;
  notlar: string;
  created_at: string;
};

type Iletisim = {
  id: string;
  musteri_id: string;
  tarih: string;
  tip: "not" | "toplanti" | "telefon" | "email" | "diger";
  baslik: string;
  icerik: string;
  created_at: string;
};

type Tab = "genel" | "gorevler" | "teklifler" | "iletisim";

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
  instagram: "#e1306c", facebook: "#1877f2", google: "#4285f4",
  linkedin: "#0a66c2", tiktok: "#010101", youtube: "#ff0000", twitter: "#1da1f2",
};

const TEKLIF_DURUM: Record<string, { label: string; color: string; bg: string }> = {
  hazirlaniyor: { label: "Hazırlanıyor", color: "#64748b", bg: "rgba(100,116,139,0.12)" },
  gonderildi:   { label: "Gönderildi",   color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  gorusuluyor:  { label: "Görüşülüyor",  color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  kazanildi:    { label: "Kazanıldı",    color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  kaybedildi:   { label: "Kaybedildi",   color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

const ILETISIM_TIP: Record<string, { label: string; color: string; icon: string }> = {
  not:      { label: "Not",      color: "#64748b", icon: "📝" },
  toplanti: { label: "Toplantı", color: "#8b5cf6", icon: "🤝" },
  telefon:  { label: "Telefon",  color: "#10b981", icon: "📞" },
  email:    { label: "E-posta",  color: "#3b82f6", icon: "✉️" },
  diger:    { label: "Diğer",    color: "#94a3b8", icon: "💬" },
};

const ONCELIK: Record<string, { label: string; color: string; bg: string }> = {
  dusuk:  { label: "Düşük",  color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  normal: { label: "Normal", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  yuksek: { label: "Yüksek", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

function fmt(n: number) {
  return new Intl.NumberFormat("tr-TR").format(n);
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR", { year: "numeric", month: "long" });
}

function fmtDateShort(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

function monthsActive(startDate: string | null) {
  if (!startDate) return 0;
  const s = new Date(startDate);
  const n = new Date();
  return Math.max(0, (n.getFullYear() - s.getFullYear()) * 12 + n.getMonth() - s.getMonth());
}

function formatAy(ay: string) {
  const [y, m] = ay.split("-");
  const names = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  return `${names[parseInt(m) - 1]} ${y}`;
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getContractStatus(sozlesme_bitis_tarihi: string | null, hatirlatma: number) {
  if (!sozlesme_bitis_tarihi) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bitis = new Date(sozlesme_bitis_tarihi);
  const diffDays = Math.ceil((bitis.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { type: "expired", days: Math.abs(diffDays) };
  if (diffDays <= hatirlatma) return { type: "warning", days: diffDays };
  return null;
}

function isOverdue(bitis_tarihi: string | null, tamamlandi: boolean) {
  if (tamamlandi || !bitis_tarihi) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(bitis_tarihi) < today;
}

function isToday(bitis_tarihi: string | null) {
  if (!bitis_tarihi) return false;
  const today = todayISO();
  return bitis_tarihi === today;
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
  background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12,
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ padding: "10px 0", borderBottom: "1px solid var(--c-border)" }}>
      <div style={{ fontSize: 11, color: "var(--c-dim)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, color: "var(--c-text2)", fontWeight: 500 }}>{value || "—"}</div>
    </div>
  );
}

const EMPTY_MUSTERI_FORM = (m: Musteri) => ({
  ad: m.ad, sektor: m.sektor, website: m.website || "",
  email: m.email || "", telefon: m.telefon || "", sorumlu: m.sorumlu || "",
  durum: m.durum, aylik_ucret: m.aylik_ucret ? String(m.aylik_ucret) : "",
  baslangic_tarihi: m.baslangic_tarihi || "", notlar: m.notlar || "",
  platformlar: m.platformlar || [],
  sozlesme_bitis_tarihi: m.sozlesme_bitis_tarihi || "",
  yenileme_hatirlatma_gun: m.yenileme_hatirlatma_gun ? String(m.yenileme_hatirlatma_gun) : "30",
});

const EMPTY_METRIK = {
  ay: "", reklam_butcesi: "", etkilesim_orani: "", takipci_artisi: "",
  toplam_erisim: "", tiklama_orani: "", tiklama_sayisi: "",
  donusum_sayisi: "", musteri_cirosu: "", notlar: "",
};

const EMPTY_GOREV = {
  baslik: "", aciklama: "", bitis_tarihi: "", oncelik: "normal",
};

const EMPTY_TEKLIF = {
  baslik: "", tutar: "", durum: "hazirlaniyor", gonderim_tarihi: "", notlar: "",
};

const EMPTY_ILETISIM = {
  tarih: todayISO(), tip: "not", baslik: "", icerik: "",
};

export function MusteriDetailClient({
  musteri,
  metriks,
  gorevler,
  teklifler,
  iletisimler,
}: {
  musteri: Musteri;
  metriks: Metrik[];
  gorevler: Gorev[];
  teklifler: Teklif[];
  iletisimler: Iletisim[];
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("genel");

  // ── Müşteri Edit Modal ──
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(() => EMPTY_MUSTERI_FORM(musteri));
  const [editError, setEditError] = useState("");

  // ── Metrik Modal ──
  const [metrikModal, setMetrikModal] = useState<{ open: false } | { open: true; editing: Metrik | null }>({ open: false });
  const [metrikForm, setMetrikForm] = useState(EMPTY_METRIK);
  const [metrikError, setMetrikError] = useState("");

  // ── Delete Confirms ──
  const [deleteMusModal, setDeleteMusModal] = useState(false);
  const [deleteMetrikId, setDeleteMetrikId] = useState<string | null>(null);

  // ── Görev Modal ──
  const [gorevModal, setGorevModal] = useState<{ open: false } | { open: true; editing: Gorev | null }>({ open: false });
  const [gorevForm, setGorevForm] = useState(EMPTY_GOREV);
  const [gorevError, setGorevError] = useState("");
  const [deleteGorevId, setDeleteGorevId] = useState<string | null>(null);

  // ── Teklif Modal ──
  const [teklifModal, setTeklifModal] = useState<{ open: false } | { open: true; editing: Teklif | null }>({ open: false });
  const [teklifForm, setTeklifForm] = useState(EMPTY_TEKLIF);
  const [teklifError, setTeklifError] = useState("");
  const [deleteTeklifId, setDeleteTeklifId] = useState<string | null>(null);

  // ── İletişim Modal ──
  const [iletisimModalOpen, setIletisimModalOpen] = useState(false);
  const [iletisimForm, setIletisimForm] = useState(EMPTY_ILETISIM);
  const [iletisimError, setIletisimError] = useState("");
  const [deleteIletisimId, setDeleteIletisimId] = useState<string | null>(null);

  const months = monthsActive(musteri.baslangic_tarihi);
  const totalEarned = (musteri.aylik_ucret || 0) * months;
  const latest = metriks[0];
  const prev   = metriks[1];

  const contractStatus = getContractStatus(
    musteri.sozlesme_bitis_tarihi,
    musteri.yenileme_hatirlatma_gun ?? 30
  );

  // ── Görev derived ──
  const gorevlerSorted = [...gorevler].sort((a, b) => {
    if (!a.tamamlandi && isOverdue(a.bitis_tarihi, false) && (b.tamamlandi || !isOverdue(b.bitis_tarihi, false))) return -1;
    if (!b.tamamlandi && isOverdue(b.bitis_tarihi, false) && (a.tamamlandi || !isOverdue(a.bitis_tarihi, false))) return 1;
    if (!a.tamamlandi && b.tamamlandi) return -1;
    if (a.tamamlandi && !b.tamamlandi) return 1;
    return 0;
  });
  const gorevBekliyor = gorevler.filter((g) => !g.tamamlandi && !isOverdue(g.bitis_tarihi, g.tamamlandi)).length;
  const gorevGecikmis = gorevler.filter((g) => !g.tamamlandi && isOverdue(g.bitis_tarihi, g.tamamlandi)).length;

  // ── Teklif derived ──
  const teklifToplam = teklifler.reduce((s, t) => s + (t.tutar || 0), 0);
  const teklifKazanilan = teklifler.filter((t) => t.durum === "kazanildi").reduce((s, t) => s + (t.tutar || 0), 0);
  const teklifBekleyen = teklifler.filter((t) => ["hazirlaniyor", "gonderildi", "gorusuluyor"].includes(t.durum)).reduce((s, t) => s + (t.tutar || 0), 0);
  const kazanilanCount = teklifler.filter((t) => t.durum === "kazanildi").length;
  const winRate = teklifler.length > 0 ? Math.round((kazanilanCount / teklifler.length) * 100) : 0;

  function togglePlatform(key: string) {
    setEditForm((f) => ({
      ...f,
      platformlar: f.platformlar.includes(key)
        ? f.platformlar.filter((p) => p !== key)
        : [...f.platformlar, key],
    }));
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editForm.ad.trim()) { setEditError("Müşteri adı zorunludur."); return; }
    const data: MusteriInput = {
      ad: editForm.ad.trim(), sektor: editForm.sektor.trim(),
      website: editForm.website.trim(), email: editForm.email.trim(),
      telefon: editForm.telefon.trim(), sorumlu: editForm.sorumlu.trim(),
      durum: editForm.durum, platformlar: editForm.platformlar,
      aylik_ucret: parseFloat(editForm.aylik_ucret) || 0,
      baslangic_tarihi: editForm.baslangic_tarihi || null,
      notlar: editForm.notlar.trim(),
      sozlesme_bitis_tarihi: editForm.sozlesme_bitis_tarihi || null,
      yenileme_hatirlatma_gun: parseInt(editForm.yenileme_hatirlatma_gun) || 30,
    };
    setEditError("");
    setIsPending(true);
    const result = await updateMusteri(musteri.id, data);
    setIsPending(false);
    if (result.error) { setEditError(result.error); }
    else { setEditOpen(false); router.refresh(); }
  }

  function openMetrikAdd() {
    setMetrikForm(EMPTY_METRIK);
    setMetrikError("");
    setMetrikModal({ open: true, editing: null });
  }

  function openMetrikEdit(m: Metrik) {
    setMetrikForm({
      ay: m.ay, reklam_butcesi: m.reklam_butcesi ? String(m.reklam_butcesi) : "",
      etkilesim_orani: m.etkilesim_orani ? String(m.etkilesim_orani) : "",
      takipci_artisi: m.takipci_artisi ? String(m.takipci_artisi) : "",
      toplam_erisim: m.toplam_erisim ? String(m.toplam_erisim) : "",
      tiklama_orani: m.tiklama_orani ? String(m.tiklama_orani) : "",
      tiklama_sayisi: m.tiklama_sayisi ? String(m.tiklama_sayisi) : "",
      donusum_sayisi: m.donusum_sayisi ? String(m.donusum_sayisi) : "",
      musteri_cirosu: m.musteri_cirosu ? String(m.musteri_cirosu) : "",
      notlar: m.notlar || "",
    });
    setMetrikError("");
    setMetrikModal({ open: true, editing: m });
  }

  async function handleMetrikSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!metrikForm.ay) { setMetrikError("Ay seçimi zorunludur."); return; }
    const data = {
      musteri_id: musteri.id,
      ay: metrikForm.ay,
      reklam_butcesi: parseFloat(metrikForm.reklam_butcesi) || 0,
      etkilesim_orani: parseFloat(metrikForm.etkilesim_orani) || 0,
      takipci_artisi: parseInt(metrikForm.takipci_artisi) || 0,
      toplam_erisim: parseInt(metrikForm.toplam_erisim) || 0,
      tiklama_orani: parseFloat(metrikForm.tiklama_orani) || 0,
      tiklama_sayisi: parseInt(metrikForm.tiklama_sayisi) || 0,
      donusum_sayisi: parseInt(metrikForm.donusum_sayisi) || 0,
      musteri_cirosu: parseFloat(metrikForm.musteri_cirosu) || 0,
      notlar: metrikForm.notlar.trim(),
    };
    setMetrikError("");
    setIsPending(true);
    let result;
    if (metrikModal.open && metrikModal.editing) {
      result = await updateMetrik(metrikModal.editing.id, musteri.id, data);
    } else {
      result = await addMetrik(data as MetrikInput);
    }
    setIsPending(false);
    if (result.error) { setMetrikError(result.error); }
    else { setMetrikModal({ open: false }); router.refresh(); }
  }

  async function handleDeleteMusteri() {
    setIsPending(true);
    const result = await deleteMusteri(musteri.id);
    setIsPending(false);
    if (!result.error) { router.push("/yonetim/musteriler"); }
  }

  async function handleDeleteMetrik() {
    if (!deleteMetrikId) return;
    setIsPending(true);
    const result = await deleteMetrik(deleteMetrikId, musteri.id);
    setIsPending(false);
    if (!result.error) { setDeleteMetrikId(null); router.refresh(); }
  }

  // ── Görev handlers ──
  function openGorevAdd() {
    setGorevForm(EMPTY_GOREV);
    setGorevError("");
    setGorevModal({ open: true, editing: null });
  }

  function openGorevEdit(g: Gorev) {
    setGorevForm({ baslik: g.baslik, aciklama: g.aciklama || "", bitis_tarihi: g.bitis_tarihi || "", oncelik: g.oncelik });
    setGorevError("");
    setGorevModal({ open: true, editing: g });
  }

  async function handleGorevSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gorevForm.baslik.trim()) { setGorevError("Başlık zorunludur."); return; }
    setGorevError("");
    setIsPending(true);
    let result;
    if (gorevModal.open && gorevModal.editing) {
      result = await updateGorev(gorevModal.editing.id, musteri.id, {
        baslik: gorevForm.baslik.trim(),
        aciklama: gorevForm.aciklama.trim(),
        bitis_tarihi: gorevForm.bitis_tarihi || null,
        oncelik: gorevForm.oncelik,
      });
    } else {
      result = await addGorev({
        musteri_id: musteri.id,
        baslik: gorevForm.baslik.trim(),
        aciklama: gorevForm.aciklama.trim(),
        bitis_tarihi: gorevForm.bitis_tarihi || null,
        oncelik: gorevForm.oncelik,
      });
    }
    setIsPending(false);
    if (result.error) { setGorevError(result.error); }
    else { setGorevModal({ open: false }); router.refresh(); }
  }

  async function handleToggleGorev(g: Gorev) {
    setIsPending(true);
    await updateGorev(g.id, musteri.id, { tamamlandi: !g.tamamlandi });
    setIsPending(false);
    router.refresh();
  }

  async function handleDeleteGorev() {
    if (!deleteGorevId) return;
    setIsPending(true);
    const result = await deleteGorev(deleteGorevId, musteri.id);
    setIsPending(false);
    if (!result.error) { setDeleteGorevId(null); router.refresh(); }
  }

  // ── Teklif handlers ──
  function openTeklifAdd() {
    setTeklifForm(EMPTY_TEKLIF);
    setTeklifError("");
    setTeklifModal({ open: true, editing: null });
  }

  function openTeklifEdit(t: Teklif) {
    setTeklifForm({
      baslik: t.baslik, tutar: t.tutar ? String(t.tutar) : "",
      durum: t.durum, gonderim_tarihi: t.gonderim_tarihi || "", notlar: t.notlar || "",
    });
    setTeklifError("");
    setTeklifModal({ open: true, editing: t });
  }

  async function handleTeklifSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!teklifForm.baslik.trim()) { setTeklifError("Başlık zorunludur."); return; }
    setTeklifError("");
    setIsPending(true);
    let result;
    if (teklifModal.open && teklifModal.editing) {
      result = await updateTeklif(teklifModal.editing.id, musteri.id, {
        baslik: teklifForm.baslik.trim(),
        tutar: parseFloat(teklifForm.tutar) || 0,
        durum: teklifForm.durum,
        gonderim_tarihi: teklifForm.gonderim_tarihi || null,
        notlar: teklifForm.notlar.trim(),
      });
    } else {
      result = await addTeklif({
        musteri_id: musteri.id,
        baslik: teklifForm.baslik.trim(),
        tutar: parseFloat(teklifForm.tutar) || 0,
        durum: teklifForm.durum,
        gonderim_tarihi: teklifForm.gonderim_tarihi || null,
        notlar: teklifForm.notlar.trim(),
      });
    }
    setIsPending(false);
    if (result.error) { setTeklifError(result.error); }
    else { setTeklifModal({ open: false }); router.refresh(); }
  }

  async function handleDeleteTeklif() {
    if (!deleteTeklifId) return;
    setIsPending(true);
    const result = await deleteTeklif(deleteTeklifId, musteri.id);
    setIsPending(false);
    if (!result.error) { setDeleteTeklifId(null); router.refresh(); }
  }

  // ── İletişim handlers ──
  async function handleIletisimSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!iletisimForm.baslik.trim()) { setIletisimError("Başlık zorunludur."); return; }
    if (!iletisimForm.tarih) { setIletisimError("Tarih zorunludur."); return; }
    setIletisimError("");
    setIsPending(true);
    const result = await addIletisim({
      musteri_id: musteri.id,
      tarih: iletisimForm.tarih,
      tip: iletisimForm.tip,
      baslik: iletisimForm.baslik.trim(),
      icerik: iletisimForm.icerik.trim(),
    });
    setIsPending(false);
    if (result.error) { setIletisimError(result.error); }
    else { setIletisimModalOpen(false); setIletisimForm(EMPTY_ILETISIM); router.refresh(); }
  }

  async function handleDeleteIletisim() {
    if (!deleteIletisimId) return;
    setIsPending(true);
    const result = await deleteIletisim(deleteIletisimId, musteri.id);
    setIsPending(false);
    if (!result.error) { setDeleteIletisimId(null); router.refresh(); }
  }

  function delta(a: number, b: number) {
    if (!b) return null;
    const d = ((a - b) / b) * 100;
    return { val: d, up: d >= 0 };
  }

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: "genel",    label: "Genel Bakış" },
    { key: "gorevler", label: "Görevler",   count: gorevler.length },
    { key: "teklifler",label: "Teklifler",  count: teklifler.length },
    { key: "iletisim", label: "İletişim",   count: iletisimler.length },
  ];

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: 20 }}>
        <a href="/yonetim/musteriler" style={{
          fontSize: 12, color: "var(--c-dim)", textDecoration: "none",
          display: "inline-flex", alignItems: "center", gap: 5, marginBottom: 12,
        }}>
          <svg viewBox="0 0 16 16" fill="none" style={{ width: 13, height: 13 }}>
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Müşteriler
        </a>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 800, color: "#fff", flexShrink: 0,
            }}>
              {musteri.ad[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--c-text)" }}>{musteri.ad}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                <span style={{ fontSize: 12, color: "var(--c-dim)" }}>{musteri.sektor}</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                  color: DURUM[musteri.durum]?.color, background: DURUM[musteri.durum]?.bg,
                }}>
                  {DURUM[musteri.durum]?.label}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setEditForm(EMPTY_MUSTERI_FORM(musteri)); setEditError(""); setEditOpen(true); }} style={{
              padding: "8px 16px", borderRadius: 8, background: "transparent",
              border: "1px solid var(--c-border)", color: "var(--c-text2)",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
            }}>
              Düzenle
            </button>
            <button onClick={() => setDeleteMusModal(true)} style={{
              padding: "8px 16px", borderRadius: 8, background: "transparent",
              border: "1px solid rgba(248,113,113,0.3)", color: "#f87171",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
            }}>
              Sil
            </button>
          </div>
        </div>
      </div>

      {/* ── Contract Expiry Banner ── */}
      {contractStatus && (
        <div style={{
          marginBottom: 16, padding: "12px 16px", borderRadius: 10,
          background: contractStatus.type === "expired" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
          border: `1px solid ${contractStatus.type === "expired" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`,
          color: contractStatus.type === "expired" ? "#ef4444" : "#f59e0b",
          fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
        }}>
          <span>{contractStatus.type === "expired" ? "⚠️" : "🔔"}</span>
          {contractStatus.type === "expired"
            ? `Sözleşme ${contractStatus.days} gün önce sona erdi!`
            : `Sözleşme ${contractStatus.days} gün içinde yenilenmeli`}
        </div>
      )}

      {/* ── Tab Navigation ── */}
      <div style={{
        display: "flex", gap: 2, marginBottom: 20,
        background: "var(--c-surface)", border: "1px solid var(--c-border)",
        borderRadius: 10, padding: 4, width: "fit-content",
      }}>
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: "7px 16px", borderRadius: 7, border: "none", cursor: "pointer",
            background: activeTab === tab.key ? "var(--c-border2)" : "transparent",
            color: activeTab === tab.key ? "var(--c-text)" : "var(--c-dim)",
            fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10,
                background: activeTab === tab.key ? "rgba(99,102,241,0.2)" : "var(--c-surface2)",
                color: activeTab === tab.key ? "#6366f1" : "var(--c-dim)",
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          TAB 1: GENEL BAKIŞ
      ══════════════════════════════════════════ */}
      {activeTab === "genel" && (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, alignItems: "start" }}>
          {/* ── Sol: Müşteri Bilgileri ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ ...CARD, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                Müşteri Bilgileri
              </div>
              <InfoRow label="E-posta" value={musteri.email ? <a href={`mailto:${musteri.email}`} style={{ color: "#3b82f6", textDecoration: "none" }}>{musteri.email}</a> : null} />
              <InfoRow label="Telefon" value={musteri.telefon} />
              <InfoRow label="Website" value={musteri.website ? <a href={musteri.website} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "none" }}>{musteri.website}</a> : null} />
              <InfoRow label="Sorumlu" value={musteri.sorumlu} />
              <InfoRow label="Başlangıç" value={fmtDate(musteri.baslangic_tarihi)} />
              {musteri.sozlesme_bitis_tarihi && (
                <InfoRow label="Sözleşme Bitişi" value={fmtDate(musteri.sozlesme_bitis_tarihi)} />
              )}
              {musteri.notlar && <InfoRow label="Notlar" value={<span style={{ whiteSpace: "pre-wrap" }}>{musteri.notlar}</span>} />}
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Platformlar</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {(musteri.platformlar || []).length === 0 ? <span style={{ fontSize: 12, color: "var(--c-dim)" }}>—</span> : (musteri.platformlar || []).map((p) => (
                    <span key={p} style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
                      color: PLATFORM_COLORS[p] ?? "var(--c-text3)",
                      background: "var(--c-surface2)", border: "1px solid var(--c-border)",
                      textTransform: "capitalize",
                    }}>
                      {PLATFORMS.find((x) => x.key === p)?.label ?? p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Karlılık ── */}
            <div style={{ ...CARD, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                Karlılık
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 12, color: "var(--c-dim)" }}>Aylık Yönetim Ücreti</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#10b981" }}>
                    {musteri.aylik_ucret ? `₺${fmt(musteri.aylik_ucret)}` : "—"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 12, color: "var(--c-dim)" }}>Çalışma Süresi</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text2)" }}>
                    {months ? `${months} ay` : "—"}
                  </span>
                </div>
                <div style={{ borderTop: "1px solid var(--c-border)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--c-text3)" }}>Toplam Kazanım</span>
                  <span style={{ fontSize: 17, fontWeight: 800, color: "#6366f1" }}>
                    {totalEarned ? `₺${fmt(totalEarned)}` : "—"}
                  </span>
                </div>
                {latest?.reklam_butcesi ? (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 12, color: "var(--c-dim)" }}>Son Ay Yön. Bütçe</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#f59e0b" }}>₺{fmt(latest.reklam_butcesi)}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* ── Sağ: Performans Metrikleri ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Son Ay Özet Kartları */}
            {latest && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {[
                  {
                    label: "Etkileşim Oranı",
                    value: latest.etkilesim_orani ? `%${latest.etkilesim_orani.toFixed(2)}` : "—",
                    delta: prev ? delta(latest.etkilesim_orani, prev.etkilesim_orani) : null,
                    color: "#6366f1",
                  },
                  {
                    label: "Takipçi Artışı",
                    value: latest.takipci_artisi ? (latest.takipci_artisi > 0 ? `+${fmt(latest.takipci_artisi)}` : fmt(latest.takipci_artisi)) : "—",
                    delta: null,
                    color: "#10b981",
                  },
                  {
                    label: "Toplam Erişim",
                    value: latest.toplam_erisim ? fmt(latest.toplam_erisim) : "—",
                    delta: prev ? delta(latest.toplam_erisim, prev.toplam_erisim) : null,
                    color: "#3b82f6",
                  },
                  {
                    label: "CTR",
                    value: latest.tiklama_orani ? `%${latest.tiklama_orani.toFixed(2)}` : "—",
                    delta: prev ? delta(latest.tiklama_orani, prev.tiklama_orani) : null,
                    color: "#f59e0b",
                  },
                ].map((s) => (
                  <div key={s.label} style={{ ...CARD, padding: "14px 16px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                      {s.label}
                      <span style={{ fontSize: 9, display: "block", fontWeight: 400, marginTop: 1, textTransform: "none" }}>
                        {latest.ay ? `(${formatAy(latest.ay)})` : ""}
                      </span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                    {s.delta && (
                      <div style={{ fontSize: 11, color: s.delta.up ? "#10b981" : "#f87171", marginTop: 2 }}>
                        {s.delta.up ? "▲" : "▼"} {Math.abs(s.delta.val).toFixed(1)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Genel Büyüme */}
            {metriks.length > 0 && (
              <div style={{ ...CARD, padding: 16, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
                {[
                  {
                    label: "Toplam Takipçi Artışı",
                    value: metriks.reduce((s, m) => s + (m.takipci_artisi || 0), 0),
                    fmt: (v: number) => v > 0 ? `+${fmt(v)}` : fmt(v),
                    color: "#10b981",
                  },
                  {
                    label: "Üretilen Toplam Ciro",
                    value: metriks.reduce((s, m) => s + (m.musteri_cirosu || 0), 0),
                    fmt: (v: number) => v ? `₺${fmt(v)}` : "—",
                    color: "#6366f1",
                  },
                  {
                    label: "Toplam Dönüşüm",
                    value: metriks.reduce((s, m) => s + (m.donusum_sayisi || 0), 0),
                    fmt: (v: number) => fmt(v),
                    color: "#f59e0b",
                  },
                ].map((s, i) => (
                  <div key={s.label} style={{
                    padding: "12px 16px",
                    borderRight: i < 2 ? "1px solid var(--c-border)" : "none",
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.fmt(s.value)}</div>
                    <div style={{ fontSize: 10, color: "var(--c-dim)", marginTop: 2 }}>{metriks.length} aylık toplam</div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Aylık Metrikler Tablosu ── */}
            <div style={CARD}>
              <div style={{
                padding: "14px 18px", borderBottom: "1px solid var(--c-border)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text)" }}>Aylık Metrikler</div>
                <button onClick={openMetrikAdd} style={{
                  padding: "7px 14px", borderRadius: 7, background: "#ef4444",
                  border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <svg viewBox="0 0 14 14" fill="none" style={{ width: 12, height: 12 }}>
                    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Metrik Ekle
                </button>
              </div>

              {metriks.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "var(--c-dim)", fontSize: 13 }}>
                  Henüz metrik eklenmedi.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "80px 120px 100px 110px 100px 80px 120px 80px",
                    padding: "8px 18px",
                    background: "var(--c-surface2)",
                    borderBottom: "1px solid var(--c-border)",
                    minWidth: 820,
                  }}>
                    {["Ay", "Rek. Bütçesi", "ETK Oranı", "Takipçi ±", "Erişim", "CTR", "Müş. Cirosu", ""].map((h) => (
                      <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {h}
                      </div>
                    ))}
                  </div>
                  {metriks.map((m, i) => (
                    <div key={m.id} style={{
                      display: "grid",
                      gridTemplateColumns: "80px 120px 100px 110px 100px 80px 120px 80px",
                      padding: "11px 18px",
                      borderBottom: i < metriks.length - 1 ? "1px solid var(--c-border)" : "none",
                      alignItems: "center",
                      minWidth: 820,
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--c-text)" }}>{formatAy(m.ay)}</div>
                      <div style={{ fontSize: 12, color: "var(--c-text2)" }}>{m.reklam_butcesi ? `₺${fmt(m.reklam_butcesi)}` : "—"}</div>
                      <div style={{ fontSize: 12, color: "var(--c-text2)" }}>
                        {m.etkilesim_orani ? <span style={{ color: "#6366f1", fontWeight: 600 }}>%{m.etkilesim_orani.toFixed(2)}</span> : "—"}
                      </div>
                      <div style={{ fontSize: 12 }}>
                        {m.takipci_artisi ? (
                          <span style={{ color: m.takipci_artisi > 0 ? "#10b981" : "#f87171", fontWeight: 600 }}>
                            {m.takipci_artisi > 0 ? "+" : ""}{fmt(m.takipci_artisi)}
                          </span>
                        ) : "—"}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--c-text2)" }}>{m.toplam_erisim ? fmt(m.toplam_erisim) : "—"}</div>
                      <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: m.tiklama_orani ? 600 : 400 }}>
                        {m.tiklama_orani ? `%${m.tiklama_orani.toFixed(2)}` : "—"}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--c-text2)" }}>{m.musteri_cirosu ? `₺${fmt(m.musteri_cirosu)}` : "—"}</div>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button onClick={() => openMetrikEdit(m)} title="Düzenle" style={{
                          padding: "4px 7px", borderRadius: 5, background: "transparent",
                          border: "1px solid var(--c-border)", color: "var(--c-text3)", cursor: "pointer",
                          display: "flex", alignItems: "center",
                        }}>
                          <svg viewBox="0 0 14 14" fill="none" style={{ width: 11, height: 11 }}>
                            <path d="M10 2l2 2L4 12H2v-2L10 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button onClick={() => setDeleteMetrikId(m.id)} title="Sil" style={{
                          padding: "4px 7px", borderRadius: 5, background: "transparent",
                          border: "1px solid rgba(248,113,113,0.25)", color: "#f87171", cursor: "pointer",
                          display: "flex", alignItems: "center",
                        }}>
                          <svg viewBox="0 0 14 14" fill="none" style={{ width: 11, height: 11 }}>
                            <path d="M2 4h10M5 4V2h4v2M6 7v4M8 7v4M3 4l1 8h6l1-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB 2: GÖREVLER
      ══════════════════════════════════════════ */}
      {activeTab === "gorevler" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { label: "Toplam",    value: gorevler.length,   color: "#6366f1" },
              { label: "Bekliyor", value: gorevBekliyor,     color: "#f59e0b" },
              { label: "Gecikmiş", value: gorevGecikmis,     color: "#ef4444" },
            ].map((s) => (
              <div key={s.label} style={{ ...CARD, padding: "16px 20px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* List header */}
          <div style={{ ...CARD, overflow: "hidden" }}>
            <div style={{
              padding: "12px 18px", borderBottom: "1px solid var(--c-border)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text)" }}>Görevler</div>
              <button onClick={openGorevAdd} style={{
                padding: "7px 14px", borderRadius: 7, background: "#ef4444",
                border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <svg viewBox="0 0 14 14" fill="none" style={{ width: 12, height: 12 }}>
                  <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Görev Ekle
              </button>
            </div>
            {gorevler.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--c-dim)", fontSize: 13 }}>
                Henüz görev eklenmedi.
              </div>
            ) : (
              <div>
                {gorevlerSorted.map((g, i) => {
                  const overdue = isOverdue(g.bitis_tarihi, g.tamamlandi);
                  const todayTask = !g.tamamlandi && isToday(g.bitis_tarihi);
                  const borderColor = g.tamamlandi ? "transparent" : overdue ? "#ef4444" : todayTask ? "#f59e0b" : "transparent";
                  return (
                    <div key={g.id} style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: "13px 18px",
                      borderBottom: i < gorevlerSorted.length - 1 ? "1px solid var(--c-border)" : "none",
                      borderLeft: `3px solid ${borderColor}`,
                      opacity: g.tamamlandi ? 0.55 : 1,
                    }}>
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleGorev(g)}
                        disabled={isPending}
                        style={{
                          width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                          border: `2px solid ${g.tamamlandi ? "#10b981" : "var(--c-border)"}`,
                          background: g.tamamlandi ? "#10b981" : "transparent",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          marginTop: 1,
                        }}
                      >
                        {g.tamamlandi && (
                          <svg viewBox="0 0 10 10" fill="none" style={{ width: 10, height: 10 }}>
                            <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 600, color: "var(--c-text)",
                          textDecoration: g.tamamlandi ? "line-through" : "none",
                        }}>
                          {g.baslik}
                        </div>
                        {g.aciklama && (
                          <div style={{ fontSize: 12, color: "var(--c-dim)", marginTop: 2 }}>{g.aciklama}</div>
                        )}
                        <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
                          {g.bitis_tarihi && (
                            <span style={{
                              fontSize: 11, color: overdue ? "#ef4444" : todayTask ? "#f59e0b" : "var(--c-dim)", fontWeight: 500,
                            }}>
                              📅 {fmtDateShort(g.bitis_tarihi)}
                              {overdue ? " — Gecikti" : todayTask ? " — Bugün!" : ""}
                            </span>
                          )}
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 5,
                            color: ONCELIK[g.oncelik]?.color,
                            background: ONCELIK[g.oncelik]?.bg,
                          }}>
                            {ONCELIK[g.oncelik]?.label}
                          </span>
                        </div>
                      </div>
                      {/* Actions */}
                      <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                        <button onClick={() => openGorevEdit(g)} style={{
                          padding: "4px 7px", borderRadius: 5, background: "transparent",
                          border: "1px solid var(--c-border)", color: "var(--c-text3)", cursor: "pointer",
                          display: "flex", alignItems: "center",
                        }}>
                          <svg viewBox="0 0 14 14" fill="none" style={{ width: 11, height: 11 }}>
                            <path d="M10 2l2 2L4 12H2v-2L10 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button onClick={() => setDeleteGorevId(g.id)} style={{
                          padding: "4px 7px", borderRadius: 5, background: "transparent",
                          border: "1px solid rgba(248,113,113,0.25)", color: "#f87171", cursor: "pointer",
                          display: "flex", alignItems: "center",
                        }}>
                          <svg viewBox="0 0 14 14" fill="none" style={{ width: 11, height: 11 }}>
                            <path d="M2 4h10M5 4V2h4v2M6 7v4M8 7v4M3 4l1 8h6l1-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB 3: TEKLİFLER
      ══════════════════════════════════════════ */}
      {activeTab === "teklifler" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { label: "Toplam Tutar",  value: teklifler.length > 0 ? `₺${fmt(teklifToplam)}` : "—",    color: "#6366f1" },
              { label: "Kazanılan",     value: teklifler.length > 0 ? `₺${fmt(teklifKazanilan)}` : "—", color: "#10b981" },
              { label: "Bekleyen",      value: teklifler.length > 0 ? `₺${fmt(teklifBekleyen)}` : "—",  color: "#f59e0b" },
            ].map((s) => (
              <div key={s.label} style={{ ...CARD, padding: "16px 20px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
          {teklifler.length > 0 && (
            <div style={{ fontSize: 12, color: "var(--c-dim)" }}>
              Kazanma Oranı: <strong style={{ color: winRate >= 50 ? "#10b981" : "#f59e0b" }}>{winRate}%</strong>
              {" "}({kazanilanCount}/{teklifler.length} teklif)
            </div>
          )}

          {/* Table */}
          <div style={{ ...CARD, overflow: "hidden" }}>
            <div style={{
              padding: "12px 18px", borderBottom: "1px solid var(--c-border)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text)" }}>Teklifler</div>
              <button onClick={openTeklifAdd} style={{
                padding: "7px 14px", borderRadius: 7, background: "#ef4444",
                border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <svg viewBox="0 0 14 14" fill="none" style={{ width: 12, height: 12 }}>
                  <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Teklif Ekle
              </button>
            </div>
            {teklifler.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--c-dim)", fontSize: 13 }}>
                Henüz teklif eklenmedi.
              </div>
            ) : (
              <div>
                {/* Header row */}
                <div style={{
                  display: "grid", gridTemplateColumns: "2fr 120px 120px 130px 80px",
                  padding: "8px 18px", background: "var(--c-surface2)",
                  borderBottom: "1px solid var(--c-border)",
                }}>
                  {["Başlık", "Tutar", "Durum", "Gönderim Tarihi", ""].map((h) => (
                    <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
                  ))}
                </div>
                {teklifler.map((t, i) => (
                  <div key={t.id} style={{
                    display: "grid", gridTemplateColumns: "2fr 120px 120px 130px 80px",
                    padding: "12px 18px", alignItems: "center",
                    borderBottom: i < teklifler.length - 1 ? "1px solid var(--c-border)" : "none",
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)" }}>{t.baslik}</div>
                      {t.notlar && <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 1 }}>{t.notlar}</div>}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}>
                      {t.tutar ? `₺${fmt(t.tutar)}` : "—"}
                    </div>
                    <div>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                        color: TEKLIF_DURUM[t.durum]?.color,
                        background: TEKLIF_DURUM[t.durum]?.bg,
                      }}>
                        {TEKLIF_DURUM[t.durum]?.label ?? t.durum}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--c-dim)" }}>{fmtDateShort(t.gonderim_tarihi)}</div>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button onClick={() => openTeklifEdit(t)} style={{
                        padding: "4px 7px", borderRadius: 5, background: "transparent",
                        border: "1px solid var(--c-border)", color: "var(--c-text3)", cursor: "pointer",
                        display: "flex", alignItems: "center",
                      }}>
                        <svg viewBox="0 0 14 14" fill="none" style={{ width: 11, height: 11 }}>
                          <path d="M10 2l2 2L4 12H2v-2L10 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button onClick={() => setDeleteTeklifId(t.id)} style={{
                        padding: "4px 7px", borderRadius: 5, background: "transparent",
                        border: "1px solid rgba(248,113,113,0.25)", color: "#f87171", cursor: "pointer",
                        display: "flex", alignItems: "center",
                      }}>
                        <svg viewBox="0 0 14 14" fill="none" style={{ width: 11, height: 11 }}>
                          <path d="M2 4h10M5 4V2h4v2M6 7v4M8 7v4M3 4l1 8h6l1-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB 4: İLETİŞİM
      ══════════════════════════════════════════ */}
      {activeTab === "iletisim" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Stat */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <div style={{ ...CARD, padding: "16px 20px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Toplam Kayıt</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#6366f1" }}>{iletisimler.length}</div>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ ...CARD, overflow: "hidden" }}>
            <div style={{
              padding: "12px 18px", borderBottom: "1px solid var(--c-border)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text)" }}>İletişim Geçmişi</div>
              <button onClick={() => { setIletisimForm({ ...EMPTY_ILETISIM, tarih: todayISO() }); setIletisimError(""); setIletisimModalOpen(true); }} style={{
                padding: "7px 14px", borderRadius: 7, background: "#ef4444",
                border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <svg viewBox="0 0 14 14" fill="none" style={{ width: 12, height: 12 }}>
                  <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Not Ekle
              </button>
            </div>
            {iletisimler.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--c-dim)", fontSize: 13 }}>
                Henüz iletişim kaydı eklenmedi.
              </div>
            ) : (
              <div>
                {iletisimler.map((il, i) => {
                  const tipInfo = ILETISIM_TIP[il.tip] ?? ILETISIM_TIP.diger;
                  return (
                    <div key={il.id} style={{
                      display: "flex", gap: 12, padding: "14px 18px",
                      borderBottom: i < iletisimler.length - 1 ? "1px solid var(--c-border)" : "none",
                      borderLeft: `3px solid ${tipInfo.color}`,
                    }}>
                      <div style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{tipInfo.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)" }}>{il.baslik}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 5,
                            color: tipInfo.color,
                            background: `${tipInfo.color}18`,
                          }}>
                            {tipInfo.label}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: "var(--c-dim)", marginBottom: il.icerik ? 6 : 0 }}>
                          {fmtDateShort(il.tarih)}
                        </div>
                        {il.icerik && (
                          <div style={{ fontSize: 12, color: "var(--c-text2)", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{il.icerik}</div>
                        )}
                      </div>
                      <button onClick={() => setDeleteIletisimId(il.id)} style={{
                        padding: "4px 7px", borderRadius: 5, background: "transparent",
                        border: "1px solid rgba(248,113,113,0.25)", color: "#f87171", cursor: "pointer",
                        display: "flex", alignItems: "center", flexShrink: 0, alignSelf: "flex-start",
                      }}>
                        <svg viewBox="0 0 14 14" fill="none" style={{ width: 11, height: 11 }}>
                          <path d="M2 4h10M5 4V2h4v2M6 7v4M8 7v4M3 4l1 8h6l1-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rapor button */}
          <div>
            <a href={`/yonetim/musteriler/${musteri.id}/rapor`} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 9,
              background: "var(--c-surface)", border: "1px solid var(--c-border)",
              color: "var(--c-text2)", fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}>
              📄 Rapor Oluştur
            </a>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════ */}

      {/* ── Müşteri Düzenle Modal ── */}
      {editOpen && (
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
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--c-text)" }}>Müşteri Düzenle</h2>
              <button onClick={() => setEditOpen(false)} style={{ background: "none", border: "none", color: "var(--c-dim)", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
                <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16 }}>
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={LABEL}>Müşteri Adı *</label>
                  <input style={INPUT} value={editForm.ad} onChange={(e) => setEditForm((f) => ({ ...f, ad: e.target.value }))} />
                </div>
                <div>
                  <label style={LABEL}>Sektör</label>
                  <input style={INPUT} value={editForm.sektor} onChange={(e) => setEditForm((f) => ({ ...f, sektor: e.target.value }))} />
                </div>
                <div>
                  <label style={LABEL}>Durum</label>
                  <select style={INPUT} value={editForm.durum} onChange={(e) => setEditForm((f) => ({ ...f, durum: e.target.value as "aktif" | "pasif" | "potansiyel" }))}>
                    <option value="aktif">Aktif</option>
                    <option value="potansiyel">Potansiyel</option>
                    <option value="pasif">Pasif</option>
                  </select>
                </div>
                <div>
                  <label style={LABEL}>Aylık Ücret (₺)</label>
                  <input type="number" style={INPUT} value={editForm.aylik_ucret} onChange={(e) => setEditForm((f) => ({ ...f, aylik_ucret: e.target.value }))} min="0" />
                </div>
                <div>
                  <label style={LABEL}>Başlangıç Tarihi</label>
                  <DatePicker
                    value={editForm.baslangic_tarihi}
                    onChange={(v) => setEditForm((f) => ({ ...f, baslangic_tarihi: v }))}
                    placeholder="Gün Ay Yıl seçin"
                  />
                </div>
                <div>
                  <label style={LABEL}>Sorumlu</label>
                  <input style={INPUT} value={editForm.sorumlu} onChange={(e) => setEditForm((f) => ({ ...f, sorumlu: e.target.value }))} />
                </div>
                <div>
                  <label style={LABEL}>E-posta</label>
                  <input type="email" style={INPUT} value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label style={LABEL}>Telefon</label>
                  <input type="tel" style={INPUT} value={editForm.telefon} onChange={(e) => setEditForm((f) => ({ ...f, telefon: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={LABEL}>Website</label>
                <input style={INPUT} value={editForm.website} onChange={(e) => setEditForm((f) => ({ ...f, website: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={LABEL}>Sözleşme Bitiş Tarihi</label>
                  <DatePicker
                    value={editForm.sozlesme_bitis_tarihi}
                    onChange={(v) => setEditForm((f) => ({ ...f, sozlesme_bitis_tarihi: v }))}
                    placeholder="Gün Ay Yıl seçin"
                  />
                </div>
                <div>
                  <label style={LABEL}>Yenileme Hatırlatması (gün)</label>
                  <input
                    type="number" style={INPUT} value={editForm.yenileme_hatirlatma_gun}
                    onChange={(e) => setEditForm((f) => ({ ...f, yenileme_hatirlatma_gun: e.target.value }))}
                    min="1" placeholder="30"
                  />
                </div>
              </div>
              <div>
                <label style={LABEL}>Platformlar</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {PLATFORMS.map((p) => {
                    const active = editForm.platformlar.includes(p.key);
                    return (
                      <button key={p.key} type="button" onClick={() => togglePlatform(p.key)} style={{
                        padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "1px solid",
                        borderColor: active ? PLATFORM_COLORS[p.key] : "var(--c-border)",
                        background: active ? `${PLATFORM_COLORS[p.key]}18` : "transparent",
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
                <textarea style={{ ...INPUT, height: 70, resize: "vertical" }} value={editForm.notlar} onChange={(e) => setEditForm((f) => ({ ...f, notlar: e.target.value }))} />
              </div>
              {editError && <div style={{ fontSize: 12, color: "#f87171", background: "rgba(248,113,113,0.08)", padding: "8px 12px", borderRadius: 8 }}>{editError}</div>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setEditOpen(false)} style={{ padding: "9px 18px", borderRadius: 8, background: "transparent", border: "1px solid var(--c-border)", color: "var(--c-text2)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>İptal</button>
                <button type="submit" disabled={isPending} style={{ padding: "9px 18px", borderRadius: 8, background: "#ef4444", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1 }}>
                  {isPending ? "Kaydediliyor..." : "Güncelle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Metrik Ekle/Düzenle Modal ── */}
      {metrikModal.open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
          <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 28, width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--c-text)" }}>
                {metrikModal.editing ? "Metrik Düzenle" : "Aylık Metrik Ekle"}
              </h2>
              <button onClick={() => setMetrikModal({ open: false })} style={{ background: "none", border: "none", color: "var(--c-dim)", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
                <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16 }}>
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleMetrikSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={LABEL}>Ay *</label>
                <input type="month" style={INPUT} value={metrikForm.ay} onChange={(e) => setMetrikForm((f) => ({ ...f, ay: e.target.value }))} disabled={!!metrikModal.editing} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={LABEL}>Reklam Bütçesi (₺)</label>
                  <input type="number" style={INPUT} value={metrikForm.reklam_butcesi} onChange={(e) => setMetrikForm((f) => ({ ...f, reklam_butcesi: e.target.value }))} placeholder="0" min="0" />
                </div>
                <div>
                  <label style={LABEL}>Müşteri Cirosu (₺)</label>
                  <input type="number" style={INPUT} value={metrikForm.musteri_cirosu} onChange={(e) => setMetrikForm((f) => ({ ...f, musteri_cirosu: e.target.value }))} placeholder="0" min="0" />
                </div>
                <div>
                  <label style={LABEL}>Etkileşim Oranı (%)</label>
                  <input type="number" style={INPUT} value={metrikForm.etkilesim_orani} onChange={(e) => setMetrikForm((f) => ({ ...f, etkilesim_orani: e.target.value }))} placeholder="0.00" min="0" step="0.01" />
                </div>
                <div>
                  <label style={LABEL}>CTR / Tıklama Oranı (%)</label>
                  <input type="number" style={INPUT} value={metrikForm.tiklama_orani} onChange={(e) => setMetrikForm((f) => ({ ...f, tiklama_orani: e.target.value }))} placeholder="0.00" min="0" step="0.01" />
                </div>
                <div>
                  <label style={LABEL}>Takipçi Artışı (kişi)</label>
                  <input type="number" style={INPUT} value={metrikForm.takipci_artisi} onChange={(e) => setMetrikForm((f) => ({ ...f, takipci_artisi: e.target.value }))} placeholder="0" />
                </div>
                <div>
                  <label style={LABEL}>Tıklama Sayısı</label>
                  <input type="number" style={INPUT} value={metrikForm.tiklama_sayisi} onChange={(e) => setMetrikForm((f) => ({ ...f, tiklama_sayisi: e.target.value }))} placeholder="0" min="0" />
                </div>
                <div>
                  <label style={LABEL}>Toplam Erişim</label>
                  <input type="number" style={INPUT} value={metrikForm.toplam_erisim} onChange={(e) => setMetrikForm((f) => ({ ...f, toplam_erisim: e.target.value }))} placeholder="0" min="0" />
                </div>
                <div>
                  <label style={LABEL}>Dönüşüm Sayısı</label>
                  <input type="number" style={INPUT} value={metrikForm.donusum_sayisi} onChange={(e) => setMetrikForm((f) => ({ ...f, donusum_sayisi: e.target.value }))} placeholder="0" min="0" />
                </div>
              </div>
              <div>
                <label style={LABEL}>Notlar</label>
                <textarea style={{ ...INPUT, height: 60, resize: "vertical" }} value={metrikForm.notlar} onChange={(e) => setMetrikForm((f) => ({ ...f, notlar: e.target.value }))} placeholder="Bu ayla ilgili notlar..." />
              </div>
              {metrikError && <div style={{ fontSize: 12, color: "#f87171", background: "rgba(248,113,113,0.08)", padding: "8px 12px", borderRadius: 8 }}>{metrikError}</div>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setMetrikModal({ open: false })} style={{ padding: "9px 18px", borderRadius: 8, background: "transparent", border: "1px solid var(--c-border)", color: "var(--c-text2)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>İptal</button>
                <button type="submit" disabled={isPending} style={{ padding: "9px 18px", borderRadius: 8, background: "#ef4444", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1 }}>
                  {isPending ? "Kaydediliyor..." : metrikModal.editing ? "Güncelle" : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Görev Modal ── */}
      {gorevModal.open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
          <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 28, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--c-text)" }}>
                {gorevModal.editing ? "Görev Düzenle" : "Görev Ekle"}
              </h2>
              <button onClick={() => setGorevModal({ open: false })} style={{ background: "none", border: "none", color: "var(--c-dim)", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
                <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16 }}>
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleGorevSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={LABEL}>Başlık *</label>
                <input style={INPUT} value={gorevForm.baslik} onChange={(e) => setGorevForm((f) => ({ ...f, baslik: e.target.value }))} placeholder="Görev başlığı" />
              </div>
              <div>
                <label style={LABEL}>Açıklama</label>
                <textarea style={{ ...INPUT, height: 70, resize: "vertical" }} value={gorevForm.aciklama} onChange={(e) => setGorevForm((f) => ({ ...f, aciklama: e.target.value }))} placeholder="Görev detayı..." />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={LABEL}>Bitiş Tarihi</label>
                  <DatePicker
                    value={gorevForm.bitis_tarihi}
                    onChange={(v) => setGorevForm((f) => ({ ...f, bitis_tarihi: v }))}
                    placeholder="Gün Ay Yıl seçin"
                  />
                </div>
                <div>
                  <label style={LABEL}>Öncelik</label>
                  <select style={INPUT} value={gorevForm.oncelik} onChange={(e) => setGorevForm((f) => ({ ...f, oncelik: e.target.value }))}>
                    <option value="dusuk">Düşük</option>
                    <option value="normal">Normal</option>
                    <option value="yuksek">Yüksek</option>
                  </select>
                </div>
              </div>
              {gorevError && <div style={{ fontSize: 12, color: "#f87171", background: "rgba(248,113,113,0.08)", padding: "8px 12px", borderRadius: 8 }}>{gorevError}</div>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setGorevModal({ open: false })} style={{ padding: "9px 18px", borderRadius: 8, background: "transparent", border: "1px solid var(--c-border)", color: "var(--c-text2)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>İptal</button>
                <button type="submit" disabled={isPending} style={{ padding: "9px 18px", borderRadius: 8, background: "#ef4444", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1 }}>
                  {isPending ? "Kaydediliyor..." : gorevModal.editing ? "Güncelle" : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Teklif Modal ── */}
      {teklifModal.open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
          <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 28, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--c-text)" }}>
                {teklifModal.editing ? "Teklif Düzenle" : "Teklif Ekle"}
              </h2>
              <button onClick={() => setTeklifModal({ open: false })} style={{ background: "none", border: "none", color: "var(--c-dim)", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
                <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16 }}>
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleTeklifSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={LABEL}>Başlık *</label>
                <input style={INPUT} value={teklifForm.baslik} onChange={(e) => setTeklifForm((f) => ({ ...f, baslik: e.target.value }))} placeholder="Teklif başlığı" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={LABEL}>Tutar (₺)</label>
                  <input type="number" style={INPUT} value={teklifForm.tutar} onChange={(e) => setTeklifForm((f) => ({ ...f, tutar: e.target.value }))} placeholder="0" min="0" />
                </div>
                <div>
                  <label style={LABEL}>Durum</label>
                  <select style={INPUT} value={teklifForm.durum} onChange={(e) => setTeklifForm((f) => ({ ...f, durum: e.target.value }))}>
                    <option value="hazirlaniyor">Hazırlanıyor</option>
                    <option value="gonderildi">Gönderildi</option>
                    <option value="gorusuluyor">Görüşülüyor</option>
                    <option value="kazanildi">Kazanıldı</option>
                    <option value="kaybedildi">Kaybedildi</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={LABEL}>Gönderim Tarihi</label>
                <DatePicker
                  value={teklifForm.gonderim_tarihi}
                  onChange={(v) => setTeklifForm((f) => ({ ...f, gonderim_tarihi: v }))}
                  placeholder="Gün Ay Yıl seçin"
                />
              </div>
              <div>
                <label style={LABEL}>Notlar</label>
                <textarea style={{ ...INPUT, height: 70, resize: "vertical" }} value={teklifForm.notlar} onChange={(e) => setTeklifForm((f) => ({ ...f, notlar: e.target.value }))} placeholder="Teklif ile ilgili notlar..." />
              </div>
              {teklifError && <div style={{ fontSize: 12, color: "#f87171", background: "rgba(248,113,113,0.08)", padding: "8px 12px", borderRadius: 8 }}>{teklifError}</div>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setTeklifModal({ open: false })} style={{ padding: "9px 18px", borderRadius: 8, background: "transparent", border: "1px solid var(--c-border)", color: "var(--c-text2)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>İptal</button>
                <button type="submit" disabled={isPending} style={{ padding: "9px 18px", borderRadius: 8, background: "#ef4444", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1 }}>
                  {isPending ? "Kaydediliyor..." : teklifModal.editing ? "Güncelle" : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── İletişim Not Ekle Modal ── */}
      {iletisimModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
          <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 28, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--c-text)" }}>İletişim Kaydı Ekle</h2>
              <button onClick={() => setIletisimModalOpen(false)} style={{ background: "none", border: "none", color: "var(--c-dim)", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
                <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16 }}>
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleIletisimSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={LABEL}>Tarih *</label>
                  <DatePicker
                    value={iletisimForm.tarih}
                    onChange={(v) => setIletisimForm((f) => ({ ...f, tarih: v }))}
                    placeholder="Gün Ay Yıl seçin"
                  />
                </div>
                <div>
                  <label style={LABEL}>Tip</label>
                  <select style={INPUT} value={iletisimForm.tip} onChange={(e) => setIletisimForm((f) => ({ ...f, tip: e.target.value }))}>
                    <option value="not">Not</option>
                    <option value="toplanti">Toplantı</option>
                    <option value="telefon">Telefon</option>
                    <option value="email">E-posta</option>
                    <option value="diger">Diğer</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={LABEL}>Başlık *</label>
                <input style={INPUT} value={iletisimForm.baslik} onChange={(e) => setIletisimForm((f) => ({ ...f, baslik: e.target.value }))} placeholder="Kısa başlık" />
              </div>
              <div>
                <label style={LABEL}>İçerik</label>
                <textarea style={{ ...INPUT, height: 90, resize: "vertical" }} value={iletisimForm.icerik} onChange={(e) => setIletisimForm((f) => ({ ...f, icerik: e.target.value }))} placeholder="Detaylar..." />
              </div>
              {iletisimError && <div style={{ fontSize: 12, color: "#f87171", background: "rgba(248,113,113,0.08)", padding: "8px 12px", borderRadius: 8 }}>{iletisimError}</div>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setIletisimModalOpen(false)} style={{ padding: "9px 18px", borderRadius: 8, background: "transparent", border: "1px solid var(--c-border)", color: "var(--c-text2)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>İptal</button>
                <button type="submit" disabled={isPending} style={{ padding: "9px 18px", borderRadius: 8, background: "#ef4444", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1 }}>
                  {isPending ? "Kaydediliyor..." : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Müşteri Sil Onayı ── */}
      {deleteMusModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 28, width: "100%", maxWidth: 380 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--c-text)", marginBottom: 10 }}>Müşteriyi Sil</div>
            <p style={{ fontSize: 13, color: "var(--c-text2)", margin: "0 0 20px" }}>
              <strong>{musteri.ad}</strong> müşterisini ve tüm verilerini kalıcı olarak silmek istediğinizden emin misiniz?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setDeleteMusModal(false)} style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", border: "1px solid var(--c-border)", color: "var(--c-text2)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>İptal</button>
              <button onClick={handleDeleteMusteri} disabled={isPending} style={{ padding: "8px 16px", borderRadius: 8, background: "#ef4444", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1 }}>
                {isPending ? "Siliniyor..." : "Evet, Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Metrik Sil Onayı ── */}
      {deleteMetrikId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 28, width: "100%", maxWidth: 360 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--c-text)", marginBottom: 10 }}>Metrik Sil</div>
            <p style={{ fontSize: 13, color: "var(--c-text2)", margin: "0 0 20px" }}>Bu aydaki tüm metrik verilerini silmek istediğinizden emin misiniz?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setDeleteMetrikId(null)} style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", border: "1px solid var(--c-border)", color: "var(--c-text2)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>İptal</button>
              <button onClick={handleDeleteMetrik} disabled={isPending} style={{ padding: "8px 16px", borderRadius: 8, background: "#ef4444", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1 }}>
                {isPending ? "Siliniyor..." : "Evet, Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Görev Sil Onayı ── */}
      {deleteGorevId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 28, width: "100%", maxWidth: 360 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--c-text)", marginBottom: 10 }}>Görevi Sil</div>
            <p style={{ fontSize: 13, color: "var(--c-text2)", margin: "0 0 20px" }}>Bu görevi kalıcı olarak silmek istediğinizden emin misiniz?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setDeleteGorevId(null)} style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", border: "1px solid var(--c-border)", color: "var(--c-text2)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>İptal</button>
              <button onClick={handleDeleteGorev} disabled={isPending} style={{ padding: "8px 16px", borderRadius: 8, background: "#ef4444", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1 }}>
                {isPending ? "Siliniyor..." : "Evet, Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Teklif Sil Onayı ── */}
      {deleteTeklifId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 28, width: "100%", maxWidth: 360 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--c-text)", marginBottom: 10 }}>Teklifi Sil</div>
            <p style={{ fontSize: 13, color: "var(--c-text2)", margin: "0 0 20px" }}>Bu teklifi kalıcı olarak silmek istediğinizden emin misiniz?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setDeleteTeklifId(null)} style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", border: "1px solid var(--c-border)", color: "var(--c-text2)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>İptal</button>
              <button onClick={handleDeleteTeklif} disabled={isPending} style={{ padding: "8px 16px", borderRadius: 8, background: "#ef4444", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1 }}>
                {isPending ? "Siliniyor..." : "Evet, Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── İletişim Sil Onayı ── */}
      {deleteIletisimId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 28, width: "100%", maxWidth: 360 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--c-text)", marginBottom: 10 }}>Kaydı Sil</div>
            <p style={{ fontSize: 13, color: "var(--c-text2)", margin: "0 0 20px" }}>Bu iletişim kaydını kalıcı olarak silmek istediğinizden emin misiniz?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setDeleteIletisimId(null)} style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", border: "1px solid var(--c-border)", color: "var(--c-text2)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>İptal</button>
              <button onClick={handleDeleteIletisim} disabled={isPending} style={{ padding: "8px 16px", borderRadius: 8, background: "#ef4444", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1 }}>
                {isPending ? "Siliniyor..." : "Evet, Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
