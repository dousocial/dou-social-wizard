"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { updateLead, convertLeadToClient, type LeadInput } from "@/lib/actions/crmLeads";
import { addFollowUp, toggleFollowUpCompleted, deleteFollowUp } from "@/lib/actions/crmFollowUps";
import { addMeeting, deleteMeeting } from "@/lib/actions/crmMeetings";
import { addTeklif, updateTeklif, deleteTeklif, createThreePackageOffers } from "@/lib/actions/teklifler";
import { DatePicker } from "../../../musteriler/_components/DatePicker";
import { TeklifPDFButton } from "@/components/admin/TeklifPDFButton";
import { AuditPDFButton } from "@/components/admin/AuditPDFButton";

type Lead = {
  id: string;
  created_at: string;
  title: string;
  company_id: string | null;
  contact_id: string | null;
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
  instagram: string;
  website: string;
  sector: string;
  source: "referans" | "instagram" | "google_maps" | "inbound" | "manuel" | "diger";
  status: "yeni" | "gorusuldu" | "teklif_istendi" | "teklif_gonderildi" | "takipte" | "kazanildi" | "kaybedildi";
  score: number;
  last_contact_date: string | null;
  next_follow_up_date: string | null;
  notes: string;
  assigned_user: string;
  converted_client_id: string | null;
  audit_id?: string | null;
  source_contact_id?: string | null;
};

type Company = { id: string; name: string };
type Contact = { id: string; name: string; company_id: string | null };
type FollowUp = {
  id: string;
  created_at: string;
  lead_id: string;
  follow_up_date: string;
  type: "arama" | "whatsapp" | "eposta" | "toplanti" | "instagram_dm";
  note: string;
  completed: boolean;
};

type Meeting = {
  id: string;
  lead_id: string;
  meeting_at: string;
  location: string;
  participants: string[];
  purpose: string;
  current_problems: string;
  expectations: string;
  current_accounts: string;
  requested_services: string[];
  estimated_monthly_budget: number | null;
  notes: string;
};

type Teklif = {
  id: string;
  lead_id: string | null;
  company_id: string | null;
  musteri_id: string | null;
  baslik: string;
  tutar: number;
  durum: "taslak" | "hazirlaniyor" | "kontrol_bekliyor" | "gonderildi" | "goruldu" | "degerlendiriliyor" | "revize_istendi" | "kabul_edildi" | "reddedildi" | "suresi_doldu" | "gorusuluyor" | "kazanildi" | "kaybedildi";
  gonderim_tarihi: string | null;
  notlar: string;
  created_at: string;
  teklif_no?: string;
  hizmetler?: { ad: string; fiyat: number }[];
  paket_adi?: string;
  kurulum_ucreti?: number;
  ek_hizmetler?: string;
  teklif_tarihi?: string | null;
  gecerlilik_tarihi?: string | null;
  package_level?: "baslangic" | "orta" | "ileri" | null;
  rejection_reason?: string;
  revision_reason?: string;
  package_details?: PackageDetails;
};

type PackageDetails = {
  post_count: number;
  video_count: number;
  shoot_day_count: number;
  story_service: boolean;
  advertising_management: boolean;
  account_management: boolean;
  content_copy: boolean;
  design_service: boolean;
  video_editing: boolean;
};

const EMPTY_PACKAGE_DETAILS: PackageDetails = {
  post_count: 0, video_count: 0, shoot_day_count: 0,
  story_service: false, advertising_management: false, account_management: true,
  content_copy: true, design_service: true, video_editing: true,
};

type User = { id: string; username: string; role: string };

const STATUS_MAP: Record<Lead["status"], { label: string; color: string; bg: string; border: string }> = {
  yeni:              { label: "Yeni",             color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.3)" },
  gorusuldu:         { label: "Görüşüldü",        color: "#c084fc", bg: "rgba(192,132,252,0.12)", border: "rgba(192,132,252,0.3)" },
  teklif_istendi:    { label: "Teklif İstendi",   color: "#fb7185", bg: "rgba(251,113,133,0.12)", border: "rgba(251,113,133,0.3)" },
  teklif_gonderildi: { label: "Teklif İletildi",  color: "#2dd4bf", bg: "rgba(45,212,191,0.12)",  border: "rgba(45,212,191,0.3)" },
  takipte:           { label: "Takipte",          color: "#fb923c", bg: "rgba(251,146,60,0.12)",  border: "rgba(251,146,60,0.3)" },
  kazanildi:         { label: "Kazanıldı",        color: "#4ade80", bg: "rgba(74,222,128,0.12)",  border: "rgba(74,222,128,0.3)" },
  kaybedildi:        { label: "Kaybedildi",       color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)" },
};

const SOURCE_MAP: Record<Lead["source"], string> = {
  referans: "Referans",
  instagram: "Instagram",
  google_maps: "Google Maps",
  inbound: "Gelen Arama/Web",
  manuel: "Manuel",
  diger: "Diğer",
};

const FOLLOW_UP_TYPES: Record<FollowUp["type"], { label: string; color: string }> = {
  arama:        { label: "Telefon Araması", color: "#10b981" },
  whatsapp:     { label: "WhatsApp",        color: "#22c55e" },
  eposta:       { label: "E-posta",         color: "#3b82f6" },
  toplanti:     { label: "Toplantı",        color: "#8b5cf6" },
  instagram_dm: { label: "Instagram DM",    color: "#ec4899" },
};

const TEKLIF_STATUS_MAP: Record<Teklif["durum"], { label: string; color: string; bg: string }> = {
  taslak:       { label: "Taslak",       color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  gonderildi:   { label: "Gönderildi",   color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  kontrol_bekliyor: { label: "Kontrol Bekliyor", color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  goruldu: { label: "Görüldü", color: "#22d3ee", bg: "rgba(34,211,238,0.12)" },
  degerlendiriliyor: { label: "Değerlendiriliyor", color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  revize_istendi: { label: "Revize İstendi", color: "#fb923c", bg: "rgba(251,146,60,0.12)" },
  kabul_edildi: { label: "Kabul Edildi", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  reddedildi:   { label: "Reddedildi",   color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  suresi_doldu: { label: "Süresi Doldu", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  hazirlaniyor: { label: "Hazırlanıyor", color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  gorusuluyor:  { label: "Görüşülüyor",  color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  kazanildi:    { label: "Kazanıldı",    color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  kaybedildi:   { label: "Kaybedildi",   color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

const PLATFORMS = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook",  label: "Facebook" },
  { key: "google",    label: "Google Ads" },
  { key: "linkedin",  label: "LinkedIn" },
  { key: "tiktok",    label: "TikTok" },
  { key: "youtube",   label: "YouTube" },
];

const SECTORS = ["E-ticaret", "Sağlık / Klinik", "Güzellik / Estetik", "Restoran / Cafe", "Eğitim / Akademi", "B2B / Yazılım", "İnşaat / Mimarlık", "Tekstil / Moda", "Turizm / Otel", "Diğer"];

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

function fmt(n: number) { return new Intl.NumberFormat("tr-TR").format(n); }
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWhatsAppLink(phone: string, templateType: "welcome" | "followup" | "reminder", leadName: string, leadTitle: string) {
  const cleanPhone = phone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("90") ? cleanPhone : cleanPhone.length === 10 ? `90${cleanPhone}` : cleanPhone;
  
  let text = "";
  if (templateType === "welcome") {
    text = `Merhaba ${leadName},\n\nDOU Social ekibinden iletişime geçiyorum. Fırsat talebiniz ("${leadTitle}") hakkında görüşmek ve detayları netleştirmek isteriz. Sizin için ne zaman uygun olur?\n\nİyi çalışmalar.`;
  } else if (templateType === "followup") {
    text = `Merhaba ${leadName},\n\nGöndermiş olduğumuz teklifi inceleme şansınız oldu mu? Herhangi bir sorunuz varsa seve seve yanıtlamak isterim.\n\nİyi günler dilerim.`;
  } else {
    text = `Merhaba ${leadName},\n\nBugün planladığımız takip görüşmemizi hatırlatmak istedim. Müsait olduğunuzda görüşebiliriz.\n\nİyi çalışmalar.`;
  }
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}

function getEmailLink(email: string, templateType: "welcome" | "followup" | "reminder", leadName: string, leadTitle: string) {
  let subject = "";
  let body = "";
  
  if (templateType === "welcome") {
    subject = `DOU Social CRM - İş Ortaklığı Tanışma Talebi`;
    body = `Merhaba ${leadName},\n\nDOU Social ekibinden iletişime geçiyorum. "${leadTitle}" başlıklı fırsat talebiniz hakkında detaylı görüşmek ve size en uygun çözümleri sunmak isteriz.\n\nEn kısa sürede görüşmek dileğiyle.\n\nİyi çalışmalar.`;
  } else if (templateType === "followup") {
    subject = `Teklif Takibi - DOU Social`;
    body = `Merhaba ${leadName},\n\nGönderdiğimiz teklifi inceleme fırsatınız oldu mu? Sorularınız veya revize talepleriniz varsa yardımcı olmaktan memnuniyet duyarım.\n\nİyi çalışmalar.`;
  } else {
    subject = `Görüşme Hatırlatma - DOU Social`;
    body = `Merhaba ${leadName},\n\nBugün gerçekleştireceğimiz takip görüşmemizi hatırlatmak istedim. Müsait olduğunuzda görüşmek üzere.\n\nİyi çalışmalar.`;
  }
  
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function scoreColor(s: number) {
  if (s === 0) return "var(--c-dim)";
  if (s < 40)  return "#f87171";
  if (s < 60)  return "#fb923c";
  if (s < 80)  return "#facc15";
  return "#4ade80";
}

export function CrmLeadDetailClient({
  lead, companies, contacts, followUps, meetings, teklifler, users, audit
}: {
  lead: Lead; companies: Company[]; contacts: Contact[]; followUps: FollowUp[]; meetings: Meeting[]; teklifler: Teklif[]; users: User[]; audit?: any;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"takipler" | "toplantilar" | "teklifler">("takipler");
  const [isPending, setIsPending] = useState(false);
  const [generalError, setGeneralError] = useState("");

  // Modaller
  const [editModal, setEditModal] = useState(false);
  const [convertModal, setConvertModal] = useState(false);
  const [followUpModal, setFollowUpModal] = useState(false);
  const [meetingModal, setMeetingModal] = useState(false);
  const [teklifModal, setTeklifModal] = useState<{ open: boolean; editing: Teklif | null }>({ open: false, editing: null });
  const [deleteTargetTeklif, setDeleteTargetTeklif] = useState<Teklif | null>(null);

  useEffect(() => {
    if (searchParams && searchParams.get("convert") === "true") {
      setConvertModal(true);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("convert");
        window.history.replaceState({}, "", url.pathname + url.search);
      }
    }
  }, [searchParams]);

  // Edit Lead Form State
  const [leadForm, setLeadForm] = useState({
    title: lead.title,
    company_id: lead.company_id || "",
    contact_id: lead.contact_id || "",
    company_name: lead.company_name || "",
    contact_name: lead.contact_name || "",
    phone: lead.phone || "",
    email: lead.email || "",
    instagram: lead.instagram || "",
    website: lead.website || "",
    sector: lead.sector || "",
    source: lead.source,
    status: lead.status,
    score: String(lead.score ?? 50),
    notes: lead.notes || "",
    assigned_user: lead.assigned_user || "",
    next_follow_up_date: lead.next_follow_up_date || "",
  });

  // Convert Form State
  const [convertForm, setConvertForm] = useState({
    aylik_ucret: "",
    baslangic_tarihi: todayISO(),
    platformlar: [] as string[],
  });

  // Follow-up Form State
  const [followUpForm, setFollowUpForm] = useState({
    follow_up_date: todayISO(),
    type: "arama" as FollowUp["type"],
    note: "",
  });

  const [meetingForm, setMeetingForm] = useState({
    meeting_at: `${todayISO()}T10:00`, location: "", participants: "", purpose: "",
    current_problems: "", expectations: "", current_accounts: "",
    requested_services: "", estimated_monthly_budget: "", notes: "",
  });

  // Teklif Form State
  const [teklifForm, setTeklifForm] = useState({
    package_level: "baslangic" as "baslangic" | "orta" | "ileri",
    paket_adi: "",
    baslik: "",
    tutar: "",
    kurulum_ucreti: "",
    ek_hizmetler: "",
    teklif_no: "",
    teklif_tarihi: todayISO(),
    gecerlilik_tarihi: "",
    notlar: "",
    hizmetler: [] as { ad: string; fiyat: number }[], rejection_reason: "", revision_reason: "",
    package_details: { ...EMPTY_PACKAGE_DETAILS },
  });

  const compObj = companies.find(c => c.id === lead.company_id);
  const contObj = contacts.find(c => c.id === lead.contact_id);
  const compName = compObj?.name || lead.company_name || "Bireysel";
  const contName = contObj?.name || lead.contact_name || "";
  const stat = STATUS_MAP[lead.status];
  const comparisonOffers = (["baslangic", "orta", "ileri"] as const)
    .map(level => teklifler.find(item => item.package_level === level))
    .filter((item): item is Teklif => Boolean(item));

  // Seçilen firmaya göre yetkili kişileri süz (Fırsat düzenleme modalı için)
  const filteredContactsForEdit = useMemo(() => {
    if (!leadForm.company_id) return [];
    return contacts.filter(c => c.company_id === leadForm.company_id);
  }, [leadForm.company_id, contacts]);

  // Lead Güncelleme
  async function handleLeadUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!leadForm.title.trim()) { setGeneralError("Aday başlığı boş olamaz."); return; }

    setIsPending(true);
    const result = await updateLead(lead.id, {
      title: leadForm.title.trim(),
      company_id: leadForm.company_id || null,
      contact_id: leadForm.contact_id || null,
      company_name: leadForm.company_name.trim(),
      contact_name: leadForm.contact_name.trim(),
      phone: leadForm.phone.trim(),
      email: leadForm.email.trim(),
      instagram: leadForm.instagram.trim(),
      website: leadForm.website.trim(),
      sector: leadForm.sector,
      source: leadForm.source,
      status: leadForm.status,
      score: parseInt(leadForm.score) || 0,
      notes: leadForm.notes.trim(),
      assigned_user: leadForm.assigned_user,
      next_follow_up_date: leadForm.next_follow_up_date || null
    });
    setIsPending(false);

    if (result.error) {
      setGeneralError(result.error);
    } else {
      setEditModal(false);
      router.refresh();
    }
  }

  // Müşteriye Dönüştürme
  async function handleConvertSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fee = parseFloat(convertForm.aylik_ucret);
    if (isNaN(fee) || fee <= 0) { setGeneralError("Geçerli bir aylık ücret giriniz."); return; }

    setIsPending(true);
    const result = await convertLeadToClient(lead.id, {
      aylik_ucret: fee,
      baslangic_tarihi: convertForm.baslangic_tarihi,
      platformlar: convertForm.platformlar,
    });
    setIsPending(false);

    if (result.error) {
      setGeneralError(result.error);
    } else {
      setConvertModal(false);
      router.refresh();
    }
  }

  // Follow-up Ekleme
  async function handleFollowUpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    const result = await addFollowUp({
      lead_id: lead.id,
      follow_up_date: followUpForm.follow_up_date,
      type: followUpForm.type,
      note: followUpForm.note.trim(),
      completed: false,
    });
    setIsPending(false);

    if (result.error) {
      alert("Takip kaydı eklenirken hata: " + result.error);
    } else {
      setFollowUpModal(false);
      setFollowUpForm(f => ({ ...f, note: "" }));
      router.refresh();
    }
  }

  // Follow-up Tamamla/Tamamlama Geri Al
  async function handleToggleFollowUp(id: string, currentStatus: boolean) {
    const result = await toggleFollowUpCompleted(id, lead.id, !currentStatus);
    if (result.error) alert("Takip durumu güncellenemedi: " + result.error);
    else router.refresh();
  }

  // Follow-up Sil
  async function handleDeleteFollowUp(id: string) {
    if (!confirm("Bu takip kaydını silmek istediğinize emin misiniz?")) return;
    const result = await deleteFollowUp(id, lead.id);
    if (result.error) alert("Takip kaydı silinemedi: " + result.error);
    else router.refresh();
  }

  async function handleMeetingSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!meetingForm.meeting_at || !meetingForm.purpose.trim()) {
      setGeneralError("Görüşme tarihi ve amacı zorunludur."); return;
    }
    setIsPending(true);
    const result = await addMeeting({
      lead_id: lead.id,
      meeting_at: new Date(meetingForm.meeting_at).toISOString(),
      location: meetingForm.location,
      participants: meetingForm.participants.split(","),
      purpose: meetingForm.purpose,
      current_problems: meetingForm.current_problems,
      expectations: meetingForm.expectations,
      current_accounts: meetingForm.current_accounts,
      requested_services: meetingForm.requested_services.split(","),
      estimated_monthly_budget: meetingForm.estimated_monthly_budget ? Number(meetingForm.estimated_monthly_budget) : null,
      notes: meetingForm.notes,
    });
    setIsPending(false);
    if (result.error) setGeneralError(result.error);
    else {
      setMeetingModal(false);
      setMeetingForm(f => ({ ...f, purpose: "", current_problems: "", expectations: "", notes: "" }));
      router.refresh();
    }
  }

  async function handleDeleteMeeting(id: string) {
    if (!confirm("Bu görüşme kaydı silinsin mi?")) return;
    const result = await deleteMeeting(id, lead.id);
    if (result.error) setGeneralError(result.error); else router.refresh();
  }

  // Teklif Formu Hizmet Satırı İşlemleri
  function addHizmetRow() {
    setTeklifForm(f => ({
      ...f,
      hizmetler: [...f.hizmetler, { ad: "", fiyat: 0 }]
    }));
  }

  function removeHizmetRow(index: number) {
    setTeklifForm(f => ({
      ...f,
      hizmetler: f.hizmetler.filter((_, i) => i !== index)
    }));
  }

  function updateHizmetRow(index: number, field: "ad" | "fiyat", val: string) {
    setTeklifForm(f => {
      const copy = [...f.hizmetler];
      if (field === "ad") {
        copy[index].ad = val;
      } else {
        copy[index].fiyat = parseFloat(val) || 0;
      }
      return { ...f, hizmetler: copy };
    });
  }

  // Teklif Ekleme/Güncelleme
  async function handleTeklifSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!teklifForm.paket_adi.trim()) { alert("Paket adı zorunludur."); return; }

    const monthly = parseFloat(teklifForm.tutar) || 0;
    const setup = parseFloat(teklifForm.kurulum_ucreti) || 0;
    const toplamTutar = monthly + setup + teklifForm.hizmetler.reduce((acc, curr) => acc + curr.fiyat, 0);

    const inputData = {
      lead_id: lead.id,
      company_id: lead.company_id || null,
      paket_adi: teklifForm.paket_adi.trim(),
      package_level: teklifForm.package_level,
      baslik: teklifForm.baslik.trim() || teklifForm.paket_adi.trim(),
      tutar: toplamTutar,
      kurulum_ucreti: setup,
      ek_hizmetler: teklifForm.ek_hizmetler.trim(),
      teklif_no: teklifForm.teklif_no.trim(),
      teklif_tarihi: teklifForm.teklif_tarihi || null,
      gecerlilik_tarihi: teklifForm.gecerlilik_tarihi || null,
      notlar: teklifForm.notlar.trim(),
      hizmetler: teklifForm.hizmetler,
      rejection_reason: teklifForm.rejection_reason,
      revision_reason: teklifForm.revision_reason,
      package_details: teklifForm.package_details,
      durum: (teklifModal.editing ? teklifModal.editing.durum : "taslak") as any,
    };

    setIsPending(true);
    const result = teklifModal.open && teklifModal.editing
      ? await updateTeklif(teklifModal.editing.id, { leadId: lead.id }, inputData)
      : await addTeklif(inputData);
    setIsPending(false);

    if (result.error) {
      alert("Teklif kaydedilemedi: " + result.error);
    } else {
      setTeklifModal({ open: false, editing: null });
      router.refresh();
    }
  }

  // Teklif Durumunu Değiştir
  async function handleTeklifStatusChange(id: string, newStatus: Teklif["durum"]) {
    const extra: { rejection_reason?: string; revision_reason?: string; viewed_at?: string } = {};
    if (newStatus === "reddedildi") {
      const reason = window.prompt("Ret nedeni: fiyat yüksek, başka ajans, ertelendi, karar verici onaylamadı, ihtiyaç yok, ulaşılamadı veya diğer");
      if (!reason) return;
      extra.rejection_reason = reason.trim();
    }
    if (newStatus === "revize_istendi") {
      const reason = window.prompt("Revize talebini kısaca açıklayın:");
      if (!reason) return;
      extra.revision_reason = reason.trim();
    }
    if (newStatus === "goruldu") extra.viewed_at = new Date().toISOString();
    const result = await updateTeklif(id, { leadId: lead.id }, { durum: newStatus, ...extra });
    if (result.error) alert("Teklif durumu güncellenemedi: " + result.error);
    else router.refresh();
  }

  // Teklif Sil
  async function handleTeklifDelete() {
    if (!deleteTargetTeklif) return;
    setIsPending(true);
    const result = await deleteTeklif(deleteTargetTeklif.id, { leadId: lead.id });
    setIsPending(false);
    if (result.error) {
      alert("Teklif silinemedi: " + result.error);
    } else {
      setDeleteTargetTeklif(null);
      router.refresh();
    }
  }

  async function handleCreatePackageBundle() {
    setIsPending(true);
    const result = await createThreePackageOffers(lead.id, lead.company_id);
    setIsPending(false);
    if (result.error) setGeneralError(result.error);
    else router.refresh();
  }

  function openAddTeklif() {
    setTeklifForm({
      package_level: "baslangic",
      paket_adi: "", baslik: "", tutar: "", kurulum_ucreti: "", ek_hizmetler: "",
      teklif_no: `TKF-${Math.floor(100000 + Math.random() * 900000)}`,
      teklif_tarihi: todayISO(), gecerlilik_tarihi: "", notlar: "", hizmetler: [], rejection_reason: "", revision_reason: "",
      package_details: { ...EMPTY_PACKAGE_DETAILS },
    });
    setTeklifModal({ open: true, editing: null });
  }

  function openEditTeklif(t: Teklif) {
    setTeklifForm({
      package_level: t.package_level || "baslangic",
      paket_adi: t.paket_adi || "",
      baslik: t.baslik,
      tutar: t.tutar ? String(t.tutar) : "", // monthly will be derived from calculations
      kurulum_ucreti: t.kurulum_ucreti ? String(t.kurulum_ucreti) : "",
      ek_hizmetler: t.ek_hizmetler || "",
      teklif_no: t.teklif_no || "",
      teklif_tarihi: t.teklif_tarihi || todayISO(),
      gecerlilik_tarihi: t.gecerlilik_tarihi || "",
      notlar: t.notlar || "",
      hizmetler: t.hizmetler || [],
      rejection_reason: t.rejection_reason || "",
      revision_reason: t.revision_reason || ""
      ,package_details: { ...EMPTY_PACKAGE_DETAILS, ...(t.package_details || {}) }
    });
    setTeklifModal({ open: true, editing: t });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ── Üst Bar & Geri Butonu ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => router.push("/yonetim/musteriler?tab=adaylar")} style={{
          background: "transparent", border: "1px solid var(--c-border)",
          color: "var(--c-text)", padding: "7px 14px", borderRadius: 8,
          fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex",
          alignItems: "center", gap: 6,
        }}>
          ← Tüm Adaylara Dön
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setEditModal(true)} style={{
            background: "var(--c-surface)", border: "1px solid var(--c-border)",
            color: "var(--c-text)", padding: "9px 16px", borderRadius: 8,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            Aday Bilgilerini Düzenle
          </button>
          {!lead.converted_client_id && lead.status !== "kazanildi" && (
            <button onClick={() => setConvertModal(true)} style={{
              background: "#10b981", color: "#fff", border: "none",
              padding: "9px 18px", borderRadius: 8, fontSize: 13,
              fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(16,185,129,0.25)",
            }}>
              Müşteriyi Aktifleştir
            </button>
          )}
        </div>
      </div>

      {generalError && (
        <div style={{
          background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)",
          borderRadius: 10, padding: "12px 16px", color: "#f87171", fontSize: 13, fontWeight: 500,
        }}>
          {generalError}
        </div>
      )}

      {/* ── İki Sütunlu Grid Layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 20, alignItems: "start" }}>
        {/* SOL SÜTUN: Genel Kart Bilgileri */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Kart 1: Durum & Skor */}
          <div style={CARD}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
                  color: stat.color, background: stat.bg, border: `1px solid ${stat.border}`
                }}>
                  {stat.label}
                </span>
                <h1 style={{ margin: "14px 0 0", fontSize: 18, fontWeight: 800, color: "var(--c-text)", letterSpacing: "-0.02em" }}>
                  {lead.title}
                </h1>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--c-dim)" }}>
                  Oluşturulma: {new Date(lead.created_at).toLocaleDateString("tr-TR")}
                </p>
              </div>

              <div style={{ borderTop: "1px solid var(--c-border2)" }}></div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, textAlign: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--c-dim)", textTransform: "uppercase", fontWeight: 600 }}>Aday Skoru</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: lead.score >= 70 ? "#4ade80" : lead.score >= 40 ? "#fbbf24" : "#f87171", marginTop: 4 }}>
                    {lead.score}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--c-dim)", textTransform: "uppercase", fontWeight: 600 }}>Kaynak</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)", marginTop: 10 }}>
                    {SOURCE_MAP[lead.source] || lead.source}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kart 2: İletişim Detayları */}
          <div style={CARD}>
            <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "var(--c-text)", textTransform: "uppercase" }}>İletişim & Firma</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
              <div>
                <span style={{ fontSize: 10, color: "var(--c-dim)", fontWeight: 600, display: "block", textTransform: "uppercase" }}>Firma Adı</span>
                <span style={{ fontWeight: 600, color: "var(--c-text2)" }}>{compName}</span>
              </div>
              {contName && (
                <div>
                  <span style={{ fontSize: 10, color: "var(--c-dim)", fontWeight: 600, display: "block", textTransform: "uppercase" }}>Yetkili Kişi</span>
                  <span style={{ color: "var(--c-text2)" }}>{contName}</span>
                </div>
              )}
              {lead.phone && (
                <div>
                  <span style={{ fontSize: 10, color: "var(--c-dim)", fontWeight: 600, display: "block", textTransform: "uppercase" }}>Telefon</span>
                  <a href={`tel:${lead.phone}`} style={{ color: "#f87171", textDecoration: "none", fontWeight: 600 }}>{lead.phone}</a>
                </div>
              )}
              {lead.email && (
                <div>
                  <span style={{ fontSize: 10, color: "var(--c-dim)", fontWeight: 600, display: "block", textTransform: "uppercase" }}>E-posta</span>
                  <a href={`mailto:${lead.email}`} style={{ color: "#60a5fa", textDecoration: "none" }}>{lead.email}</a>
                </div>
              )}
              {lead.instagram && (
                <div>
                  <span style={{ fontSize: 10, color: "var(--c-dim)", fontWeight: 600, display: "block", textTransform: "uppercase" }}>Instagram</span>
                  <a href={`https://instagram.com/${lead.instagram.replace("@", "")}`} target="_blank" style={{ color: "#ec4899", textDecoration: "none" }}>{lead.instagram}</a>
                </div>
              )}
              {lead.website && (
                <div>
                  <span style={{ fontSize: 10, color: "var(--c-dim)", fontWeight: 600, display: "block", textTransform: "uppercase" }}>Website</span>
                  <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" style={{ color: "#60a5fa", textDecoration: "none" }}>{lead.website}</a>
                </div>
              )}
              <div>
                <span style={{ fontSize: 10, color: "var(--c-dim)", fontWeight: 600, display: "block", textTransform: "uppercase" }}>Sektör</span>
                <span style={{ color: "var(--c-text)" }}>{lead.sector || "—"}</span>
              </div>
              <div>
                <span style={{ fontSize: 10, color: "var(--c-dim)", fontWeight: 600, display: "block", textTransform: "uppercase" }}>Sorumlu</span>
                <span style={{ color: "var(--c-text)" }}>{lead.assigned_user || "Atanmamış"}</span>
              </div>
              {lead.converted_client_id && (
                <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8 }}>
                  <span style={{ fontSize: 10, color: "#10b981", fontWeight: 700, display: "block", textTransform: "uppercase" }}>Müşteri Bağlantısı</span>
                  <a href={`/yonetim/musteriler/${lead.converted_client_id}`} style={{ fontSize: 12, color: "#34d399", fontWeight: 600, textDecoration: "none" }}>
                    Müşteri Profilini Gör →
                  </a>
                </div>
              )}

              {/* Hızlı İletişim Şablonları */}
              <div style={{ borderTop: "1px solid var(--c-border2)", paddingTop: 12, marginTop: 4 }}>
                <span style={{ fontSize: 10, color: "var(--c-dim)", fontWeight: 600, display: "block", textTransform: "uppercase", marginBottom: 8 }}>Hızlı Şablonlar</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {lead.phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, color: "var(--c-text2)", width: 20 }}>WA:</span>
                      <span style={{ fontSize: 11, color: "var(--c-text2)", flex: 1 }}>WhatsApp:</span>
                      <div style={{ display: "flex", gap: 4 }}>
                        <a href={getWhatsAppLink(lead.phone, "welcome", contName || compName, lead.title)} target="_blank" style={{
                          background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)",
                          padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, textDecoration: "none"
                        }}>Tanışma</a>
                        <a href={getWhatsAppLink(lead.phone, "followup", contName || compName, lead.title)} target="_blank" style={{
                          background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)",
                          padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, textDecoration: "none"
                        }}>Takip</a>
                        <a href={getWhatsAppLink(lead.phone, "reminder", contName || compName, lead.title)} target="_blank" style={{
                          background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)",
                          padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, textDecoration: "none"
                        }}>Hatırlat</a>
                      </div>
                    </div>
                  )}
                  {lead.email && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, color: "var(--c-text2)", width: 20 }}>E-posta:</span>
                      <span style={{ fontSize: 11, color: "var(--c-text2)", flex: 1 }}>E-posta:</span>
                      <div style={{ display: "flex", gap: 4 }}>
                        <a href={getEmailLink(lead.email, "welcome", contName || compName, lead.title)} target="_blank" style={{
                          background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)",
                          padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, textDecoration: "none"
                        }}>Tanışma</a>
                        <a href={getEmailLink(lead.email, "followup", contName || compName, lead.title)} target="_blank" style={{
                          background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)",
                          padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, textDecoration: "none"
                        }}>Takip</a>
                        <a href={getEmailLink(lead.email, "reminder", contName || compName, lead.title)} target="_blank" style={{
                          background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)",
                          padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, textDecoration: "none"
                        }}>Hatırlat</a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Kart: Bağlı Checkup Raporu */}
          {audit && (
            <div style={CARD}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--c-text)", textTransform: "uppercase" }}>
                  Bağlı Dijital Analiz Raporu
                </h3>
                <AuditPDFButton
                  audit={{
                    businessName: String(audit.business_name),
                    sector:       String(audit.sector),
                    phone:        String(audit.phone),
                    email:        String(audit.email),
                    createdAt:    String(audit.created_at),
                    reportText:   String(audit.report_text ?? ""),
                    scores: {
                      overall:   Number(audit.score_overall),
                      instagram: Number(audit.score_instagram),
                      linkedin:  Number(audit.score_linkedin),
                      youtube:   Number(audit.score_youtube),
                      google:    Number(audit.score_google),
                    }
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, textAlign: "center", marginBottom: 12 }}>
                <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--c-border)", borderRadius: 8, padding: 8 }}>
                  <div style={{ fontSize: 10, color: "var(--c-dim)", fontWeight: 600 }}>Genel Skor</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: scoreColor(Number(audit.score_overall)), marginTop: 3 }}>
                    {audit.score_overall}
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--c-border)", borderRadius: 8, padding: 8 }}>
                  <div style={{ fontSize: 10, color: "var(--c-dim)", fontWeight: 600 }}>Sektör</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--c-text)", marginTop: 6, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {audit.sector || "—"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "space-between" }}>
                {[
                  { label: "IG", val: audit.score_instagram },
                  { label: "LN", val: audit.score_linkedin },
                  { label: "YT", val: audit.score_youtube },
                  { label: "GO", val: audit.score_google }
                ].map(item => (
                  <div key={item.label} style={{ flex: "1 1 20%", textAlign: "center", background: "var(--c-surface2)", borderRadius: 6, padding: "4px 0" }}>
                    <div style={{ fontSize: 9, color: "var(--c-dim)", fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: scoreColor(Number(item.val)) }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kart 3: Fırsat Notu */}
          <div style={CARD}>
            <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "var(--c-text)", textTransform: "uppercase" }}>Görüşme Notları</h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--c-text2)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {lead.notes || "Henüz not eklenmemiş."}
            </p>
          </div>
        </div>

        {/* SAĞ SÜTUN: Sekmeler (Takipler & Teklifler) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Sekme Butonları */}
          <div style={{ display: "flex", gap: 10, borderBottom: "1px solid var(--c-border)", paddingBottom: 1 }}>
            <button
              onClick={() => setActiveTab("takipler")}
              style={{
                background: "transparent", border: "none", color: activeTab === "takipler" ? "#fb923c" : "var(--c-dim)",
                padding: "10px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                borderBottom: activeTab === "takipler" ? "2px solid #fb923c" : "none",
              }}
            >
              Görüşme Geçmişi ({followUps.length})
            </button>
            <button
              onClick={() => setActiveTab("toplantilar")}
              style={{
                background: "transparent", border: "none", color: activeTab === "toplantilar" ? "#a78bfa" : "var(--c-dim)",
                padding: "10px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                borderBottom: activeTab === "toplantilar" ? "2px solid #a78bfa" : "none",
              }}
            >
              Ön Görüşmeler ({meetings.length})
            </button>
            <button
              onClick={() => setActiveTab("teklifler")}
              style={{
                background: "transparent", border: "none", color: activeTab === "teklifler" ? "#6366f1" : "var(--c-dim)",
                padding: "10px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                borderBottom: activeTab === "teklifler" ? "2px solid #6366f1" : "none",
              }}
            >
              Hizmet Teklifleri ({teklifler.length})
            </button>
          </div>

          {/* TAB 1: TAKİPLER */}
          {activeTab === "takipler" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--c-dim)" }}>
                  Bu aday için planlanmış ve yapılmış takip aramaları, toplantılar.
                </span>
                {!lead.converted_client_id && (
                  <button onClick={() => setFollowUpModal(true)} style={{
                    background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.2)",
                    color: "#fb923c", padding: "6px 12px", borderRadius: 6, fontSize: 12,
                    fontWeight: 600, cursor: "pointer",
                  }}>
                    + Yeni Takip Ekle
                  </button>
                )}
              </div>

              {followUps.length === 0 ? (
                <div style={{ ...CARD, textAlign: "center", padding: "48px 0", color: "var(--c-dim)", fontSize: 13 }}>
                  Henüz takip kaydı oluşturulmamış.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {followUps.map(f => {
                    const typeInfo = FOLLOW_UP_TYPES[f.type] || { label: f.type, icon: "💬", color: "gray" };
                    return (
                      <div key={f.id} style={{
                        ...CARD, padding: "14px 18px", borderLeft: `4px solid ${f.completed ? "#10b981" : typeInfo.color}`,
                        background: f.completed ? "rgba(16,185,129,0.02)" : "var(--c-surface)",
                        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16,
                      }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          {/* Checkbox */}
                          {!lead.converted_client_id && (
                            <input
                              type="checkbox"
                              checked={f.completed}
                              onChange={() => handleToggleFollowUp(f.id, f.completed)}
                              style={{ width: 18, height: 18, accentColor: "#10b981", cursor: "pointer", marginTop: 2 }}
                            />
                          )}
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text)" }}>
                                {typeInfo.label}
                              </span>
                              <span style={{ fontSize: 11, color: "var(--c-dim)" }}>
                                {new Date(f.follow_up_date).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}
                              </span>
                              {f.completed ? (
                                <span style={{ fontSize: 10, color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>
                                  Tamamlandı
                                </span>
                              ) : (
                                <span style={{ fontSize: 10, color: "#fb923c", background: "rgba(251,146,60,0.1)", padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>
                                  Bekliyor
                                </span>
                              )}
                            </div>
                            {f.note && (
                              <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--c-text2)", lineHeight: 1.5 }}>
                                {f.note}
                              </p>
                            )}
                          </div>
                        </div>

                        {!lead.converted_client_id && (
                          <button onClick={() => handleDeleteFollowUp(f.id)} style={{
                            background: "transparent", border: "none", color: "#f87171",
                            cursor: "pointer", fontSize: 12, padding: "4px 8px", opacity: 0.8,
                            fontWeight: 600
                          }} title="Sil">
                            Sil
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ÖN GÖRÜŞMELER */}
          {activeTab === "toplantilar" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--c-dim)" }}>
                  Yüz yüze veya çevrim içi ihtiyaç analizi görüşmeleri.
                </span>
                {!lead.converted_client_id && (
                  <button onClick={() => setMeetingModal(true)} style={{
                    background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)",
                    color: "#a78bfa", padding: "6px 12px", borderRadius: 6, fontSize: 12,
                    fontWeight: 600, cursor: "pointer",
                  }}>
                    + Ön Görüşme Planla
                  </button>
                )}
              </div>

              {meetings.length === 0 ? (
                <div style={{ ...CARD, textAlign: "center", padding: "48px 0", color: "var(--c-dim)", fontSize: 13 }}>
                  Henüz ön görüşme kaydı oluşturulmamış.
                </div>
              ) : meetings.map(meeting => (
                <article key={meeting.id} style={{ ...CARD, padding: "18px 20px", borderLeft: "4px solid #a78bfa" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--c-text)" }}>{meeting.purpose || "Ön Görüşme"}</div>
                      <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 4 }}>
                        {new Date(meeting.meeting_at).toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" })}
                        {meeting.location ? ` · ${meeting.location}` : ""}
                      </div>
                    </div>
                    {!lead.converted_client_id && (
                      <button onClick={() => handleDeleteMeeting(meeting.id)} style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", fontSize: 11 }}>Sil</button>
                    )}
                  </div>
                  {meeting.participants?.length > 0 && <p style={{ fontSize: 12, color: "var(--c-text2)", margin: "12px 0 0" }}><strong>Katılımcılar:</strong> {meeting.participants.join(", ")}</p>}
                  {meeting.requested_services?.length > 0 && <p style={{ fontSize: 12, color: "var(--c-text2)", margin: "6px 0 0" }}><strong>Talep edilen hizmetler:</strong> {meeting.requested_services.join(", ")}</p>}
                  {meeting.current_problems && <p style={{ fontSize: 12, color: "var(--c-text2)", margin: "6px 0 0", whiteSpace: "pre-wrap" }}><strong>Mevcut sorunlar:</strong> {meeting.current_problems}</p>}
                  {meeting.expectations && <p style={{ fontSize: 12, color: "var(--c-text2)", margin: "6px 0 0", whiteSpace: "pre-wrap" }}><strong>Beklentiler:</strong> {meeting.expectations}</p>}
                  {meeting.estimated_monthly_budget != null && <div style={{ marginTop: 10, fontSize: 12, color: "#34d399", fontWeight: 700 }}>Tahmini aylık bütçe: ₺{fmt(Number(meeting.estimated_monthly_budget))}</div>}
                  {meeting.notes && <p style={{ fontSize: 12, color: "var(--c-dim)", margin: "10px 0 0", paddingTop: 10, borderTop: "1px solid var(--c-border)" }}>{meeting.notes}</p>}
                </article>
              ))}
            </div>
          )}

          {/* TAB 3: TEKLİFLER */}
          {activeTab === "teklifler" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--c-dim)" }}>
                  Adaya özel hazırlanan hizmet ve fiyatlandırma teklifleri.
                </span>
                {!lead.converted_client_id && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={handleCreatePackageBundle} disabled={isPending} style={{
                      background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)",
                      color: "#a78bfa", padding: "6px 12px", borderRadius: 6, fontSize: 12,
                      fontWeight: 600, cursor: isPending ? "wait" : "pointer",
                    }}>
                      Üç Paket Şablonu Oluştur
                    </button>
                    <button onClick={openAddTeklif} style={{
                      background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
                      color: "#6366f1", padding: "6px 12px", borderRadius: 6, fontSize: 12,
                      fontWeight: 600, cursor: "pointer",
                    }}>
                      + Teklif Oluştur
                    </button>
                  </div>
                )}
              </div>

              {comparisonOffers.length >= 2 && (
                <div style={{ ...CARD, padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--c-border)", fontSize: 13, fontWeight: 700, color: "var(--c-text)" }}>Paket Karşılaştırması</div>
                  <div style={{ display: "grid", gridTemplateColumns: `150px repeat(${comparisonOffers.length}, minmax(150px, 1fr))` }}>
                    <div style={{ padding: 12, background: "var(--c-surface2)" }} />
                    {comparisonOffers.map(item => (
                      <div key={item.id} style={{ padding: 12, background: item.package_level === "orta" ? "rgba(139,92,246,.08)" : "var(--c-surface2)", borderLeft: "1px solid var(--c-border)" }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: item.package_level === "orta" ? "#a78bfa" : "var(--c-text)" }}>{item.paket_adi}</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#34d399", marginTop: 4 }}>₺{fmt(item.tutar)}</div>
                      </div>
                    ))}
                    {[
                      { key: "post_count", label: "Aylık Post" },
                      { key: "video_count", label: "Aylık Video" },
                      { key: "shoot_day_count", label: "Çekim Günü" },
                      { key: "story_service", label: "Story Hizmeti" },
                      { key: "advertising_management", label: "Reklam Yönetimi" },
                      { key: "account_management", label: "Hesap Yönetimi" },
                      { key: "content_copy", label: "İçerik Metinleri" },
                      { key: "design_service", label: "Tasarım" },
                      { key: "video_editing", label: "Video Kurgu" },
                    ].map(row => (
                      <div key={row.key} style={{ display: "contents" }}>
                        <div style={{ padding: "9px 12px", fontSize: 11, color: "var(--c-text2)", borderTop: "1px solid var(--c-border)" }}>{row.label}</div>
                        {comparisonOffers.map(item => {
                          const value = item.package_details?.[row.key as keyof PackageDetails];
                          return <div key={`${item.id}-${row.key}`} style={{ padding: "9px 12px", fontSize: 12, textAlign: "center", color: typeof value === "boolean" ? (value ? "#34d399" : "var(--c-dim)") : "var(--c-text)", borderLeft: "1px solid var(--c-border)", borderTop: "1px solid var(--c-border)" }}>{typeof value === "boolean" ? (value ? "✓" : "—") : value ?? 0}</div>;
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {teklifler.length === 0 ? (
                <div style={{ ...CARD, textAlign: "center", padding: "48px 0", color: "var(--c-dim)", fontSize: 13 }}>
                  Henüz bir teklif hazırlanmamış.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {teklifler.map(t => {
                    const statusInfo = TEKLIF_STATUS_MAP[t.durum] || { label: t.durum, color: "gray", bg: "rgba(0,0,0,0.1)" };
                    return (
                      <div key={t.id} style={{
                        ...CARD, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 11, color: "var(--c-dim)", fontFamily: "monospace" }}>
                                {t.teklif_no || t.id.slice(0, 8).toUpperCase()}
                              </span>
                              <span style={{
                                fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
                                color: statusInfo.color, background: statusInfo.bg
                              }}>
                                {statusInfo.label}
                              </span>
                            </div>
                            <h4 style={{ margin: "6px 0 0", fontSize: 14, fontWeight: 700, color: "var(--c-text)" }}>
                              {t.paket_adi || t.baslik}
                            </h4>
                            {t.package_level && (
                              <div style={{ fontSize: 10, color: "#a78bfa", marginTop: 3, textTransform: "uppercase", fontWeight: 700 }}>
                                {t.package_level === "baslangic" ? "Başlangıç" : t.package_level === "orta" ? "Orta Seviye" : "İleri Seviye"}
                              </div>
                            )}
                            <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 2 }}>
                              Teklif Tarihi: {t.teklif_tarihi ? new Date(t.teklif_tarihi).toLocaleDateString("tr-TR") : "Belirtilmemiş"}
                            </div>
                          </div>

                          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--c-text)" }}>
                            ₺{fmt(t.tutar)}
                          </div>
                        </div>

                        {t.notlar && (
                          <p style={{ margin: 0, fontSize: 12, color: "var(--c-dim)", fontStyle: "italic" }}>
                            Not: {t.notlar}
                          </p>
                        )}
                        {t.rejection_reason && <p style={{ margin: 0, fontSize: 12, color: "#f87171" }}><strong>Ret nedeni:</strong> {t.rejection_reason}</p>}
                        {t.revision_reason && <p style={{ margin: 0, fontSize: 12, color: "#fb923c" }}><strong>Revize talebi:</strong> {t.revision_reason}</p>}

                        <div style={{ borderTop: "1px solid var(--c-border2)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          {/* Durum Güncelleme */}
                          {!lead.converted_client_id ? (
                            <select
                              value={t.durum}
                              onChange={e => handleTeklifStatusChange(t.id, e.target.value as any)}
                              style={{ ...INPUT, width: 140, padding: "4px 8px", fontSize: 11 }}
                            >
                              <option value="taslak">Taslak</option>
                              <option value="hazirlaniyor">Hazırlanıyor</option>
                              <option value="kontrol_bekliyor">Kontrol Bekliyor</option>
                              <option value="gonderildi">Gönderildi</option>
                              <option value="goruldu">Görüldü</option>
                              <option value="degerlendiriliyor">Değerlendiriliyor</option>
                              <option value="revize_istendi">Revize Teklif İstendi</option>
                              <option value="kabul_edildi">Kabul Edildi</option>
                              <option value="reddedildi">Reddedildi</option>
                              <option value="suresi_doldu">Süresi Doldu</option>
                            </select>
                          ) : <div />}

                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            {/* PDF İndir Butonu */}
                            <TeklifPDFButton teklif={t} musteriAd={compName} />
                            
                            {!lead.converted_client_id && (
                              <>
                                <button onClick={() => openEditTeklif(t)} style={{
                                  background: "transparent", border: "1px solid var(--c-border)",
                                  color: "var(--c-text)", padding: "4px 8px", borderRadius: 6,
                                  fontSize: 11, cursor: "pointer",
                                }}>
                                  Düzenle
                                </button>
                                <button onClick={() => setDeleteTargetTeklif(t)} style={{
                                  background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)",
                                  color: "#f87171", padding: "4px 8px", borderRadius: 6,
                                  fontSize: 11, cursor: "pointer",
                                }}>
                                  Sil
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 1. Müşteriye Dönüştürme Modalı ── */}
      {convertModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)",
        }}>
          <form onSubmit={handleConvertSubmit} style={{
            background: "var(--c-surface)", border: "1px solid var(--c-border)",
            borderRadius: 16, width: "100%", maxWidth: 440, padding: 24,
            boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", gap: 16,
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--c-text)" }}>
                Müşteriyi Aktifleştir
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--c-dim)", lineHeight: 1.4 }}>
                <strong>{compName}</strong> için sözleşme başlangıç detaylarını girin. Bu işlem sonucunda, müşteri portföyüne aktif bir müşteri kaydı eklenecek ve tüm teklif geçmişi bu profil altında korunacaktır.
              </p>
            </div>

            <div>
              <label style={LABEL}>Aylık Sözleşme Ücreti (TL) *</label>
              <input
                type="number"
                placeholder="Örn: 15000"
                value={convertForm.aylik_ucret}
                onChange={e => setConvertForm(f => ({ ...f, aylik_ucret: e.target.value }))}
                style={INPUT}
                required
              />
            </div>

            <div>
              <label style={LABEL}>Sözleşme Başlangıç Tarihi *</label>
              <DatePicker
                value={convertForm.baslangic_tarihi}
                onChange={val => setConvertForm(f => ({ ...f, baslangic_tarihi: val }))}
              />
            </div>

            <div>
              <label style={LABEL}>Hizmet Verilecek Platformlar</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "8px 0" }}>
                {PLATFORMS.map(p => (
                  <label key={p.key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--c-text2)", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={convertForm.platformlar.includes(p.key)}
                      onChange={() => setConvertForm(f => ({
                        ...f,
                        platformlar: f.platformlar.includes(p.key)
                          ? f.platformlar.filter(x => x !== p.key)
                          : [...f.platformlar, p.key]
                      }))}
                      style={{ cursor: "pointer" }}
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setConvertModal(false)}
                style={{
                  background: "transparent", border: "1px solid var(--c-border)",
                  color: "var(--c-text)", padding: "8px 16px", borderRadius: 8,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isPending}
                style={{
                  background: "#10b981", color: "#fff", border: "none",
                  padding: "8px 20px", borderRadius: 8, fontSize: 12,
                  fontWeight: 600, cursor: isPending ? "wait" : "pointer",
                }}
              >
                {isPending ? "Dönüştürülüyor..." : "Müşteri Yap"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── 2. Yeni Takip Ekleme Modalı ── */}
      {followUpModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)",
        }}>
          <form onSubmit={handleFollowUpSubmit} style={{
            background: "var(--c-surface)", border: "1px solid var(--c-border)",
            borderRadius: 16, width: "100%", maxWidth: 400, padding: 24,
            boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", gap: 16,
          }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--c-text)" }}>
              Yeni Takip Aktivitesi
            </h3>

            <div>
              <label style={LABEL}>Takip Tipi</label>
              <select
                value={followUpForm.type}
                onChange={e => setFollowUpForm(f => ({ ...f, type: e.target.value as any }))}
                style={INPUT}
              >
                {Object.entries(FOLLOW_UP_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={LABEL}>Planlanan Tarih</label>
              <DatePicker
                value={followUpForm.follow_up_date}
                onChange={val => setFollowUpForm(f => ({ ...f, follow_up_date: val }))}
              />
            </div>

            <div>
              <label style={LABEL}>Not</label>
              <textarea
                placeholder="Takip notu veya ne konuşulacak..."
                value={followUpForm.note}
                onChange={e => setFollowUpForm(f => ({ ...f, note: e.target.value }))}
                style={{ ...INPUT, height: 80, resize: "none" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setFollowUpModal(false)}
                style={{
                  background: "transparent", border: "1px solid var(--c-border)",
                  color: "var(--c-text)", padding: "8px 16px", borderRadius: 8,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isPending}
                style={{
                  background: "#fb923c", color: "#fff", border: "none",
                  padding: "8px 20px", borderRadius: 8, fontSize: 12,
                  fontWeight: 600, cursor: isPending ? "wait" : "pointer",
                }}
              >
                {isPending ? "Ekleniyor..." : "Ekle"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── 3. Ön Görüşme Modalı ── */}
      {meetingModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 110, backdropFilter: "blur(4px)", padding: 20,
        }}>
          <form onSubmit={handleMeetingSubmit} style={{
            background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 16,
            width: "100%", maxWidth: 720, padding: 26, maxHeight: "92vh", overflowY: "auto",
            display: "flex", flexDirection: "column", gap: 14,
          }}>
            <h3 style={{ margin: 0, fontSize: 16, color: "var(--c-text)" }}>Yeni Ön Görüşme</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={LABEL}>Tarih ve Saat *</label>
                <input type="datetime-local" value={meetingForm.meeting_at} onChange={e => setMeetingForm(f => ({ ...f, meeting_at: e.target.value }))} style={INPUT} required />
              </div>
              <div>
                <label style={LABEL}>Konum / Görüşme Bağlantısı</label>
                <input value={meetingForm.location} onChange={e => setMeetingForm(f => ({ ...f, location: e.target.value }))} style={INPUT} placeholder="Ofis, müşteri adresi veya Meet bağlantısı" />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={LABEL}>Görüşmenin Amacı *</label>
                <input value={meetingForm.purpose} onChange={e => setMeetingForm(f => ({ ...f, purpose: e.target.value }))} style={INPUT} required />
              </div>
              <div>
                <label style={LABEL}>Katılımcılar</label>
                <input value={meetingForm.participants} onChange={e => setMeetingForm(f => ({ ...f, participants: e.target.value }))} style={INPUT} placeholder="Virgülle ayırın" />
              </div>
              <div>
                <label style={LABEL}>Talep Edilen Hizmetler</label>
                <input value={meetingForm.requested_services} onChange={e => setMeetingForm(f => ({ ...f, requested_services: e.target.value }))} style={INPUT} placeholder="Virgülle ayırın" />
              </div>
              <div>
                <label style={LABEL}>Tahmini Aylık Bütçe (₺)</label>
                <input type="number" min="0" value={meetingForm.estimated_monthly_budget} onChange={e => setMeetingForm(f => ({ ...f, estimated_monthly_budget: e.target.value }))} style={INPUT} />
              </div>
              <div>
                <label style={LABEL}>Mevcut Sosyal Medya Hesapları</label>
                <input value={meetingForm.current_accounts} onChange={e => setMeetingForm(f => ({ ...f, current_accounts: e.target.value }))} style={INPUT} />
              </div>
              <div>
                <label style={LABEL}>Mevcut Sorunlar</label>
                <textarea value={meetingForm.current_problems} onChange={e => setMeetingForm(f => ({ ...f, current_problems: e.target.value }))} style={{ ...INPUT, height: 90, resize: "vertical" }} />
              </div>
              <div>
                <label style={LABEL}>Beklentiler</label>
                <textarea value={meetingForm.expectations} onChange={e => setMeetingForm(f => ({ ...f, expectations: e.target.value }))} style={{ ...INPUT, height: 90, resize: "vertical" }} />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={LABEL}>Görüşme Notları</label>
                <textarea value={meetingForm.notes} onChange={e => setMeetingForm(f => ({ ...f, notes: e.target.value }))} style={{ ...INPUT, height: 90, resize: "vertical" }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={() => setMeetingModal(false)} style={{ background: "transparent", border: "1px solid var(--c-border)", color: "var(--c-text)", padding: "9px 16px", borderRadius: 8, cursor: "pointer" }}>Vazgeç</button>
              <button type="submit" disabled={isPending} style={{ background: "#8b5cf6", border: "none", color: "#fff", padding: "9px 18px", borderRadius: 8, cursor: isPending ? "wait" : "pointer", fontWeight: 600 }}>{isPending ? "Kaydediliyor..." : "Görüşmeyi Kaydet"}</button>
            </div>
          </form>
        </div>
      )}

      {/* ── 4. Teklif Ekleme/Düzenleme Modalı ── */}
      {teklifModal.open && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)",
        }}>
          <form onSubmit={handleTeklifSubmit} style={{
            background: "var(--c-surface)", border: "1px solid var(--c-border)",
            borderRadius: 16, width: "100%", maxWidth: 560, padding: 28,
            boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", gap: 18,
            maxHeight: "90vh", overflowY: "auto",
          }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--c-text)" }}>
              {teklifModal.editing ? "Teklifi Düzenle" : "Yeni Teklif Hazırla"}
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={LABEL}>Teklif No *</label>
                <input
                  type="text"
                  value={teklifForm.teklif_no}
                  onChange={e => setTeklifForm(f => ({ ...f, teklif_no: e.target.value }))}
                  style={INPUT}
                  required
                />
              </div>

              <div>
                <label style={LABEL}>Paket Adı *</label>
                <input
                  type="text"
                  placeholder="Örn: Gold Sosyal Medya"
                  value={teklifForm.paket_adi}
                  onChange={e => setTeklifForm(f => ({ ...f, paket_adi: e.target.value }))}
                  style={INPUT}
                  required
                />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={LABEL}>Paket Seviyesi *</label>
                <select value={teklifForm.package_level} onChange={e => setTeklifForm(f => ({ ...f, package_level: e.target.value as "baslangic" | "orta" | "ileri" }))} style={INPUT}>
                  <option value="baslangic">Başlangıç Paketi</option>
                  <option value="orta">Orta Seviye Paket</option>
                  <option value="ileri">İleri Seviye Paket</option>
                </select>
              </div>

              <div>
                <label style={LABEL}>Aylık Post</label>
                <input type="number" min="0" value={teklifForm.package_details.post_count} onChange={e => setTeklifForm(f => ({ ...f, package_details: { ...f.package_details, post_count: Number(e.target.value) || 0 } }))} style={INPUT} />
              </div>
              <div>
                <label style={LABEL}>Aylık Video</label>
                <input type="number" min="0" value={teklifForm.package_details.video_count} onChange={e => setTeklifForm(f => ({ ...f, package_details: { ...f.package_details, video_count: Number(e.target.value) || 0 } }))} style={INPUT} />
              </div>
              <div>
                <label style={LABEL}>Aylık Çekim Günü</label>
                <input type="number" min="0" value={teklifForm.package_details.shoot_day_count} onChange={e => setTeklifForm(f => ({ ...f, package_details: { ...f.package_details, shoot_day_count: Number(e.target.value) || 0 } }))} style={INPUT} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  ["story_service", "Story hizmeti"], ["advertising_management", "Reklam yönetimi"],
                  ["account_management", "Hesap yönetimi"], ["content_copy", "İçerik metinleri"],
                  ["design_service", "Tasarım hizmeti"], ["video_editing", "Video kurgu"],
                ].map(([key, label]) => (
                  <label key={key} style={{ fontSize: 11, color: "var(--c-text2)" }}>
                    <input type="checkbox" checked={Boolean(teklifForm.package_details[key as keyof PackageDetails])} onChange={e => setTeklifForm(f => ({ ...f, package_details: { ...f.package_details, [key]: e.target.checked } }))} /> {label}
                  </label>
                ))}
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={LABEL}>Teklif Başlığı (Teklif çıktısında görünür)</label>
                <input
                  type="text"
                  placeholder="Örn: Sosyal Medya Danışmanlığı Hizmet Paketi"
                  value={teklifForm.baslik}
                  onChange={e => setTeklifForm(f => ({ ...f, baslik: e.target.value }))}
                  style={INPUT}
                />
              </div>

              <div>
                <label style={LABEL}>Aylık Hizmet Ücreti (TL)</label>
                <input
                  type="number"
                  placeholder="Örn: 20000"
                  value={teklifForm.tutar}
                  onChange={e => setTeklifForm(f => ({ ...f, tutar: e.target.value }))}
                  style={INPUT}
                />
              </div>

              <div>
                <label style={LABEL}>Kurulum / Kurulum Dışı Ücret (TL)</label>
                <input
                  type="number"
                  placeholder="Örn: 5000"
                  value={teklifForm.kurulum_ucreti}
                  onChange={e => setTeklifForm(f => ({ ...f, kurulum_ucreti: e.target.value }))}
                  style={INPUT}
                />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={LABEL}>Ek Hizmet Tanımları (Varsa)</label>
                <input
                  type="text"
                  placeholder="Örn: 1 adet kurumsal web sitesi entegrasyonu"
                  value={teklifForm.ek_hizmetler}
                  onChange={e => setTeklifForm(f => ({ ...f, ek_hizmetler: e.target.value }))}
                  style={INPUT}
                />
              </div>

              <div>
                <label style={LABEL}>Teklif Tarihi</label>
                <DatePicker
                  value={teklifForm.teklif_tarihi}
                  onChange={val => setTeklifForm(f => ({ ...f, teklif_tarihi: val }))}
                />
              </div>

              <div>
                <label style={LABEL}>Geçerlilik Son Tarihi</label>
                <DatePicker
                  value={teklifForm.gecerlilik_tarihi}
                  onChange={val => setTeklifForm(f => ({ ...f, gecerlilik_tarihi: val }))}
                />
              </div>
            </div>

            {/* Hizmet Satırları (Çoklu Hizmet Tanımı) */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={LABEL}>Teklife Dahil Ek Hizmet Detayları (PDF İçin)</label>
                <button type="button" onClick={addHizmetRow} style={{
                  background: "transparent", border: "none", color: "#6366f1",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>
                  + Satır Ekle
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {teklifForm.hizmetler.map((h, index) => (
                  <div key={index} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="text"
                      placeholder="Hizmet Detayı (Örn: Haftada 3 Reels)"
                      value={h.ad}
                      onChange={e => updateHizmetRow(index, "ad", e.target.value)}
                      style={{ ...INPUT, flex: 1 }}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Ücret (Fiyata dahil)"
                      value={h.fiyat === 0 ? "" : h.fiyat}
                      onChange={e => updateHizmetRow(index, "fiyat", e.target.value)}
                      style={{ ...INPUT, width: 120 }}
                    />
                    <button type="button" onClick={() => removeHizmetRow(index)} style={{
                      background: "transparent", border: "none", color: "#f87171", cursor: "pointer", fontSize: 12, fontWeight: 600
                    }}>
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={LABEL}>Teklif Notları (Örn: Ödeme Planı)</label>
              <textarea
                placeholder="Örn: Ödemeler 2 eşit taksitte peşin olarak tahsil edilir."
                value={teklifForm.notlar}
                onChange={e => setTeklifForm(f => ({ ...f, notlar: e.target.value }))}
                style={{ ...INPUT, height: 60, resize: "none" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setTeklifModal({ open: false, editing: null })}
                style={{
                  background: "transparent", border: "1px solid var(--c-border)",
                  color: "var(--c-text)", padding: "10px 20px", borderRadius: 8,
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={isPending}
                style={{
                  background: "#6366f1", color: "#fff", border: "none",
                  padding: "10px 24px", borderRadius: 8, fontSize: 13,
                  fontWeight: 600, cursor: isPending ? "wait" : "pointer",
                }}
              >
                {isPending ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── 4. Teklif Silme Onay Modalı ── */}
      {deleteTargetTeklif && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)",
        }}>
          <div style={{
            background: "var(--c-surface)", border: "1px solid var(--c-border)",
            borderRadius: 14, width: "100%", maxWidth: 400, padding: 24,
            boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", gap: 16,
          }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--c-text)" }}>
              Teklifi Sil
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--c-text2)", lineHeight: 1.5 }}>
              Bu teklif kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button
                onClick={() => setDeleteTargetTeklif(null)}
                style={{
                  background: "transparent", border: "1px solid var(--c-border)",
                  color: "var(--c-text)", padding: "8px 16px", borderRadius: 8,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}
              >
                İptal
              </button>
              <button
                onClick={handleTeklifDelete}
                disabled={isPending}
                style={{
                  background: "#ef4444", color: "#fff", border: "none",
                  padding: "8px 18px", borderRadius: 8, fontSize: 12,
                  fontWeight: 600, cursor: isPending ? "wait" : "pointer",
                }}
              >
                {isPending ? "Siliniyor..." : "Evet, Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Fırsat Düzenleme Modalı ── */}
      {editModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)",
        }}>
          <form onSubmit={handleLeadUpdate} style={{
            background: "var(--c-surface)", border: "1px solid var(--c-border)",
            borderRadius: 16, width: "100%", maxWidth: 600, padding: 28,
            boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", gap: 18,
            maxHeight: "90vh", overflowY: "auto",
          }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--c-text)" }}>
              Aday Bilgilerini Düzenle
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ gridColumn: "span 2" }}>
                <label style={LABEL}>Aday Tanımı *</label>
                <input
                  type="text"
                  value={leadForm.title}
                  onChange={e => setLeadForm(f => ({ ...f, title: e.target.value }))}
                  style={INPUT}
                  required
                />
              </div>

              <div>
                <label style={LABEL}>Kayıtlı Firma</label>
                <select
                  value={leadForm.company_id}
                  onChange={e => setLeadForm(f => ({ ...f, company_id: e.target.value, contact_id: "" }))}
                  style={INPUT}
                >
                  <option value="">-- Firma Seç --</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={LABEL}>Bağlı Yetkili Kişi</label>
                <select
                  value={leadForm.contact_id}
                  disabled={!leadForm.company_id}
                  onChange={e => setLeadForm(f => ({ ...f, contact_id: e.target.value }))}
                  style={INPUT}
                >
                  <option value="">-- Yetkili Seç --</option>
                  {filteredContactsForEdit.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {!leadForm.company_id && (
                <>
                  <div>
                    <label style={LABEL}>Firma Adı (Serbest Yazım)</label>
                    <input
                      type="text"
                      value={leadForm.company_name}
                      onChange={e => setLeadForm(f => ({ ...f, company_name: e.target.value }))}
                      style={INPUT}
                    />
                  </div>
                  <div>
                    <label style={LABEL}>Yetkili Kişi (Serbest Yazım)</label>
                    <input
                      type="text"
                      value={leadForm.contact_name}
                      onChange={e => setLeadForm(f => ({ ...f, contact_name: e.target.value }))}
                      style={INPUT}
                    />
                  </div>
                </>
              )}

              <div>
                <label style={LABEL}>Telefon</label>
                <input
                  type="text"
                  value={leadForm.phone}
                  onChange={e => setLeadForm(f => ({ ...f, phone: e.target.value }))}
                  style={INPUT}
                />
              </div>

              <div>
                <label style={LABEL}>E-posta</label>
                <input
                  type="email"
                  value={leadForm.email}
                  onChange={e => setLeadForm(f => ({ ...f, email: e.target.value }))}
                  style={INPUT}
                />
              </div>

              <div>
                <label style={LABEL}>Instagram Hesabı</label>
                <input
                  type="text"
                  value={leadForm.instagram}
                  onChange={e => setLeadForm(f => ({ ...f, instagram: e.target.value }))}
                  style={INPUT}
                />
              </div>

              <div>
                <label style={LABEL}>Website</label>
                <input
                  type="text"
                  value={leadForm.website}
                  onChange={e => setLeadForm(f => ({ ...f, website: e.target.value }))}
                  style={INPUT}
                />
              </div>

              <div>
                <label style={LABEL}>Sektör</label>
                <select
                  value={leadForm.sector}
                  onChange={e => setLeadForm(f => ({ ...f, sector: e.target.value }))}
                  style={INPUT}
                >
                  <option value="">-- Seçiniz --</option>
                  {SECTORS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={LABEL}>Sorumlu Kullanıcı</label>
                <select
                  value={leadForm.assigned_user}
                  onChange={e => setLeadForm(f => ({ ...f, assigned_user: e.target.value }))}
                  style={INPUT}
                >
                  <option value="">-- Seçiniz --</option>
                  {users.map(u => (
                    <option key={u.username} value={u.username}>{u.username}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={LABEL}>Aday Kaynağı</label>
                <select
                  value={leadForm.source}
                  onChange={e => setLeadForm(f => ({ ...f, source: e.target.value as any }))}
                  style={INPUT}
                >
                  {Object.entries(SOURCE_MAP).map(([key, val]) => (
                    <option key={key} value={key}>{val}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={LABEL}>Durum</label>
                <select
                  value={leadForm.status}
                  onChange={e => setLeadForm(f => ({ ...f, status: e.target.value as any }))}
                  style={INPUT}
                >
                  {Object.entries(STATUS_MAP).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={LABEL}>Aday Skoru ({leadForm.score})</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={leadForm.score}
                  onChange={e => setLeadForm(f => ({ ...f, score: e.target.value }))}
                  style={{ width: "100%", height: 36, accentColor: "#ef4444" }}
                />
              </div>

              <div>
                <label style={LABEL}>Sonraki Takip Tarihi</label>
                <DatePicker
                  value={leadForm.next_follow_up_date}
                  onChange={val => setLeadForm(f => ({ ...f, next_follow_up_date: val }))}
                />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={LABEL}>Notlar</label>
                <textarea
                  value={leadForm.notes}
                  onChange={e => setLeadForm(f => ({ ...f, notes: e.target.value }))}
                  style={{ ...INPUT, height: 80, resize: "vertical" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setEditModal(false)}
                style={{
                  background: "transparent", border: "1px solid var(--c-border)",
                  color: "var(--c-text)", padding: "10px 20px", borderRadius: 8,
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={isPending}
                style={{
                  background: "#ef4444", color: "#fff", border: "none",
                  padding: "10px 24px", borderRadius: 8, fontSize: 13,
                  fontWeight: 600, cursor: isPending ? "wait" : "pointer",
                }}
              >
                Kaydet
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
