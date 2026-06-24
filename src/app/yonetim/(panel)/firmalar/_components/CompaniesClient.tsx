"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { addCompany, updateCompany, deleteCompany } from "@/lib/actions/crmCompanies";
import { addContact, updateContact, deleteContact } from "@/lib/actions/crmContacts";

type Company = {
  id: string;
  created_at: string;
  name: string;
  website: string;
  sector: string;
  phone: string;
  email: string;
  instagram: string;
  notes: string;
  assigned_user: string;
};

type Contact = {
  id: string;
  created_at: string;
  company_id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  instagram: string;
  notes: string;
};

type User = { id: string; username: string; role: string };

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

const EMPTY_COMPANY_FORM = {
  name: "", website: "", sector: "", phone: "", email: "", instagram: "", notes: "", assigned_user: "",
};

const EMPTY_CONTACT_FORM = {
  name: "", phone: "", email: "", role: "", instagram: "", notes: "",
};

export function CompaniesClient({
  companies, contacts, users
}: {
  companies: Company[]; contacts: Contact[]; users: User[];
}) {
  const router = useRouter();
  const [selectedCompId, setSelectedCompId] = useState<string | null>(companies[0]?.id || null);
  const [search, setSearch] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [formError, setFormError] = useState("");

  // Modaller
  const [companyModal, setCompanyModal] = useState<{ open: boolean; editing: Company | null }>({ open: false, editing: null });
  const [contactModal, setContactModal] = useState<{ open: boolean; editing: Contact | null }>({ open: false, editing: null });
  const [deleteTargetComp, setDeleteTargetComp] = useState<Company | null>(null);
  const [deleteTargetCont, setDeleteTargetCont] = useState<Contact | null>(null);

  // Form states
  const [compForm, setCompForm] = useState(EMPTY_COMPANY_FORM);
  const [contForm, setContForm] = useState(EMPTY_CONTACT_FORM);

  const selectedComp = useMemo(() => {
    return companies.find(c => c.id === selectedCompId) || null;
  }, [selectedCompId, companies]);

  const selectedCompContacts = useMemo(() => {
    if (!selectedCompId) return [];
    return contacts.filter(c => c.company_id === selectedCompId);
  }, [selectedCompId, contacts]);

  const filteredCompanies = useMemo(() => {
    const q = search.toLowerCase();
    return companies.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.sector || "").toLowerCase().includes(q)
    );
  }, [companies, search]);

  // Firma Ekleme / Düzenleme
  function openAddCompany() {
    setCompForm(EMPTY_COMPANY_FORM);
    setFormError("");
    setCompanyModal({ open: true, editing: null });
  }

  function openEditCompany(c: Company) {
    setCompForm({
      name: c.name, website: c.website || "", sector: c.sector || "",
      phone: c.phone || "", email: c.email || "", instagram: c.instagram || "",
      notes: c.notes || "", assigned_user: c.assigned_user || "",
    });
    setFormError("");
    setCompanyModal({ open: true, editing: c });
  }

  async function handleCompanySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!compForm.name.trim()) { setFormError("Firma adı zorunludur."); return; }

    setIsPending(true);
    const result = companyModal.open && companyModal.editing
      ? await updateCompany(companyModal.editing.id, compForm)
      : await addCompany(compForm);
    setIsPending(false);

    if (result.error) {
      setFormError(result.error);
    } else {
      setCompanyModal({ open: false, editing: null });
      if (result.id) setSelectedCompId(result.id);
      router.refresh();
    }
  }

  async function handleCompanyDelete() {
    if (!deleteTargetComp) return;
    setIsPending(true);
    const result = await deleteCompany(deleteTargetComp.id);
    setIsPending(false);
    if (!result.error) {
      setDeleteTargetComp(null);
      setSelectedCompId(companies.filter(c => c.id !== deleteTargetComp.id)[0]?.id || null);
      router.refresh();
    }
  }

  // Yetkili/Kişi Ekleme / Düzenleme
  function openAddContact() {
    if (!selectedCompId) return;
    setContForm(EMPTY_CONTACT_FORM);
    setFormError("");
    setContactModal({ open: true, editing: null });
  }

  function openEditContact(c: Contact) {
    setContForm({
      name: c.name, phone: c.phone || "", email: c.email || "",
      role: c.role || "", instagram: c.instagram || "", notes: c.notes || "",
    });
    setFormError("");
    setContactModal({ open: true, editing: c });
  }

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCompId) return;
    if (!contForm.name.trim()) { setFormError("İletişim Kişisi adı zorunludur."); return; }

    const inputData = {
      company_id: selectedCompId,
      ...contForm
    };

    setIsPending(true);
    const result = contactModal.open && contactModal.editing
      ? await updateContact(contactModal.editing.id, contForm)
      : await addContact(inputData);
    setIsPending(false);

    if (result.error) {
      setFormError(result.error);
    } else {
      setContactModal({ open: false, editing: null });
      router.refresh();
    }
  }

  async function handleContactDelete() {
    if (!deleteTargetCont) return;
    setIsPending(true);
    const result = await deleteContact(deleteTargetCont.id);
    setIsPending(false);
    if (!result.error) {
      setDeleteTargetCont(null);
      router.refresh();
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ── Başlık ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--c-text)", letterSpacing: "-0.03em" }}>
            Firmalar ve İletişim Kişileri
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--c-dim)" }}>
            B2B firma portföyü ve bağlı yetkililerin rehberi
          </p>
        </div>
        <button onClick={openAddCompany} style={{
          padding: "10px 20px", borderRadius: 9, background: "#ef4444", color: "#fff",
          border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 7,
          boxShadow: "0 4px 14px rgba(239,68,68,0.35)",
        }}>
          <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14 }}>
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Yeni Firma Ekle
        </button>
      </div>

      {/* ── İki Sütunlu Rehber Görünümü ── */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>
        
        {/* SOL SÜTUN: Firma Listesi */}
        <div style={{ ...CARD, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 14, maxHeight: "75vh" }}>
          <input
            type="text"
            placeholder="Firma ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={INPUT}
          />
          <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
            {filteredCompanies.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "var(--c-dim)", fontSize: 12 }}>
                Firma bulunamadı.
              </div>
            ) : (
              filteredCompanies.map(c => {
                const isSelected = c.id === selectedCompId;
                return (
                  <div
                    key={c.id}
                    onClick={() => { setSelectedCompId(c.id); setFormError(""); }}
                    style={{
                      padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                      background: isSelected ? "rgba(239,68,68,0.12)" : "transparent",
                      border: "1px solid",
                      borderColor: isSelected ? "rgba(239,68,68,0.25)" : "transparent",
                      color: isSelected ? "#ef4444" : "var(--c-text2)",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => !isSelected && (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                    onMouseLeave={e => !isSelected && (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 600 }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: "var(--c-dim)", marginTop: 2 }}>{c.sector || "Diğer"}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SAĞ SÜTUN: Seçilen Firma Detayları ve Yetkililer */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {selectedComp ? (
            <>
              {/* Firma Detay Kartı */}
              <div style={CARD}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "var(--c-text)" }}>{selectedComp.name}</h2>
                    <span style={{ fontSize: 11, color: "var(--c-dim)", background: "var(--c-border)", padding: "2px 8px", borderRadius: 4, display: "inline-block", marginTop: 4 }}>
                      {selectedComp.sector || "Sektör Belirtilmemiş"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openEditCompany(selectedComp)} style={{
                      background: "transparent", border: "1px solid var(--c-border)",
                      color: "var(--c-text)", padding: "5px 12px", borderRadius: 6,
                      fontSize: 12, cursor: "pointer",
                    }}>
                      Düzenle
                    </button>
                    <button onClick={() => setDeleteTargetComp(selectedComp)} style={{
                      background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)",
                      color: "#f87171", padding: "5px 12px", borderRadius: 6,
                      fontSize: 12, cursor: "pointer",
                    }}>
                      Sil
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, fontSize: 13, color: "var(--c-text2)" }}>
                  {selectedComp.phone && (
                    <div>
                      <strong style={{ fontSize: 10, color: "var(--c-dim)", display: "block", textTransform: "uppercase" }}>Telefon</strong>
                      <a href={`tel:${selectedComp.phone}`} style={{ color: "#f87171", textDecoration: "none" }}>{selectedComp.phone}</a>
                    </div>
                  )}
                  {selectedComp.email && (
                    <div>
                      <strong style={{ fontSize: 10, color: "var(--c-dim)", display: "block", textTransform: "uppercase" }}>E-posta</strong>
                      <a href={`mailto:${selectedComp.email}`} style={{ color: "#60a5fa", textDecoration: "none" }}>{selectedComp.email}</a>
                    </div>
                  )}
                  {selectedComp.website && (
                    <div>
                      <strong style={{ fontSize: 10, color: "var(--c-dim)", display: "block", textTransform: "uppercase" }}>Website</strong>
                      <a href={selectedComp.website.startsWith("http") ? selectedComp.website : `https://${selectedComp.website}`} target="_blank" style={{ color: "#60a5fa", textDecoration: "none" }}>{selectedComp.website}</a>
                    </div>
                  )}
                  {selectedComp.instagram && (
                    <div>
                      <strong style={{ fontSize: 10, color: "var(--c-dim)", display: "block", textTransform: "uppercase" }}>Instagram</strong>
                      <a href={`https://instagram.com/${selectedComp.instagram.replace("@", "")}`} target="_blank" style={{ color: "#ec4899", textDecoration: "none" }}>{selectedComp.instagram}</a>
                    </div>
                  )}
                  <div>
                    <strong style={{ fontSize: 10, color: "var(--c-dim)", display: "block", textTransform: "uppercase" }}>Atanan Sorumlu</strong>
                    <span>{selectedComp.assigned_user || "Atanmamış"}</span>
                  </div>
                </div>

                {selectedComp.notes && (
                  <div style={{ borderTop: "1px solid var(--c-border2)", marginTop: 14, paddingTop: 12 }}>
                    <strong style={{ fontSize: 10, color: "var(--c-dim)", display: "block", textTransform: "uppercase", marginBottom: 4 }}>Notlar</strong>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--c-dim)", lineHeight: 1.5 }}>{selectedComp.notes}</p>
                  </div>
                )}
              </div>

              {/* İletişim Kişileri Listesi (Rehber) */}
              <div style={CARD}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--c-text)", textTransform: "uppercase" }}>Yetkili Rehberi ({selectedCompContacts.length})</h3>
                  <button onClick={openAddContact} style={{
                    background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)",
                    color: "#a78bfa", padding: "6px 12px", borderRadius: 6,
                    fontSize: 11, fontWeight: 600, cursor: "pointer",
                  }}>
                    + Yeni Yetkili Ekle
                  </button>
                </div>

                {selectedCompContacts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "var(--c-dim)", fontSize: 13 }}>
                    Bu firmaya bağlı kayıtlı yetkili kişi bulunamadı.
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {selectedCompContacts.map(c => (
                      <div key={c.id} style={{
                        padding: "14px 18px", borderRadius: 10, border: "1px solid var(--c-border)",
                        background: "rgba(255,255,255,0.01)", display: "flex", flexDirection: "column", gap: 8,
                        position: "relative",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--c-text)" }}>{c.name}</div>
                            {c.role && <div style={{ fontSize: 10, color: "var(--c-dim)", marginTop: 1 }}>{c.role}</div>}
                          </div>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button onClick={() => openEditContact(c)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 12 }} title="Düzenle">✏️</button>
                            <button onClick={() => setDeleteTargetCont(c)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 12 }} title="Sil">🗑️</button>
                          </div>
                        </div>

                        <div style={{ borderTop: "1px solid var(--c-border2)", margin: "4px 0" }}></div>

                        <div style={{ fontSize: 11, color: "var(--c-text3)", display: "flex", flexDirection: "column", gap: 2 }}>
                          {c.phone && <div>📞 <a href={`tel:${c.phone}`} style={{ color: "#f87171", textDecoration: "none" }}>{c.phone}</a></div>}
                          {c.email && <div>✉️ <a href={`mailto:${c.email}`} style={{ color: "#60a5fa", textDecoration: "none" }}>{c.email}</a></div>}
                          {c.instagram && <div>📸 <a href={`https://instagram.com/${c.instagram.replace("@", "")}`} target="_blank" style={{ color: "#ec4899", textDecoration: "none" }}>{c.instagram}</a></div>}
                        </div>

                        {c.notes && (
                          <div style={{ fontSize: 11, color: "var(--c-dim)", fontStyle: "italic", marginTop: 4 }}>
                            Not: {c.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ ...CARD, textAlign: "center", padding: "72px 0", color: "var(--c-dim)" }}>
              Lütfen sol menüden bir firma seçin veya yeni bir firma oluşturun.
            </div>
          )}
        </div>
      </div>

      {/* ── 1. Firma Modal ── */}
      {companyModal.open && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)",
        }}>
          <form onSubmit={handleCompanySubmit} style={{
            background: "var(--c-surface)", border: "1px solid var(--c-border)",
            borderRadius: 16, width: "100%", maxWidth: 480, padding: 24,
            boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", gap: 16,
          }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--c-text)" }}>
              {companyModal.editing ? "Firma Bilgilerini Düzenle" : "Yeni Firma Ekle"}
            </h3>

            {formError && <div style={{ color: "#f87171", fontSize: 12 }}>{formError}</div>}

            <div>
              <label style={LABEL}>Firma Adı *</label>
              <input
                type="text"
                placeholder="Örn: YapıMedya Ltd. Şti."
                value={compForm.name}
                onChange={e => setCompForm(f => ({ ...f, name: e.target.value }))}
                style={INPUT}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={LABEL}>Sektör</label>
                <select
                  value={compForm.sector}
                  onChange={e => setCompForm(f => ({ ...f, sector: e.target.value }))}
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
                  value={compForm.assigned_user}
                  onChange={e => setCompForm(f => ({ ...f, assigned_user: e.target.value }))}
                  style={INPUT}
                >
                  <option value="">-- Seçiniz --</option>
                  {users.map(u => (
                    <option key={u.username} value={u.username}>{u.username}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={LABEL}>Telefon</label>
                <input
                  type="text"
                  placeholder="Firma telefonu"
                  value={compForm.phone}
                  onChange={e => setCompForm(f => ({ ...f, phone: e.target.value }))}
                  style={INPUT}
                />
              </div>

              <div>
                <label style={LABEL}>E-posta</label>
                <input
                  type="email"
                  placeholder="firma@email.com"
                  value={compForm.email}
                  onChange={e => setCompForm(f => ({ ...f, email: e.target.value }))}
                  style={INPUT}
                />
              </div>

              <div>
                <label style={LABEL}>Website</label>
                <input
                  type="text"
                  placeholder="www.adres.com"
                  value={compForm.website}
                  onChange={e => setCompForm(f => ({ ...f, website: e.target.value }))}
                  style={INPUT}
                />
              </div>

              <div>
                <label style={LABEL}>Instagram</label>
                <input
                  type="text"
                  placeholder="@kullanici"
                  value={compForm.instagram}
                  onChange={e => setCompForm(f => ({ ...f, instagram: e.target.value }))}
                  style={INPUT}
                />
              </div>
            </div>

            <div>
              <label style={LABEL}>Notlar</label>
              <textarea
                placeholder="Firma hakkında notlar..."
                value={compForm.notes}
                onChange={e => setCompForm(f => ({ ...f, notes: e.target.value }))}
                style={{ ...INPUT, height: 60, resize: "none" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={() => setCompanyModal({ open: false, editing: null })} style={{
                background: "transparent", border: "1px solid var(--c-border)",
                color: "var(--c-text)", padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer"
              }}>Vazgeç</button>
              <button type="submit" disabled={isPending} style={{
                background: "#ef4444", color: "#fff", border: "none",
                padding: "8px 20px", borderRadius: 8, fontSize: 12, cursor: isPending ? "wait" : "pointer"
              }}>{isPending ? "Kaydediliyor..." : "Kaydet"}</button>
            </div>
          </form>
        </div>
      )}

      {/* ── 2. Yetkili Modal ── */}
      {contactModal.open && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)",
        }}>
          <form onSubmit={handleContactSubmit} style={{
            background: "var(--c-surface)", border: "1px solid var(--c-border)",
            borderRadius: 16, width: "100%", maxWidth: 400, padding: 24,
            boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", gap: 16,
          }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--c-text)" }}>
              {contactModal.editing ? "Yetkiliyi Düzenle" : "Yeni Yetkili Ekle"}
            </h3>

            {formError && <div style={{ color: "#f87171", fontSize: 12 }}>{formError}</div>}

            <div>
              <label style={LABEL}>Yetkili Ad Soyad *</label>
              <input
                type="text"
                placeholder="Örn: Ahmet Yılmaz"
                value={contForm.name}
                onChange={e => setContForm(f => ({ ...f, name: e.target.value }))}
                style={INPUT}
                required
              />
            </div>

            <div>
              <label style={LABEL}>Firma Rolü / Unvanı</label>
              <input
                type="text"
                placeholder="Örn: Pazarlama Müdürü"
                value={contForm.role}
                onChange={e => setContForm(f => ({ ...f, role: e.target.value }))}
                style={INPUT}
              />
            </div>

            <div>
              <label style={LABEL}>Telefon</label>
              <input
                type="text"
                placeholder="Yetkili telefon"
                value={contForm.phone}
                onChange={e => setContForm(f => ({ ...f, phone: e.target.value }))}
                style={INPUT}
              />
            </div>

            <div>
              <label style={LABEL}>E-posta</label>
              <input
                type="email"
                placeholder="yetkili@email.com"
                value={contForm.email}
                onChange={e => setContForm(f => ({ ...f, email: e.target.value }))}
                style={INPUT}
              />
            </div>

            <div>
              <label style={LABEL}>Instagram</label>
              <input
                type="text"
                placeholder="@kullanici"
                value={contForm.instagram}
                onChange={e => setContForm(f => ({ ...f, instagram: e.target.value }))}
                style={INPUT}
              />
            </div>

            <div>
              <label style={LABEL}>Kişisel Not</label>
              <textarea
                placeholder="Yetkili hakkında not..."
                value={contForm.notes}
                onChange={e => setContForm(f => ({ ...f, notes: e.target.value }))}
                style={{ ...INPUT, height: 60, resize: "none" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={() => setContactModal({ open: false, editing: null })} style={{
                background: "transparent", border: "1px solid var(--c-border)",
                color: "var(--c-text)", padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer"
              }}>Vazgeç</button>
              <button type="submit" disabled={isPending} style={{
                background: "#a78bfa", color: "#fff", border: "none",
                padding: "8px 20px", borderRadius: 8, fontSize: 12, cursor: isPending ? "wait" : "pointer"
              }}>{isPending ? "Kaydediliyor..." : "Kaydet"}</button>
            </div>
          </form>
        </div>
      )}

      {/* ── 3. Firma Silme Onay Modalı ── */}
      {deleteTargetComp && (
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
              Firmayı Sil
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--c-text2)", lineHeight: 1.5 }}>
              <strong>{deleteTargetComp.name}</strong> firmasını silmek istediğinize emin misiniz? Firma silindiğinde bağlı yetkili rehberi de tamamen silinecektir. Bu işlem geri alınamaz.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button onClick={() => setDeleteTargetComp(null)} style={{
                background: "transparent", border: "1px solid var(--c-border)",
                color: "var(--c-text)", padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer"
              }}>İptal</button>
              <button onClick={handleCompanyDelete} disabled={isPending} style={{
                background: "#ef4444", color: "#fff", border: "none",
                padding: "8px 18px", borderRadius: 8, fontSize: 12, cursor: isPending ? "wait" : "pointer"
              }}>{isPending ? "Siliniyor..." : "Evet, Sil"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Yetkili Silme Onay Modalı ── */}
      {deleteTargetCont && (
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
              Yetkiliyi Sil
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--c-text2)", lineHeight: 1.5 }}>
              <strong>{deleteTargetCont.name}</strong> yetkilisini rehberden silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button onClick={() => setDeleteTargetCont(null)} style={{
                background: "transparent", border: "1px solid var(--c-border)",
                color: "var(--c-text)", padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer"
              }}>İptal</button>
              <button onClick={handleContactDelete} disabled={isPending} style={{
                background: "#ef4444", color: "#fff", border: "none",
                padding: "8px 18px", borderRadius: 8, fontSize: 12, cursor: isPending ? "wait" : "pointer"
              }}>{isPending ? "Siliniyor..." : "Evet, Sil"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
