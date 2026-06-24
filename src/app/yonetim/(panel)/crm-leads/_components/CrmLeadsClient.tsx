"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addLead, updateLead, deleteLead } from "@/lib/actions/crmLeads";
import { DatePicker } from "../../musteriler/_components/DatePicker";

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

type ModalState = { open: false } | { open: true; editing: Lead | null };

const EMPTY_FORM = {
  title: "", company_id: "", contact_id: "", company_name: "",
  contact_name: "", phone: "", email: "", instagram: "",
  website: "", sector: "", source: "manuel", status: "yeni",
  score: "50", notes: "", assigned_user: "", next_follow_up_date: "",
  audit_id: "", source_contact_id: "",
};

export function CrmLeadsClient({
  leads, companies, contacts, users, prefill,
}: {
  leads: Lead[]; companies: Company[]; contacts: Contact[]; users: User[]; prefill?: PrefillData;
}) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [form, setForm] = useState(EMPTY_FORM);
  const [isPending, setIsPending] = useState(false);
  const [formError, setFormError] = useState("");
  const [scoreIsDirty, setScoreIsDirty] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  // Load view mode preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("leads-view-mode") as "list" | "kanban" | null;
      if (saved) setViewMode(saved);
    }
  }, []);

  // Prefill hook
  useEffect(() => {
    if (prefill) {
      setForm({
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
      setModal({ open: true, editing: null });

      // Clean URL params
      if (typeof window !== "undefined") {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, [prefill]);

  // Otomatik lead skoru hesaplama algoritması
  const calculateSuggestedScore = (f: typeof EMPTY_FORM) => {
    let sc = 10; // Taban puan

    // İletişim Bilgileri (Toplam maks: 40)
    if (f.phone) sc += 15;
    if (f.email) sc += 10;
    if (f.instagram) sc += 15;

    // Firma ve Website (Toplam maks: 15)
    if (f.company_name || f.company_id) sc += 10;
    if (f.website) sc += 5;

    // Kaynak Kalitesi (Toplam maks: 25)
    if (f.source === "inbound") sc += 25;
    else if (f.source === "referans") sc += 25;
    else if (f.source === "instagram") sc += 15;
    else if (f.source === "google_maps") sc += 15;
    else if (f.source === "manuel") sc += 10;
    else sc += 5;

    // Sorumlu Ataması ve Detaylı Notlar (Toplam maks: 10)
    if (f.assigned_user) sc += 5;
    if (f.notes && f.notes.trim().length > 10) sc += 5;

    return Math.min(sc, 100);
  };

  useEffect(() => {
    const isEditing = modal.open ? modal.editing : null;
    if (!scoreIsDirty && !isEditing) {
      const suggested = calculateSuggestedScore(form);
      if (form.score !== String(suggested)) {
        setForm(f => ({ ...f, score: String(suggested) }));
      }
    }
  }, [
    form.phone,
    form.email,
    form.instagram,
    form.company_name,
    form.company_id,
    form.website,
    form.source,
    form.assigned_user,
    form.notes,
    scoreIsDirty,
    modal.open ? modal.editing : null
  ]);

  const stats = useMemo(() => {
    const active = leads.filter(l => l.status !== "kazanildi" && l.status !== "kaybedildi");
    const won = leads.filter(l => l.status === "kazanildi");
    return {
      toplam: leads.length,
      aktif: active.length,
      kazanilan: won.length,
      conversionRate: leads.length ? Math.round((won.length / leads.length) * 100) : 0,
    };
  }, [leads]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leads
      .filter(l => statusFilter === "all" || l.status === statusFilter)
      .filter(l => sourceFilter === "all" || l.source === sourceFilter)
      .filter(l => sectorFilter === "all" || l.sector === sectorFilter)
      .filter(l => userFilter === "all" || l.assigned_user === userFilter)
      .filter(l =>
        l.title.toLowerCase().includes(q) ||
        (l.company_name || "").toLowerCase().includes(q) ||
        (l.contact_name || "").toLowerCase().includes(q) ||
        (l.phone || "").includes(q) ||
        (l.sector || "").toLowerCase().includes(q)
      );
  }, [leads, search, statusFilter, sourceFilter, sectorFilter, userFilter]);

  // Seçilen firmaya göre yetkili kişileri süz
  const filteredContactsForForm = useMemo(() => {
    if (!form.company_id) return [];
    return contacts.filter(c => c.company_id === form.company_id);
  }, [form.company_id, contacts]);

  function openAdd() {
    setForm(EMPTY_FORM);
    setFormError("");
    setScoreIsDirty(false);
    setModal({ open: true, editing: null });
  }

  function openEdit(l: Lead) {
    setForm({
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
    setFormError("");
    setScoreIsDirty(true);
    setModal({ open: true, editing: l });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setFormError("Başlık / Aday Tanımı zorunludur."); return; }

    const inputData = {
      title: form.title.trim(),
      company_id: form.company_id || null,
      contact_id: form.contact_id || null,
      company_name: form.company_name.trim(),
      contact_name: form.contact_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      instagram: form.instagram.trim(),
      website: form.website.trim(),
      sector: form.sector,
      source: form.source as Lead["source"],
      status: form.status as Lead["status"],
      score: parseInt(form.score) || 0,
      notes: form.notes.trim(),
      assigned_user: form.assigned_user,
      next_follow_up_date: form.next_follow_up_date || null,
      audit_id: form.audit_id || null,
      source_contact_id: form.source_contact_id || null,
    };

    setFormError("");
    setIsPending(true);
    const result = modal.open && modal.editing
      ? await updateLead(modal.editing.id, inputData)
      : await addLead(inputData);
    setIsPending(false);

    if (result.error) {
      setFormError(result.error);
    } else {
      setModal({ open: false });
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsPending(true);
    const result = await deleteLead(deleteTarget.id);
    setIsPending(false);
    if (!result.error) {
      setDeleteTarget(null);
      router.refresh();
    }
  }

  async function handleDrop(e: React.DragEvent, targetStatus: Lead["status"]) {
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ── Başlık ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--c-text)", letterSpacing: "-0.03em" }}>
            Müşteri Adayı Yönetimi
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--c-dim)" }}>
            Müşteri adayları ve satış aşamaları takibi
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Görünüm Değiştirici */}
          <div style={{ display: "flex", background: "var(--c-border)", borderRadius: 8, padding: 3, gap: 2 }}>
            <button
              onClick={() => { setViewMode("list"); localStorage.setItem("leads-view-mode", "list"); }}
              style={{
                background: viewMode === "list" ? "var(--c-surface)" : "none",
                color: viewMode === "list" ? "var(--c-text)" : "var(--c-dim)",
                border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              Liste Görünümü
            </button>
            <button
              onClick={() => { setViewMode("kanban"); localStorage.setItem("leads-view-mode", "kanban"); }}
              style={{
                background: viewMode === "kanban" ? "var(--c-surface)" : "none",
                color: viewMode === "kanban" ? "var(--c-text)" : "var(--c-dim)",
                border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              Aşama Görünümü
            </button>
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
            Yeni Aday Ekle
          </button>
        </div>
      </div>

      {/* ── İstatistik Kartları ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <div style={{ ...CARD, display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--c-dim)", textTransform: "uppercase" }}>Toplam Aday</span>
          <span style={{ fontSize: 28, fontWeight: 800, color: "var(--c-text)" }}>{stats.toplam}</span>
        </div>
        <div style={{ ...CARD, display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--c-dim)", textTransform: "uppercase" }}>Görüşülenler</span>
          <span style={{ fontSize: 28, fontWeight: 800, color: "#fb923c" }}>{stats.aktif}</span>
        </div>
        <div style={{ ...CARD, display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--c-dim)", textTransform: "uppercase" }}>Kazanılanlar</span>
          <span style={{ fontSize: 28, fontWeight: 800, color: "#4ade80" }}>{stats.kazanilan}</span>
        </div>
        <div style={{ ...CARD, display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--c-dim)", textTransform: "uppercase" }}>Başarı Oranı</span>
          <span style={{ fontSize: 28, fontWeight: 800, color: "#60a5fa" }}>%{stats.conversionRate}</span>
        </div>
      </div>

      {/* ── Filtreler ── */}
      <div style={{ ...CARD, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 200px 180px 180px 180px", gap: 12 }}>
          {/* Arama */}
          <input
            type="text"
            placeholder="Başlık, firma, yetkili veya telefon ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={INPUT}
          />
          {/* Durum Filtresi */}
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={INPUT}>
            <option value="all">Tüm Durumlar</option>
            {Object.entries(STATUS_MAP).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          {/* Kaynak Filtresi */}
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} style={INPUT}>
            <option value="all">Tüm Kaynaklar</option>
            {Object.entries(SOURCE_MAP).map(([key, val]) => (
              <option key={key} value={key}>{val}</option>
            ))}
          </select>
          {/* Sektör Filtresi */}
          <select value={sectorFilter} onChange={e => setSectorFilter(e.target.value)} style={INPUT}>
            <option value="all">Tüm Sektörler</option>
            {SECTORS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {/* Sorumlu Kullanıcı Filtresi */}
          <select value={userFilter} onChange={e => setUserFilter(e.target.value)} style={INPUT}>
            <option value="all">Tüm Sorumlular</option>
            {users.map(u => (
              <option key={u.username} value={u.username}>{u.username}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Aday Listesi veya Kanban Görünümü ── */}
      {viewMode === "list" ? (
        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid var(--c-border)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, background: "var(--c-surface)" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--c-dim)", textAlign: "left", textTransform: "uppercase" }}>Aday Tanımı</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--c-dim)", textAlign: "left", textTransform: "uppercase" }}>Firma / Kişi</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--c-dim)", textAlign: "left", textTransform: "uppercase" }}>İletişim</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--c-dim)", textAlign: "center", textTransform: "uppercase" }}>Aday Skoru</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--c-dim)", textAlign: "left", textTransform: "uppercase" }}>Geldiği Kanal</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--c-dim)", textAlign: "left", textTransform: "uppercase" }}>Durum</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--c-dim)", textAlign: "left", textTransform: "uppercase" }}>Sonraki Takip</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--c-dim)", textAlign: "left", textTransform: "uppercase" }}>Sorumlu</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--c-dim)", textAlign: "right", textTransform: "uppercase" }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "48px 0", color: "var(--c-dim)" }}>
                    Filtrelere uygun aday kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => {
                  const compObj = companies.find(c => c.id === l.company_id);
                  const contObj = contacts.find(c => c.id === l.contact_id);
                  const compName = compObj?.name || l.company_name || "—";
                  const contName = contObj?.name || l.contact_name || "—";
                  const stat = STATUS_MAP[l.status] || { label: l.status, color: "gray", bg: "rgba(0,0,0,0.1)", border: "none" };

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
                        {SOURCE_MAP[l.source] || l.source}
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
                          <button onClick={() => openEdit(l)} style={{
                            background: "transparent", border: "1px solid var(--c-border)",
                            color: "var(--c-text2)", padding: "5px 10px", borderRadius: 6,
                            fontSize: 11, fontWeight: 500, cursor: "pointer",
                          }}>
                            Düzenle
                          </button>
                          <button onClick={() => setDeleteTarget(l)} style={{
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
        <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 10, minHeight: 500 }}>
          {Object.entries(STATUS_MAP).map(([statusKey, statusInfo]) => {
            const columnLeads = filtered.filter(l => l.status === statusKey);
            return (
              <div
                key={statusKey}
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, statusKey as any)}
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
                {/* Column Header */}
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

                {/* Column Body */}
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
                                Sorumlu: {l.assigned_user}
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

      {/* ── Ekle / Düzenle Modal ── */}
      {modal.open && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)",
        }}>
          <form onSubmit={handleSubmit} style={{
            background: "var(--c-surface)", border: "1px solid var(--c-border)",
            borderRadius: 16, width: "100%", maxWidth: 640, padding: 28,
            boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", gap: 20,
            maxHeight: "90vh", overflowY: "auto",
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--c-text)" }}>
                {modal.editing ? "Adayı Düzenle" : "Yeni Aday Ekle"}
              </h2>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--c-dim)" }}>
                Aşağıdaki alanları eksiksiz doldurarak aday kaydını kaydedin.
              </p>
            </div>

            {formError && (
              <div style={{
                background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#f87171", fontWeight: 500,
              }}>
                {formError}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "span 2" }}>
                <label style={LABEL}>Aday Tanımı *</label>
                <input
                  type="text"
                  placeholder="Örn: YapıMedya Sosyal Medya Hizmeti"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  style={INPUT}
                  required
                />
              </div>

              <div>
                <label style={LABEL}>Kayıtlı Firma</label>
                <select
                  value={form.company_id}
                  onChange={e => setForm(f => ({ ...f, company_id: e.target.value, contact_id: "" }))}
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
                  value={form.contact_id}
                  disabled={!form.company_id}
                  onChange={e => setForm(f => ({ ...f, contact_id: e.target.value }))}
                  style={INPUT}
                >
                  <option value="">-- Yetkili Seç --</option>
                  {filteredContactsForForm.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {!form.company_id && (
                <>
                  <div>
                    <label style={LABEL}>Firma Adı (Serbest Yazım)</label>
                    <input
                      type="text"
                      placeholder="Firma Adı"
                      value={form.company_name}
                      onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                      style={INPUT}
                    />
                  </div>
                  <div>
                    <label style={LABEL}>Yetkili Kişi (Serbest Yazım)</label>
                    <input
                      type="text"
                      placeholder="Yetkili Ad Soyad"
                      value={form.contact_name}
                      onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
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
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  style={INPUT}
                />
              </div>

              <div>
                <label style={LABEL}>E-posta</label>
                <input
                  type="email"
                  placeholder="email@adres.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={INPUT}
                />
              </div>

              <div>
                <label style={LABEL}>Instagram Hesabı</label>
                <input
                  type="text"
                  placeholder="@kullanici"
                  value={form.instagram}
                  onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))}
                  style={INPUT}
                />
              </div>

              <div>
                <label style={LABEL}>Website</label>
                <input
                  type="text"
                  placeholder="www.adres.com"
                  value={form.website}
                  onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                  style={INPUT}
                />
              </div>

              <div>
                <label style={LABEL}>Sektör</label>
                <select
                  value={form.sector}
                  onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
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
                  value={form.assigned_user}
                  onChange={e => setForm(f => ({ ...f, assigned_user: e.target.value }))}
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
                  value={form.source}
                  onChange={e => setForm(f => ({ ...f, source: e.target.value as any }))}
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
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
                  style={INPUT}
                >
                  {Object.entries(STATUS_MAP).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <label style={{ ...LABEL, marginBottom: 0 }}>Aday Skoru ({form.score})</label>
                  {scoreIsDirty && !modal.editing && (
                    <button
                      type="button"
                      onClick={() => setScoreIsDirty(false)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#fbbf24",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: 0,
                        textDecoration: "underline"
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
                  value={form.score}
                  onChange={e => {
                    setForm(f => ({ ...f, score: e.target.value }));
                    setScoreIsDirty(true);
                  }}
                  style={{ width: "100%", height: 36, accentColor: "#ef4444" }}
                />
              </div>

              <div>
                <label style={LABEL}>Sonraki Takip Tarihi</label>
                <DatePicker
                  value={form.next_follow_up_date}
                  onChange={val => setForm(f => ({ ...f, next_follow_up_date: val }))}
                />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={LABEL}>Notlar</label>
                <textarea
                  placeholder="Görüşme notları, müşteri beklentileri vb..."
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  style={{ ...INPUT, height: 80, resize: "vertical" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setModal({ open: false })}
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

      {/* ── Silme Onay Modal ── */}
      {deleteTarget && (
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
              <strong>{deleteTarget.title}</strong> aday kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  background: "transparent", border: "1px solid var(--c-border)",
                  color: "var(--c-text)", padding: "8px 16px", borderRadius: 8,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
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
