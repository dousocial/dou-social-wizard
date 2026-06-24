"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addMusteri, updateMusteri, deleteMusteri } from "@/lib/actions/musteriler";
import { addLead, updateLead, deleteLead } from "@/lib/actions/crmLeads";
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

type PrefillData = {
  type: "audit" | "contact";
  id: string;
  title: string;
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  sector?: string;
  source?: any;
  notes?: string;
} | null;

type Company = { id: string; name: string };
type Contact = { id: string; name: string; company_id: string | null };
type User = { id: string; username: string; role: string };

const DURUM: Record<string, { label: string; color: string; bg: string; border: string }> = {
  aktif:      { label: "Aktif",      color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)" },
  pasif:      { label: "Pasif",      color: "#64748b", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.3)" },
  potansiyel: { label: "Potansiyel", color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)" },
};

const LEAD_STATUS_MAP: Record<Lead["status"], { label: string; color: string; bg: string; border: string }> = {
  yeni:              { label: "Yeni",             color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.3)" },
  gorusuldu:         { label: "Görüşüldü",        color: "#c084fc", bg: "rgba(192,132,252,0.12)", border: "rgba(192,132,252,0.3)" },
  teklif_istendi:    { label: "Teklif İstendi",   color: "#fb7185", bg: "rgba(251,113,133,0.12)", border: "rgba(251,113,133,0.3)" },
  teklif_gonderildi: { label: "Teklif İletildi",  color: "#2dd4bf", bg: "rgba(45,212,191,0.12)",  border: "rgba(45,212,191,0.3)" },
  takipte:           { label: "Takipte",          color: "#fb923c", bg: "rgba(251,146,60,0.12)",  border: "rgba(251,146,60,0.3)" },
  kazanildi:         { label: "Kazanıldı",        color: "#4ade80", bg: "rgba(74,222,128,0.12)",  border: "rgba(74,222,128,0.3)" },
  kaybedildi:        { label: "Kaybedildi",       color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)" },
};

const LEAD_SOURCE_MAP: Record<Lead["source"], string> = {
  referans: "Referans",
  instagram: "Instagram",
  google_maps: "Google Maps",
  inbound: "Gelen Arama/Web",
  manuel: "Manuel",
  diger: "Diğer",
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

const SECTORS = [
  "E-ticaret",
  "Sağlık / Klinik",
  "Güzellik / Estetik",
  "Restoran / Cafe",
  "Eğitim / Akademi",
  "B2B / Yazılım",
  "İnşaat / Mimarlık",
  "Tekstil / Moda",
  "Turizm / Otel",
  "Diğer",
];

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

type CustomerModalState = { open: false } | { open: true; editing: Musteri | null };
type LeadModalState = { open: false } | { open: true; editing: Lead | null };

const EMPTY_CUSTOMER_FORM = {
  ad: "", sektor: "", website: "", email: "", telefon: "",
  sorumlu: "", durum: "aktif", aylik_ucret: "", baslangic_tarihi: "", notlar: "",
  platformlar: [] as string[],
  sozlesme_bitis_tarihi: "", yenileme_hatirlatma_gun: "30",
};

const EMPTY_LEAD_FORM = {
  title: "", company_id: "", contact_id: "", company_name: "",
  contact_name: "", phone: "", email: "", instagram: "",
  website: "", sector: "", source: "manuel", status: "yeni",
  score: "50", notes: "", assigned_user: "", next_follow_up_date: "",
  audit_id: "", source_contact_id: "",
};

function validateCustomer(form: typeof EMPTY_CUSTOMER_FORM) {
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

export function MusterilerClient({
  initialMusteriler, leads, companies, contacts, users, prefill, initialTab
}: {
  initialMusteriler: Musteri[]; leads: Lead[]; companies: Company[]; contacts: Contact[]; users: User[]; prefill?: PrefillData; initialTab: string;
}) {
  const router = useRouter();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<"aktif" | "adaylar" | "pasif">("aktif");

  // Customer UI states
  const [custModal, setCustModal] = useState<CustomerModalState>({ open: false });
  const [deleteTargetCustomer, setDeleteTargetCustomer] = useState<Musteri | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerForm, setCustomerForm] = useState(EMPTY_CUSTOMER_FORM);
  const [custError, setCustError] = useState("");

  // Lead UI states
  const [leadModal, setLeadModal] = useState<LeadModalState>({ open: false });
  const [deleteTargetLead, setDeleteTargetLead] = useState<Lead | null>(null);
  const [leadSearch, setLeadSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");
  const [leadSourceFilter, setLeadSourceFilter] = useState("all");
  const [leadSectorFilter, setLeadSectorFilter] = useState("all");
  const [leadUserFilter, setLeadUserFilter] = useState("all");
  const [leadForm, setLeadForm] = useState(EMPTY_LEAD_FORM);
  const [leadError, setLeadError] = useState("");
  const [scoreIsDirty, setScoreIsDirty] = useState(false);
  const [leadViewMode, setLeadViewMode] = useState<"list" | "kanban">("list");

  // Global loading
  const [isPending, setIsPending] = useState(false);

  // Set active tab based on query param or prefill
  useEffect(() => {
    if (prefill) {
      setActiveTab("adaylar");
    } else if (initialTab && (initialTab === "aktif" || initialTab === "adaylar" || initialTab === "pasif")) {
      setActiveTab(initialTab as any);
    }
  }, [initialTab, prefill]);

  // Load view mode preference for Leads
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("leads-view-mode") as "list" | "kanban" | null;
      if (saved) setLeadViewMode(saved);
    }
  }, []);

  // Sync tab change to URL search params (instantly without reloading)
  const handleTabChange = (tab: "aktif" | "adaylar" | "pasif") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  };

  // Prefill handling for Leads
  useEffect(() => {
    if (prefill) {
      setLeadForm({
        title: prefill.title,
        company_id: "",
        contact_id: "",
        company_name: prefill.company_name || "",
        contact_name: prefill.contact_name || "",
        phone: prefill.phone || "",
        email: prefill.email || "",
        instagram: "",
        website: "",
        sector: prefill.sector || "",
        source: prefill.source || "inbound",
        status: "yeni",
        score: "50",
        notes: prefill.notes || "",
        assigned_user: "",
        next_follow_up_date: "",
        audit_id: prefill.type === "audit" ? prefill.id : "",
        source_contact_id: prefill.type === "contact" ? prefill.id : "",
      });
      setScoreIsDirty(false);
      setLeadModal({ open: true, editing: null });

      // Clean URL params after processing
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("convert_audit");
        url.searchParams.delete("convert_contact");
        window.history.replaceState({}, "", url.pathname + url.search);
      }
    }
  }, [prefill]);

  // Lead score calculator
  const calculateSuggestedScore = (f: typeof EMPTY_LEAD_FORM) => {
    let sc = 10; // Base score
    if (f.phone) sc += 15;
    if (f.email) sc += 10;
    if (f.instagram) sc += 15;
    if (f.company_name || f.company_id) sc += 10;
    if (f.website) sc += 5;
    if (f.source === "inbound" || f.source === "referans") sc += 25;
    else if (f.source === "instagram" || f.source === "google_maps") sc += 15;
    else if (f.source === "manuel") sc += 10;
    else sc += 5;
    if (f.assigned_user) sc += 5;
    if (f.notes && f.notes.trim().length > 10) sc += 5;
    return Math.min(sc, 100);
  };

  useEffect(() => {
    const isEditing = leadModal.open ? leadModal.editing : null;
    if (!scoreIsDirty && !isEditing) {
      const suggested = calculateSuggestedScore(leadForm);
      if (leadForm.score !== String(suggested)) {
        setLeadForm(f => ({ ...f, score: String(suggested) }));
      }
    }
  }, [
    leadForm.phone, leadForm.email, leadForm.instagram, leadForm.company_name,
    leadForm.company_id, leadForm.website, leadForm.source, leadForm.assigned_user,
    leadForm.notes, scoreIsDirty, leadModal.open
  ]);

  // Memoized stats
  const stats = useMemo(() => {
    const aktif = initialMusteriler.filter((m) => m.durum === "aktif");
    const pasif = initialMusteriler.filter((m) => m.durum === "pasif");
    const wonLeads = leads.filter(l => l.status === "kazanildi");

    return {
      aktif: aktif.length,
      pasif: pasif.length,
      adaylar: leads.length,
      gelir: aktif.reduce((s, m) => s + (m.aylik_ucret || 0), 0),
      conversionRate: leads.length ? Math.round((wonLeads.length / leads.length) * 100) : 0,
    };
  }, [initialMusteriler, leads]);

  // Filtered Clients (Aktif / Pasif)
  const filteredCustomers = useMemo(() => {
    const q = customerSearch.toLowerCase();
    const filterDurum = activeTab === "pasif" ? "pasif" : "aktif";
    return initialMusteriler
      .filter((m) => m.durum === filterDurum)
      .filter((m) =>
        m.ad.toLowerCase().includes(q) ||
        m.sektor.toLowerCase().includes(q) ||
        (m.sorumlu || "").toLowerCase().includes(q) ||
        (m.telefon || "").includes(q)
      );
  }, [initialMusteriler, customerSearch, activeTab]);

  // Filtered CRM Leads
  const filteredLeads = useMemo(() => {
    const q = leadSearch.toLowerCase();
    return leads
      .filter(l => leadStatusFilter === "all" || l.status === leadStatusFilter)
      .filter(l => leadSourceFilter === "all" || l.source === leadSourceFilter)
      .filter(l => leadSectorFilter === "all" || l.sector === leadSectorFilter)
      .filter(l => leadUserFilter === "all" || l.assigned_user === leadUserFilter)
      .filter(l =>
        l.title.toLowerCase().includes(q) ||
        (l.company_name || "").toLowerCase().includes(q) ||
        (l.contact_name || "").toLowerCase().includes(q) ||
        (l.phone || "").includes(q) ||
        (l.sector || "").toLowerCase().includes(q)
      );
  }, [leads, leadSearch, leadStatusFilter, leadSourceFilter, leadSectorFilter, leadUserFilter]);

  // Contacts filtered by selected company (For Lead Form select)
  const filteredContactsForForm = useMemo(() => {
    if (!leadForm.company_id) return [];
    return contacts.filter(c => c.company_id === leadForm.company_id);
  }, [leadForm.company_id, contacts]);

  // ── Customer CRUD Operations ──
  function openAddCustomer() {
    setCustomerForm({
      ...EMPTY_CUSTOMER_FORM,
      durum: activeTab === "pasif" ? "pasif" : "aktif",
      baslangic_tarihi: new Date().toISOString().split("T")[0]
    });
    setCustError("");
    setCustModal({ open: true, editing: null });
  }

  function openEditCustomer(m: Musteri) {
    setCustomerForm({
      ad: m.ad, sektor: m.sektor, website: m.website || "",
      email: m.email || "", telefon: m.telefon || "",
      sorumlu: m.sorumlu || "", durum: m.durum,
      aylik_ucret: m.aylik_ucret ? String(m.aylik_ucret) : "",
      baslangic_tarihi: m.baslangic_tarihi || "", notlar: m.notlar || "",
      platformlar: m.platformlar || [],
      sozlesme_bitis_tarihi: m.sozlesme_bitis_tarihi || "",
      yenileme_hatirlatma_gun: m.yenileme_hatirlatma_gun ? String(m.yenileme_hatirlatma_gun) : "30",
    });
    setCustError("");
    setCustModal({ open: true, editing: m });
  }

  function toggleCustomerPlatform(key: string) {
    setCustomerForm((f) => ({
      ...f,
      platformlar: f.platformlar.includes(key)
        ? f.platformlar.filter((p) => p !== key)
        : [...f.platformlar, key],
    }));
  }

  async function handleCustomerSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateCustomer(customerForm);
    if (err) { setCustError(err); return; }

    const data = {
      ad: customerForm.ad.trim(), sektor: customerForm.sektor.trim(),
      website: customerForm.website.trim(), email: customerForm.email.trim(),
      telefon: customerForm.telefon.trim(), sorumlu: customerForm.sorumlu.trim(),
      durum: customerForm.durum, platformlar: customerForm.platformlar,
      aylik_ucret: parseFloat(customerForm.aylik_ucret) || 0,
      baslangic_tarihi: customerForm.baslangic_tarihi || null,
      notlar: customerForm.notlar.trim(),
      sozlesme_bitis_tarihi: customerForm.sozlesme_bitis_tarihi || null,
      yenileme_hatirlatma_gun: parseInt(customerForm.yenileme_hatirlatma_gun) || 30,
    };

    setCustError("");
    setIsPending(true);
    const result = custModal.open && custModal.editing
      ? await updateMusteri(custModal.editing.id, data)
      : await addMusteri(data);
    setIsPending(false);
    
    if (result.error) { setCustError(result.error); }
    else { setCustModal({ open: false }); router.refresh(); }
  }

  async function handleCustomerDelete() {
    if (!deleteTargetCustomer) return;
    setIsPending(true);
    const result = await deleteMusteri(deleteTargetCustomer.id);
    setIsPending(false);
    if (!result.error) { setDeleteTargetCustomer(null); router.refresh(); }
  }

  // ── Lead CRUD Operations ──
  function openAddLead() {
    setLeadForm(EMPTY_LEAD_FORM);
    setLeadError("");
    setScoreIsDirty(false);
    setLeadModal({ open: true, editing: null });
  }

  function openEditLead(l: Lead) {
    setLeadForm({
      title: l.title,
      company_id: l.company_id || "",
      contact_id: l.contact_id || "",
      company_name: l.company_name || "",
      contact_name: l.contact_name || "",
      phone: l.phone || "",
      email: l.email || "",
      instagram: l.instagram || "",
      website: l.website || "",
      sector: l.sector || "",
      source: l.source,
      status: l.status,
      score: String(l.score ?? 50),
      notes: l.notes || "",
      assigned_user: l.assigned_user || "",
      next_follow_up_date: l.next_follow_up_date || "",
      audit_id: l.audit_id || "",
      source_contact_id: l.source_contact_id || "",
    });
    setLeadError("");
    setScoreIsDirty(true);
    setLeadModal({ open: true, editing: l });
  }

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadForm.title.trim()) { setLeadError("Aday Tanımı / Başlık zorunludur."); return; }

    const inputData = {
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
      source: leadForm.source as Lead["source"],
      status: leadForm.status as Lead["status"],
      score: parseInt(leadForm.score) || 0,
      notes: leadForm.notes.trim(),
      assigned_user: leadForm.assigned_user,
      next_follow_up_date: leadForm.next_follow_up_date || null,
      audit_id: leadForm.audit_id || null,
      source_contact_id: leadForm.source_contact_id || null,
    };

    setLeadError("");
    setIsPending(true);
    const result = leadModal.open && leadModal.editing
      ? await updateLead(leadModal.editing.id, inputData)
      : await addLead(inputData);
    setIsPending(false);

    if (result.error) {
      setLeadError(result.error);
    } else {
      setLeadModal({ open: false });
      router.refresh();
    }
  }

  async function handleLeadDelete() {
    if (!deleteTargetLead) return;
    setIsPending(true);
    const result = await deleteLead(deleteTargetLead.id);
    setIsPending(false);
    if (!result.error) {
      setDeleteTargetLead(null);
      router.refresh();
    }
  }

  // Kanban Drag and Drop Handler
  async function handleKanbanDrop(e: React.DragEvent, targetStatus: Lead["status"]) {
    const leadId = e.dataTransfer.getData("text/plain");
    if (!leadId) return;

    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    if (lead.status === targetStatus) return;

    const result = await updateLead(leadId, { status: targetStatus });
    if (!result.error) {
      if (targetStatus === "kazanildi") {
        router.push(`/yonetim/crm-leads/${leadId}?convert=true`);
      } else {
        router.refresh();
      }
    }
  }

  // Stat card setups
  const statsList = useMemo(() => {
    if (activeTab === "adaylar") {
      return [
        {
          label: "Toplam Aday", value: stats.adaylar,
          icon: Icons.users, color: "#fb923c",
          border: "rgba(251,146,96,0.3)", gradient: "linear-gradient(135deg, rgba(251,146,96,0.18) 0%, rgba(249,115,22,0.06) 100%)",
          bg: "rgba(251,146,96,0.12)",
        },
        {
          label: "Süreçteki Adaylar", value: leads.filter(l => !["kazanildi", "kaybedildi"].includes(l.status)).length,
          icon: Icons.star, color: "#a78bfa",
          border: "rgba(167,139,250,0.3)", gradient: "linear-gradient(135deg, rgba(167,139,250,0.18) 0%, rgba(139,92,246,0.06) 100%)",
          bg: "rgba(167,139,250,0.12)",
        },
        {
          label: "Kazanılan", value: leads.filter(l => l.status === "kazanildi").length,
          icon: Icons.check, color: "#34d399",
          border: "rgba(52,211,153,0.3)", gradient: "linear-gradient(135deg, rgba(52,211,153,0.18) 0%, rgba(16,185,129,0.06) 100%)",
          bg: "rgba(52,211,153,0.12)",
        },
        {
          label: "Dönüşüm Oranı", value: `%${stats.conversionRate}`,
          icon: Icons.money, color: "#60a5fa",
          border: "rgba(96,165,250,0.3)", gradient: "linear-gradient(135deg, rgba(96,165,250,0.18) 0%, rgba(59,130,246,0.06) 100%)",
          bg: "rgba(96,165,250,0.12)",
        },
      ];
    } else {
      return [
        {
          label: activeTab === "pasif" ? "Pasif Müşteri" : "Aktif Müşteri", value: activeTab === "pasif" ? stats.pasif : stats.aktif,
          icon: Icons.users, color: activeTab === "pasif" ? "#64748b" : "#34d399",
          border: activeTab === "pasif" ? "rgba(100,116,139,0.3)" : "rgba(52,211,153,0.3)",
          gradient: activeTab === "pasif" 
            ? "linear-gradient(135deg, rgba(100,116,139,0.18) 0%, rgba(71,85,105,0.06) 100%)" 
            : "linear-gradient(135deg, rgba(52,211,153,0.18) 0%, rgba(16,185,129,0.06) 100%)",
          bg: activeTab === "pasif" ? "rgba(100,116,139,0.12)" : "rgba(52,211,153,0.12)",
        },
        {
          label: "Aylık Gelir Hacmi", value: `₺${fmt(stats.gelir)}`,
          icon: Icons.money, color: "#60a5fa",
          border: "rgba(96,165,250,0.3)", gradient: "linear-gradient(135deg, rgba(96,165,250,0.18) 0%, rgba(59,130,246,0.06) 100%)",
          bg: "rgba(96,165,250,0.12)",
        },
      ];
    }
  }, [activeTab, stats, leads]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--c-text)", letterSpacing: "-0.03em" }}>
            Müşteriler & CRM
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--c-dim)" }}>
            Müşteri ilişkileri, potansiyel adaylar ve sözleşmeler
          </p>
        </div>

        {activeTab === "adaylar" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* View Mode Switcher for Leads */}
            <div style={{ display: "flex", background: "var(--c-border)", borderRadius: 8, padding: 3, gap: 2 }}>
              <button
                onClick={() => { setLeadViewMode("list"); localStorage.setItem("leads-view-mode", "list"); }}
                style={{
                  background: leadViewMode === "list" ? "var(--c-surface)" : "none",
                  color: leadViewMode === "list" ? "var(--c-text)" : "var(--c-dim)",
                  border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.15s"
                }}
              >
                Liste
              </button>
              <button
                onClick={() => { setLeadViewMode("kanban"); localStorage.setItem("leads-view-mode", "kanban"); }}
                style={{
                  background: leadViewMode === "kanban" ? "var(--c-surface)" : "none",
                  color: leadViewMode === "kanban" ? "var(--c-text)" : "var(--c-dim)",
                  border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.15s"
                }}
              >
                Aşama
              </button>
            </div>
            <button onClick={openAddLead} style={{
              padding: "10px 20px", borderRadius: 9, background: "#ef4444", color: "#fff",
              border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 7,
              boxShadow: "0 4px 14px rgba(239,68,68,0.35)",
            }}>
              <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14 }}>
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Yeni Aday Ekle
            </button>
          </div>
        ) : (
          <button onClick={openAddCustomer} style={{
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
        )}
      </div>

      {/* ── Tabs Navigation ── */}
      <div style={{ display: "flex", gap: 6, borderBottom: "1px solid var(--c-border)", paddingBottom: 0 }}>
        {[
          { key: "aktif", label: "Aktif Müşteriler", count: stats.aktif },
          { key: "adaylar", label: "Müşteri Adayları (CRM)", count: stats.adaylar },
          { key: "pasif", label: "Pasif Müşteriler", count: stats.pasif },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key as any)}
            style={{
              padding: "10px 20px",
              background: "none",
              border: "none",
              borderBottom: activeTab === t.key ? "2px solid #ef4444" : "2px solid transparent",
              color: activeTab === t.key ? "var(--c-text)" : "var(--c-dim)",
              fontSize: 13,
              fontWeight: activeTab === t.key ? 700 : 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s",
              marginBottom: -1,
            }}
          >
            {t.label}
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              background: activeTab === t.key ? "rgba(239,68,68,0.15)" : "var(--c-border)",
              color: activeTab === t.key ? "#ef4444" : "var(--c-dim)",
              padding: "2px 6px",
              borderRadius: 50,
            }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${statsList.length}, 1fr)`, gap: 14 }}>
        {statsList.map((s) => (
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

      {/* ── Tab Content: CRM Adayları (Leads) ── */}
      {activeTab === "adaylar" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Filters card */}
          <div style={{ ...CARD, padding: "16px 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 200px 180px 180px 180px", gap: 12 }}>
              <input
                type="text"
                placeholder="Başlık, firma, yetkili veya telefon ara..."
                value={leadSearch}
                onChange={e => setLeadSearch(e.target.value)}
                style={INPUT}
              />
              <select value={leadStatusFilter} onChange={e => setLeadStatusFilter(e.target.value)} style={INPUT}>
                <option value="all">Tüm Aşamalar</option>
                {Object.entries(LEAD_STATUS_MAP).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
              <select value={leadSourceFilter} onChange={e => setLeadSourceFilter(e.target.value)} style={INPUT}>
                <option value="all">Tüm Kanallar</option>
                {Object.entries(LEAD_SOURCE_MAP).map(([key, val]) => (
                  <option key={key} value={key}>{val}</option>
                ))}
              </select>
              <select value={leadSectorFilter} onChange={e => setLeadSectorFilter(e.target.value)} style={INPUT}>
                <option value="all">Tüm Sektörler</option>
                {SECTORS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select value={leadUserFilter} onChange={e => setLeadUserFilter(e.target.value)} style={INPUT}>
                <option value="all">Tüm Sorumlular</option>
                {users.map(u => (
                  <option key={u.username} value={u.username}>{u.username}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Kanban / List rendering */}
          {leadViewMode === "list" ? (
            <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid var(--c-border)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, background: "var(--c-surface)" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                    <th style={{ padding: "12px 16px", fontSize: 10, fontWeight: 700, color: "var(--c-dim)", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.08em" }}>Aday Tanımı</th>
                    <th style={{ padding: "12px 16px", fontSize: 10, fontWeight: 700, color: "var(--c-dim)", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.08em" }}>Firma / Kişi</th>
                    <th style={{ padding: "12px 16px", fontSize: 10, fontWeight: 700, color: "var(--c-dim)", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.08em" }}>İletişim</th>
                    <th style={{ padding: "12px 16px", fontSize: 10, fontWeight: 700, color: "var(--c-dim)", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.08em" }}>Puan</th>
                    <th style={{ padding: "12px 16px", fontSize: 10, fontWeight: 700, color: "var(--c-dim)", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.08em" }}>Kanal</th>
                    <th style={{ padding: "12px 16px", fontSize: 10, fontWeight: 700, color: "var(--c-dim)", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.08em" }}>Aşama</th>
                    <th style={{ padding: "12px 16px", fontSize: 10, fontWeight: 700, color: "var(--c-dim)", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.08em" }}>Sonraki Takip</th>
                    <th style={{ padding: "12px 16px", fontSize: 10, fontWeight: 700, color: "var(--c-dim)", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.08em" }}>Sorumlu</th>
                    <th style={{ padding: "12px 16px", fontSize: 10, fontWeight: 700, color: "var(--c-dim)", textAlign: "right", textTransform: "uppercase", letterSpacing: "0.08em" }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: "center", padding: "48px 0", color: "var(--c-dim)" }}>
                        Aranan kriterlere uygun aday kaydı bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((l) => {
                      const compObj = companies.find(c => c.id === l.company_id);
                      const contObj = contacts.find(c => c.id === l.contact_id);
                      const compName = compObj?.name || l.company_name || "—";
                      const contName = contObj?.name || l.contact_name || "—";
                      const stat = LEAD_STATUS_MAP[l.status] || { label: l.status, color: "gray", bg: "rgba(0,0,0,0.1)", border: "none" };

                      return (
                        <tr key={l.id} style={{ borderTop: "1px solid var(--c-border)", cursor: "pointer", transition: "background 0.15s" }}
                            onClick={() => router.push(`/yonetim/crm-leads/${l.id}`)}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ fontWeight: 600, color: "var(--c-text)" }}>{l.title}</div>
                            <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 2 }}>{l.sector || "Sektör Belirtilmemiş"}</div>
                          </td>
                          
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ fontWeight: 550, color: "var(--c-text2)" }}>{compName}</div>
                            {contName && <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 2 }}>{contName}</div>}
                          </td>

                          <td style={{ padding: "14px 16px" }} onClick={e => e.stopPropagation()}>
                            {l.phone && <a href={`tel:${l.phone}`} style={{ color: "#f87171", textDecoration: "none", fontSize: 12, display: "block" }}>{l.phone}</a>}
                            {l.email && <a href={`mailto:${l.email}`} style={{ color: "var(--c-dim)", textDecoration: "none", fontSize: 11, display: "block", marginTop: 2 }}>{l.email}</a>}
                          </td>

                          <td style={{ padding: "14px 16px", textAlign: "center" }}>
                            <span style={{
                              fontSize: 11, fontWeight: 700,
                              color: l.score >= 70 ? "#4ade80" : l.score >= 40 ? "#fbbf24" : "#f87171",
                              background: l.score >= 70 ? "rgba(74,222,128,0.1)" : l.score >= 40 ? "rgba(251,191,36,0.1)" : "rgba(248,113,113,0.1)",
                              padding: "2px 6px", borderRadius: 4
                            }}>
                              {l.score}
                            </span>
                          </td>

                          <td style={{ padding: "14px 16px", color: "var(--c-text3)" }}>
                            {LEAD_SOURCE_MAP[l.source] || l.source}
                          </td>

                          <td style={{ padding: "14px 16px" }}>
                            <span style={{
                              fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                              color: stat.color, background: stat.bg, border: `1px solid ${stat.border}`
                            }}>
                              {stat.label}
                            </span>
                          </td>

                          <td style={{ padding: "14px 16px", color: "var(--c-text2)" }}>
                            {l.next_follow_up_date ? (
                              <span style={{ fontSize: 12, color: new Date(l.next_follow_up_date) <= new Date() && l.status !== "kazanildi" ? "#f87171" : "var(--c-text2)" }}>
                                {new Date(l.next_follow_up_date).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })}
                              </span>
                            ) : "—"}
                          </td>

                          <td style={{ padding: "14px 16px", color: "var(--c-dim)", fontWeight: 500 }}>
                            {l.assigned_user || "—"}
                          </td>

                          <td style={{ padding: "14px 16px", textAlign: "right" }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                              <button onClick={() => openEditLead(l)} style={{
                                background: "transparent", border: "1px solid var(--c-border)",
                                color: "var(--c-text2)", padding: "5px 10px", borderRadius: 6,
                                fontSize: 11, fontWeight: 500, cursor: "pointer",
                              }}>
                                Düzenle
                              </button>
                              <button onClick={() => setDeleteTargetLead(l)} style={{
                                background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)",
                                color: "#f87171", padding: "5px 10px", borderRadius: 6,
                                fontSize: 11, fontWeight: 500, cursor: "pointer",
                              }}>
                                Sil
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            // Kanban board rendering
            <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 10, minHeight: 500 }}>
              {Object.entries(LEAD_STATUS_MAP).map(([statusKey, statusInfo]) => {
                const columnLeads = filteredLeads.filter(l => l.status === statusKey);
                return (
                  <div
                    key={statusKey}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => handleKanbanDrop(e, statusKey as any)}
                    style={{
                      flex: "0 0 280px",
                      background: "var(--c-surface)",
                      border: "1px solid var(--c-border)",
                      borderRadius: 12,
                      display: "flex",
                      flexDirection: "column",
                      maxHeight: "75vh"
                    }}
                  >
                    {/* Kanban Column Header */}
                    <div style={{
                      padding: "14px 16px",
                      borderBottom: "1px solid var(--c-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "rgba(255,255,255,0.01)",
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusInfo.color }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text)" }}>{statusInfo.label}</span>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: "var(--c-dim)",
                        background: "var(--c-border)", padding: "2px 6px", borderRadius: 50
                      }}>
                        {columnLeads.length}
                      </span>
                    </div>

                    {/* Column body content */}
                    <div style={{
                      padding: 10,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      overflowY: "auto",
                      flex: 1
                    }}>
                      {columnLeads.length === 0 ? (
                        <div style={{
                          textAlign: "center", padding: "32px 0", fontSize: 12, color: "var(--c-dim)",
                          border: "1px dashed var(--c-border)", borderRadius: 8
                        }}>
                          Aday bulunmuyor
                        </div>
                      ) : (
                        columnLeads.map(l => {
                          const compObj = companies.find(c => c.id === l.company_id);
                          const compName = compObj?.name || l.company_name || "—";
                          return (
                            <div
                              key={l.id}
                              draggable
                              onDragStart={e => e.dataTransfer.setData("text/plain", l.id)}
                              onClick={() => router.push(`/yonetim/crm-leads/${l.id}`)}
                              style={{
                                background: "var(--c-surface2)",
                                border: "1px solid var(--c-border)",
                                borderRadius: 8,
                                padding: 12,
                                cursor: "grab",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                transition: "border-color 0.2s"
                              }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--c-border2)"}
                              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--c-border)"}
                            >
                              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)", marginBottom: 4 }}>{l.title}</div>
                              <div style={{ fontSize: 11, color: "var(--c-text3)", marginBottom: 8 }}>{compName}</div>
                              
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{
                                  fontSize: 10, fontWeight: 700,
                                  color: l.score >= 70 ? "#4ade80" : l.score >= 40 ? "#fbbf24" : "#f87171",
                                  background: l.score >= 70 ? "rgba(74,222,128,0.1)" : l.score >= 40 ? "rgba(251,191,36,0.1)" : "rgba(248,113,113,0.1)",
                                  padding: "1px 5px", borderRadius: 3
                                }}>
                                  Puan: {l.score}
                                </span>
                                
                                {l.assigned_user && (
                                  <span style={{ fontSize: 10, color: "var(--c-dim)", fontWeight: 500 }}>
                                    {l.assigned_user}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab Content: Aktif / Pasif Müşteriler ── */}
      {activeTab !== "adaylar" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Customer Search Bar */}
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
                type="text" placeholder="Müşteri adı, sektör, sorumlu arat..." value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                style={{ ...INPUT, paddingLeft: 33 }}
              />
            </div>
            <div style={{ fontSize: 12, color: "var(--c-dim)", marginLeft: "auto" }}>
              {filteredCustomers.length} müşteri listelendi
            </div>
          </div>

          {/* Customers Table */}
          {filteredCustomers.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "72px 0", color: "var(--c-dim)", fontSize: 14,
              background: "var(--c-surface)", borderRadius: 14, border: "1px solid var(--c-border)",
            }}>
              {initialMusteriler.length === 0 ? "Henüz kayıtlı müşteri bulunmuyor." : "Arama kriterlerine uygun müşteri bulunamadı."}
            </div>
          ) : (
            <div style={{ ...CARD, padding: 0, overflow: "hidden" }}>
              {/* Table header */}
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

              {/* Table rows */}
              {filteredCustomers.map((m, i) => (
                <div key={m.id} style={{
                  display: "grid",
                  gridTemplateColumns: "1.6fr 90px 150px 130px 120px 110px 84px",
                  padding: "13px 20px",
                  borderBottom: i < filteredCustomers.length - 1 ? "1px solid var(--c-border)" : "none",
                  alignItems: "center",
                  transition: "background 0.1s",
                }}>
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

                  <div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
                      color: DURUM[m.durum]?.color, background: DURUM[m.durum]?.bg,
                      border: `1px solid ${DURUM[m.durum]?.border}`,
                    }}>
                      {DURUM[m.durum]?.label ?? m.durum}
                    </span>
                  </div>

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

                  <div style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}>
                    {m.aylik_ucret ? `₺${fmt(m.aylik_ucret)}` : "—"}
                  </div>

                  <div style={{ fontSize: 12, color: "var(--c-text3)" }}>{m.sorumlu || "—"}</div>

                  <div style={{ fontSize: 12, color: "var(--c-dim)" }}>{fmtDate(m.baslangic_tarihi)}</div>

                  <div style={{ display: "flex", gap: 5 }}>
                    <button onClick={() => openEditCustomer(m)} title="Düzenle" style={{
                      padding: "5px 7px", borderRadius: 6, background: "transparent",
                      border: "1px solid var(--c-border)", color: "var(--c-text2)", cursor: "pointer",
                      display: "flex", alignItems: "center",
                    }}>
                      <svg viewBox="0 0 14 14" fill="none" style={{ width: 12, height: 12 }}>
                        <path d="M10 2l2 2L4 12H2v-2L10 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <a href={`/yonetim/musteriler/${m.id}`} title="Detay" style={{
                      padding: "5px 7px", borderRadius: 6, background: "transparent",
                      border: "1px solid var(--c-border)", color: "var(--c-text2)",
                      display: "flex", alignItems: "center", textDecoration: "none",
                    }}>
                      <svg viewBox="0 0 14 14" fill="none" style={{ width: 12, height: 12 }}>
                        <path d="M1 7s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.3"/>
                        <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.3"/>
                      </svg>
                    </a>
                    <button onClick={() => setDeleteTargetCustomer(m)} title="Sil" style={{
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
        </div>
      )}

      {/* ── Customer Add / Edit Modal ── */}
      {custModal.open && (
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
                  {custModal.editing ? "Müşteri Düzenle" : "Yeni Müşteri Ekle"}
                </h2>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--c-dim)" }}>
                  * ile işaretli alanlar zorunludur
                </p>
              </div>
              <button onClick={() => setCustModal({ open: false })} style={{
                background: "none", border: "none", color: "var(--c-dim)", cursor: "pointer", padding: 4,
              }}>
                <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16 }}>
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleCustomerSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={LABEL}>Müşteri Adı *</label>
                  <input style={INPUT} value={customerForm.ad} onChange={(e) => setCustomerForm((f) => ({ ...f, ad: e.target.value }))} placeholder="Şirket adı veya Bireysel müşteri" required />
                </div>
                <div>
                  <label style={LABEL}>Sektör *</label>
                  <input style={INPUT} value={customerForm.sektor} onChange={(e) => setCustomerForm((f) => ({ ...f, sektor: e.target.value }))} placeholder="ör. E-ticaret, Sağlık" required />
                </div>
                <div>
                  <label style={LABEL}>Telefon * <span style={{ fontWeight: 400, textTransform: "none" }}>(0555 555 5555)</span></label>
                  <input
                    style={INPUT}
                    value={customerForm.telefon}
                    onChange={(e) => setCustomerForm((f) => ({ ...f, telefon: formatTelefon(e.target.value) }))}
                    placeholder="0555 555 5555"
                    inputMode="numeric"
                    required
                  />
                </div>
                <div>
                  <label style={LABEL}>Sorumlu *</label>
                  <input style={INPUT} value={customerForm.sorumlu} onChange={(e) => setCustomerForm((f) => ({ ...f, sorumlu: e.target.value }))} placeholder="Hesap yöneticisi" required />
                </div>
                <div>
                  <label style={LABEL}>Aylık Yönetim Ücreti (₺) *</label>
                  <input type="number" style={INPUT} value={customerForm.aylik_ucret} onChange={(e) => setCustomerForm((f) => ({ ...f, aylik_ucret: e.target.value }))} placeholder="0" min="0" required />
                </div>
                <div>
                  <label style={LABEL}>Başlangıç Tarihi *</label>
                  <DatePicker
                    value={customerForm.baslangic_tarihi}
                    onChange={(v) => setCustomerForm((f) => ({ ...f, baslangic_tarihi: v }))}
                    placeholder="Başlangıç günü seçin"
                    required
                  />
                </div>
                <div>
                  <label style={LABEL}>E-posta</label>
                  <input type="email" style={INPUT} value={customerForm.email} onChange={(e) => setCustomerForm((f) => ({ ...f, email: e.target.value }))} placeholder="info@sirket.com" />
                </div>
                <div>
                  <label style={LABEL}>Durum</label>
                  <select style={INPUT} value={customerForm.durum} onChange={(e) => setCustomerForm((f) => ({ ...f, durum: e.target.value }))}>
                    <option value="aktif">Aktif</option>
                    <option value="pasif">Pasif</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={LABEL}>Website</label>
                <input style={INPUT} value={customerForm.website} onChange={(e) => setCustomerForm((f) => ({ ...f, website: e.target.value }))} placeholder="https://sirket.com" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={LABEL}>Sözleşme Bitiş Tarihi</label>
                  <DatePicker
                    value={customerForm.sozlesme_bitis_tarihi}
                    onChange={(v) => setCustomerForm((f) => ({ ...f, sozlesme_bitis_tarihi: v }))}
                    placeholder="Sözleşme bitiş günü"
                  />
                </div>
                <div>
                  <label style={LABEL}>Yenileme Hatırlatması (gün)</label>
                  <input
                    type="number" style={INPUT} value={customerForm.yenileme_hatirlatma_gun}
                    onChange={(e) => setCustomerForm((f) => ({ ...f, yenileme_hatirlatma_gun: e.target.value }))}
                    min="1" placeholder="30"
                  />
                </div>
              </div>

              <div>
                <label style={LABEL}>Platformlar</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 4 }}>
                  {PLATFORMS.map((p) => {
                    const active = customerForm.platformlar.includes(p.key);
                    return (
                      <button key={p.key} type="button" onClick={() => toggleCustomerPlatform(p.key)} style={{
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
                  value={customerForm.notlar}
                  onChange={(e) => setCustomerForm((f) => ({ ...f, notlar: e.target.value }))}
                  placeholder="Müşteriyle ilgili detaylı notlar..."
                />
              </div>

              {custError && (
                <div style={{
                  fontSize: 12, color: "#f87171", background: "rgba(248,113,113,0.08)",
                  padding: "10px 14px", borderRadius: 9, border: "1px solid rgba(248,113,113,0.2)",
                }}>
                  {custError}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setCustModal({ open: false })} style={{
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
                  {isPending ? "Kaydediliyor..." : custModal.editing ? "Güncelle" : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Customer Delete Modal ── */}
      {deleteTargetCustomer && (
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
              <strong>{deleteTargetCustomer.ad}</strong> müşterisini ve ona ait tüm sosyal medya metriklerini kalıcı olarak silmek istediğinizden emin misiniz?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setDeleteTargetCustomer(null)} style={{
                padding: "8px 18px", borderRadius: 8, background: "transparent",
                border: "1px solid var(--c-border)", color: "var(--c-text2)",
                fontSize: 13, fontWeight: 500, cursor: "pointer",
              }}>
                İptal
              </button>
              <button onClick={handleCustomerDelete} disabled={isPending} style={{
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

      {/* ── Lead Add / Edit Modal ── */}
      {leadModal.open && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)",
        }}>
          <form onSubmit={handleLeadSubmit} style={{
            background: "var(--c-surface)", border: "1px solid var(--c-border)",
            borderRadius: 16, width: "100%", maxWidth: 640, padding: 28,
            boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", gap: 20,
            maxHeight: "90vh", overflowY: "auto",
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--c-text)" }}>
                {leadModal.editing ? "Adayı Düzenle" : "Yeni Aday Ekle"}
              </h2>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--c-dim)" }}>
                Aday ve CRM satış fırsatı bilgilerini girin.
              </p>
            </div>

            {leadError && (
              <div style={{
                background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#f87171", fontWeight: 500,
              }}>
                {leadError}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "span 2" }}>
                <label style={LABEL}>Aday Tanımı *</label>
                <input
                  type="text"
                  placeholder="Örn: YapıMedya Sosyal Medya Hizmeti"
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
                  {filteredContactsForForm.map(c => (
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
                      placeholder="Firma Adı"
                      value={leadForm.company_name}
                      onChange={e => setLeadForm(f => ({ ...f, company_name: e.target.value }))}
                      style={INPUT}
                    />
                  </div>
                  <div>
                    <label style={LABEL}>Yetkili Kişi (Serbest Yazım)</label>
                    <input
                      type="text"
                      placeholder="Yetkili Ad Soyad"
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
                  placeholder="05..."
                  value={leadForm.phone}
                  onChange={e => setLeadForm(f => ({ ...f, phone: e.target.value }))}
                  style={INPUT}
                />
              </div>

              <div>
                <label style={LABEL}>E-posta</label>
                <input
                  type="email"
                  placeholder="email@adres.com"
                  value={leadForm.email}
                  onChange={e => setLeadForm(f => ({ ...f, email: e.target.value }))}
                  style={INPUT}
                />
              </div>

              <div>
                <label style={LABEL}>Instagram Hesabı</label>
                <input
                  type="text"
                  placeholder="@kullanici"
                  value={leadForm.instagram}
                  onChange={e => setLeadForm(f => ({ ...f, instagram: e.target.value }))}
                  style={INPUT}
                />
              </div>

              <div>
                <label style={LABEL}>Website</label>
                <input
                  type="text"
                  placeholder="www.adres.com"
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
                  {Object.entries(LEAD_SOURCE_MAP).map(([key, val]) => (
                    <option key={key} value={key}>{val}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={LABEL}>Durum / Aşama</label>
                <select
                  value={leadForm.status}
                  onChange={e => setLeadForm(f => ({ ...f, status: e.target.value as any }))}
                  style={INPUT}
                >
                  {Object.entries(LEAD_STATUS_MAP).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <label style={{ ...LABEL, marginBottom: 0 }}>Aday Skoru ({leadForm.score})</label>
                  {scoreIsDirty && !leadModal.editing && (
                    <button
                      type="button"
                      onClick={() => setScoreIsDirty(false)}
                      style={{
                        background: "none", border: "none", color: "#fbbf24", fontSize: 11,
                        fontWeight: 600, cursor: "pointer", padding: 0, textDecoration: "underline"
                      }}
                    >
                      Otomatik Hesapla
                    </button>
                  )}
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={leadForm.score}
                  onChange={e => {
                    setLeadForm(f => ({ ...f, score: e.target.value }));
                    setScoreIsDirty(true);
                  }}
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
                  placeholder="Görüşme notları, müşteri beklentileri vb..."
                  value={leadForm.notes}
                  onChange={e => setLeadForm(f => ({ ...f, notes: e.target.value }))}
                  style={{ ...INPUT, height: 80, resize: "vertical" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setLeadModal({ open: false })}
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
                  boxShadow: "0 4px 12px rgba(239,68,68,0.25)",
                }}
              >
                {isPending ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Lead Delete Modal ── */}
      {deleteTargetLead && (
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
              Aday Kaydını Sil
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--c-text2)", lineHeight: 1.5 }}>
              <strong>{deleteTargetLead.title}</strong> aday kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button
                onClick={() => setDeleteTargetLead(null)}
                style={{
                  background: "transparent", border: "1px solid var(--c-border)",
                  color: "var(--c-text)", padding: "8px 16px", borderRadius: 8,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}
              >
                İptal
              </button>
              <button
                onClick={handleLeadDelete}
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
    </div>
  );
}
