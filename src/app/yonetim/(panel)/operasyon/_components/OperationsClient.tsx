"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addReference, addShoot, deleteMonthlyPlan, deleteReference, deleteShoot,
  generateMonthlyPlans, saveMonthlyPlan, updateReferenceStatus, updateShootStatus,
  type ReferenceInput, type ShootInput,
} from "@/lib/actions/crmOperations";

type Client = { id: string; ad: string; sektor: string };
type RelatedClient = { ad: string } | Array<{ ad: string }> | null;
type Plan = {
  id: string; client_id: string; period: string; status: "taslak" | "planlaniyor" | "aktif" | "tamamlandi";
  agreed_post_count: number; planned_post_count: number; produced_post_count: number; published_post_count: number;
  agreed_video_count: number; planned_video_count: number; shot_video_count: number; edited_video_count: number; published_video_count: number;
  agreed_shoot_days: number; notes: string; musteriler: RelatedClient;
};
type Reference = {
  id: string; client_id: string; period: string | null; title: string; source_url: string; preview_url: string;
  source_platform: ReferenceInput["source_platform"]; content_type: ReferenceInput["content_type"];
  description: string; adapt_notes: string; status: NonNullable<ReferenceInput["status"]>; musteriler: RelatedClient;
};
type Shoot = {
  id: string; client_id: string; shoot_date: string; start_time: string | null; end_time: string | null; location: string;
  team_members: string[]; content_titles: string[]; equipment: string[]; status: NonNullable<ShootInput["status"]>;
  client_informed: boolean; team_informed: boolean; extra_reason: string; coordinator_approved: boolean; musteriler: RelatedClient;
};
type Tab = "planlar" | "referanslar" | "cekimler";

const INPUT: React.CSSProperties = { width: "100%", padding: "9px 11px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-input)", color: "var(--c-text)", fontSize: 13, boxSizing: "border-box" };
const LABEL: React.CSSProperties = { display: "block", fontSize: 10, fontWeight: 700, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5 };
const CARD: React.CSSProperties = { background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12 };

function clientName(value: RelatedClient) {
  return Array.isArray(value) ? value[0]?.ad || "Müşteri" : value?.ad || "Müşteri";
}
function currentPeriod() { return new Date().toISOString().slice(0, 7); }
function percent(value: number, target: number) { return target ? Math.min(100, Math.round((value / target) * 100)) : 0; }

export function OperationsClient({ clients, plans, references, shoots }: { clients: Client[]; plans: Plan[]; references: Reference[]; shoots: Shoot[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("planlar");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [planOpen, setPlanOpen] = useState(false);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [shootOpen, setShootOpen] = useState(false);
  const [planForm, setPlanForm] = useState({ client_id: "", period: currentPeriod(), agreed_post_count: "0", planned_post_count: "0", produced_post_count: "0", published_post_count: "0", agreed_video_count: "0", planned_video_count: "0", shot_video_count: "0", edited_video_count: "0", published_video_count: "0", agreed_shoot_days: "0", notes: "" });
  const [referenceForm, setReferenceForm] = useState({ client_id: "", period: currentPeriod(), title: "", source_url: "", preview_url: "", source_platform: "instagram" as ReferenceInput["source_platform"], content_type: "video" as ReferenceInput["content_type"], description: "", adapt_notes: "" });
  const [shootForm, setShootForm] = useState({ client_id: "", shoot_date: new Date().toISOString().slice(0, 10), start_time: "10:00", end_time: "12:00", location: "", team_members: "", client_contact: "", content_titles: "", equipment: "", required_products: "", speakers: "", wardrobe: "", notes: "", client_informed: false, team_informed: false, status: "planlaniyor" as ShootInput["status"], extra_reason: "", coordinator_approved: false, adaptation_period: false, extra_fee: false });

  async function run(task: () => Promise<{ error: string | null }>, close?: () => void) {
    setPending(true); setMessage(""); const result = await task(); setPending(false);
    if (result.error) setMessage(result.error); else { close?.(); router.refresh(); }
  }
  async function handleGenerate() {
    await run(async () => generateMonthlyPlans(currentPeriod()));
  }
  async function handlePlanSubmit(e: React.FormEvent) {
    e.preventDefault();
    await run(() => saveMonthlyPlan({ client_id: planForm.client_id, period: planForm.period, status: "planlaniyor", agreed_post_count: Number(planForm.agreed_post_count), planned_post_count: Number(planForm.planned_post_count), produced_post_count: Number(planForm.produced_post_count), published_post_count: Number(planForm.published_post_count), agreed_video_count: Number(planForm.agreed_video_count), planned_video_count: Number(planForm.planned_video_count), shot_video_count: Number(planForm.shot_video_count), edited_video_count: Number(planForm.edited_video_count), published_video_count: Number(planForm.published_video_count), agreed_shoot_days: Number(planForm.agreed_shoot_days), notes: planForm.notes }), () => setPlanOpen(false));
  }
  async function handleReferenceSubmit(e: React.FormEvent) {
    e.preventDefault();
    await run(() => addReference({ ...referenceForm, status: "havuzda" }), () => setReferenceOpen(false));
  }
  async function handleShootSubmit(e: React.FormEvent) {
    e.preventDefault();
    await run(() => addShoot({ ...shootForm, team_members: shootForm.team_members.split(","), content_titles: shootForm.content_titles.split(","), equipment: shootForm.equipment.split(",") }), () => setShootOpen(false));
  }

  const tabs: Array<{ key: Tab; label: string; count: number }> = [
    { key: "planlar", label: "Aylık Planlar", count: plans.length }, { key: "referanslar", label: "Referans Havuzu", count: references.length }, { key: "cekimler", label: "Çekim Takvimi", count: shoots.length },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div><h1 style={{ margin: 0, fontSize: 18, color: "var(--c-text)" }}>Operasyon Merkezi</h1><p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--c-dim)" }}>Aylık içerik hakları, referanslar ve çekimler.</p></div>
        <div style={{ display: "flex", gap: 8 }}>
          {tab === "planlar" && <><button onClick={handleGenerate} disabled={pending} style={secondary}>Bu Ayı Sözleşmelerden Oluştur</button><button onClick={() => setPlanOpen(true)} style={primary}>+ Plan</button></>}
          {tab === "referanslar" && <button onClick={() => setReferenceOpen(true)} style={primary}>+ Referans</button>}
          {tab === "cekimler" && <button onClick={() => setShootOpen(true)} style={primary}>+ Çekim</button>}
        </div>
      </div>
      {message && <div style={{ padding: 11, borderRadius: 8, background: "rgba(248,113,113,.08)", color: "#f87171", fontSize: 12 }}>{message}</div>}
      <div style={{ display: "flex", borderBottom: "1px solid var(--c-border)" }}>{tabs.map(item => <button key={item.key} onClick={() => setTab(item.key)} style={{ background: "transparent", border: "none", borderBottom: tab === item.key ? "2px solid #8b5cf6" : "2px solid transparent", color: tab === item.key ? "#a78bfa" : "var(--c-dim)", padding: "10px 16px", cursor: "pointer", fontWeight: 600 }}>{item.label} ({item.count})</button>)}</div>

      {tab === "planlar" && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(330px,1fr))", gap: 14 }}>
        {plans.map(plan => { const postMissing = plan.planned_post_count < plan.agreed_post_count; const videoMissing = plan.planned_video_count < plan.agreed_video_count; return <article key={plan.id} style={{ ...CARD, padding: 18, borderTop: `3px solid ${postMissing || videoMissing ? "#f59e0b" : "#10b981"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ fontSize: 14, fontWeight: 700, color: "var(--c-text)" }}>{clientName(plan.musteriler)}</div><div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 2 }}>{plan.period} · {plan.status}</div></div><button onClick={() => run(() => deleteMonthlyPlan(plan.id))} style={dangerButton}>Sil</button></div>
          {[{ label: "Post", value: plan.published_post_count, planned: plan.planned_post_count, agreed: plan.agreed_post_count }, { label: "Video", value: plan.published_video_count, planned: plan.planned_video_count, agreed: plan.agreed_video_count }].map(row => <div key={row.label} style={{ marginTop: 14 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--c-text2)" }}><span>{row.label}: {row.value} yayınlandı</span><span>{row.planned}/{row.agreed} planlandı</span></div><div style={{ height: 6, background: "var(--c-border)", borderRadius: 6, marginTop: 6, overflow: "hidden" }}><div style={{ width: `${percent(row.value, row.agreed)}%`, height: "100%", background: "#10b981" }} /></div>{row.planned < row.agreed && <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 4 }}>{row.agreed - row.planned} içerik eksik planlandı</div>}</div>)}
          <div style={{ marginTop: 12, fontSize: 11, color: "var(--c-dim)" }}>Çekim hakkı: {plan.agreed_shoot_days} gün</div>
        </article>; })}
        {plans.length === 0 && <Empty text="Henüz aylık plan oluşturulmadı." />}
      </div>}

      {tab === "referanslar" && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
        {references.map(ref => <article key={ref.id} style={{ ...CARD, overflow: "hidden" }}><div style={{ height: 130, background: ref.preview_url ? `center/cover url(${JSON.stringify(ref.preview_url)})` : "linear-gradient(135deg,#312e81,#831843)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.65)", fontSize: 12 }}>{!ref.preview_url && ref.source_platform}</div><div style={{ padding: 14 }}><div style={{ fontSize: 10, color: "#a78bfa", textTransform: "uppercase", fontWeight: 700 }}>{clientName(ref.musteriler)} · {ref.content_type}</div><h3 style={{ margin: "6px 0", fontSize: 14, color: "var(--c-text)" }}>{ref.title}</h3><p style={{ margin: 0, fontSize: 11, color: "var(--c-dim)", minHeight: 32 }}>{ref.description || "Açıklama yok"}</p><select value={ref.status} onChange={e => run(() => updateReferenceStatus(ref.id, e.target.value as ReferenceInput["status"]))} style={{ ...INPUT, marginTop: 10, padding: 6 }}><option value="havuzda">Havuzda</option><option value="incelenecek">İncelenecek</option><option value="secildi">Seçildi</option><option value="musteriye_gosterilecek">Müşteriye Gösterilecek</option><option value="uretime_alinacak">Üretime Alınacak</option><option value="elendi">Elendi</option><option value="kullanildi">Kullanıldı</option></select><div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>{ref.source_url ? <a href={ref.source_url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#60a5fa" }}>Kaynağı aç ↗</a> : <span />}<button onClick={() => run(() => deleteReference(ref.id))} style={dangerButton}>Sil</button></div></div></article>)}
        {references.length === 0 && <Empty text="Referans havuzu boş." />}
      </div>}

      {tab === "cekimler" && <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {shoots.map(shoot => <article key={shoot.id} style={{ ...CARD, padding: 16, display: "grid", gridTemplateColumns: "110px 1fr 180px", gap: 16, alignItems: "center", borderLeft: `4px solid ${shoot.status === "tamamlandi" ? "#10b981" : "#f59e0b"}` }}><div><div style={{ fontSize: 18, fontWeight: 800, color: "var(--c-text)" }}>{new Date(shoot.shoot_date).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}</div><div style={{ fontSize: 11, color: "var(--c-dim)" }}>{shoot.start_time?.slice(0,5)}–{shoot.end_time?.slice(0,5)}</div></div><div><div style={{ fontSize: 14, fontWeight: 700, color: "var(--c-text)" }}>{clientName(shoot.musteriler)}</div><div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 3 }}>{shoot.location || "Konum belirtilmedi"} · {shoot.team_members.join(", ") || "Ekip atanmadı"}</div>{shoot.extra_reason && <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 5 }}>Ek çekim: {shoot.extra_reason}</div>}</div><div style={{ display: "flex", gap: 6 }}><select value={shoot.status} onChange={e => run(() => updateShootStatus(shoot.id, e.target.value as ShootInput["status"]))} style={{ ...INPUT, padding: 6 }}><option value="planlaniyor">Planlanıyor</option><option value="musteri_onayi">Müşteri Onayı</option><option value="ekip_onayi">Ekip Onayı</option><option value="kesinlesti">Kesinleşti</option><option value="yaklasiyor">Yaklaşıyor</option><option value="basladi">Başladı</option><option value="tamamlandi">Tamamlandı</option><option value="ertelendi">Ertelendi</option><option value="iptal">İptal</option></select><button onClick={() => run(() => deleteShoot(shoot.id))} style={dangerButton}>Sil</button></div></article>)}
        {shoots.length === 0 && <Empty text="Planlanmış çekim bulunmuyor." />}
      </div>}

      {planOpen && <Modal title="Aylık Plan" onClose={() => setPlanOpen(false)}><form onSubmit={handlePlanSubmit} style={formStyle}><ClientSelect clients={clients} value={planForm.client_id} onChange={v => setPlanForm(f => ({ ...f, client_id: v }))} /><Field label="Dönem"><input type="month" value={planForm.period} onChange={e => setPlanForm(f => ({ ...f, period: e.target.value }))} style={INPUT} required /></Field><div style={grid}>{(["agreed_post_count","planned_post_count","produced_post_count","published_post_count","agreed_video_count","planned_video_count","shot_video_count","edited_video_count","published_video_count","agreed_shoot_days"] as const).map(key => <Field key={key} label={key.replaceAll("_", " ")}><input type="number" min="0" value={planForm[key]} onChange={e => setPlanForm(f => ({ ...f, [key]: e.target.value }))} style={INPUT} /></Field>)}</div><Field label="Not"><textarea value={planForm.notes} onChange={e => setPlanForm(f => ({ ...f, notes: e.target.value }))} style={{ ...INPUT, height: 60 }} /></Field><Submit pending={pending} /></form></Modal>}
      {referenceOpen && <Modal title="Referans Ekle" onClose={() => setReferenceOpen(false)}><form onSubmit={handleReferenceSubmit} style={formStyle}><ClientSelect clients={clients} value={referenceForm.client_id} onChange={v => setReferenceForm(f => ({ ...f, client_id: v }))} /><div style={grid}><Field label="Başlık"><input value={referenceForm.title} onChange={e => setReferenceForm(f => ({ ...f, title: e.target.value }))} style={INPUT} required /></Field><Field label="Dönem"><input type="month" value={referenceForm.period} onChange={e => setReferenceForm(f => ({ ...f, period: e.target.value }))} style={INPUT} /></Field><Field label="Platform"><select value={referenceForm.source_platform} onChange={e => setReferenceForm(f => ({ ...f, source_platform: e.target.value as ReferenceInput["source_platform"] }))} style={INPUT}>{["instagram","pinterest","tiktok","youtube","rakip","dou","musteri","diger"].map(v => <option key={v}>{v}</option>)}</select></Field><Field label="Tür"><select value={referenceForm.content_type} onChange={e => setReferenceForm(f => ({ ...f, content_type: e.target.value as ReferenceInput["content_type"] }))} style={INPUT}>{["post","video","story","reklam","diger"].map(v => <option key={v}>{v}</option>)}</select></Field></div><Field label="Kaynak URL"><input type="url" value={referenceForm.source_url} onChange={e => setReferenceForm(f => ({ ...f, source_url: e.target.value }))} style={INPUT} /></Field><Field label="Önizleme URL"><input type="url" value={referenceForm.preview_url} onChange={e => setReferenceForm(f => ({ ...f, preview_url: e.target.value }))} style={INPUT} /></Field><Field label="Açıklama"><textarea value={referenceForm.description} onChange={e => setReferenceForm(f => ({ ...f, description: e.target.value }))} style={{ ...INPUT, height: 60 }} /></Field><Field label="Uyarlama Notu"><textarea value={referenceForm.adapt_notes} onChange={e => setReferenceForm(f => ({ ...f, adapt_notes: e.target.value }))} style={{ ...INPUT, height: 60 }} /></Field><Submit pending={pending} /></form></Modal>}
      {shootOpen && <Modal title="Çekim Planla" onClose={() => setShootOpen(false)}><form onSubmit={handleShootSubmit} style={formStyle}><ClientSelect clients={clients} value={shootForm.client_id} onChange={v => setShootForm(f => ({ ...f, client_id: v }))} /><div style={grid}><Field label="Tarih"><input type="date" value={shootForm.shoot_date} onChange={e => setShootForm(f => ({ ...f, shoot_date: e.target.value }))} style={INPUT} required /></Field><Field label="Konum"><input value={shootForm.location} onChange={e => setShootForm(f => ({ ...f, location: e.target.value }))} style={INPUT} /></Field><Field label="Başlangıç"><input type="time" value={shootForm.start_time} onChange={e => setShootForm(f => ({ ...f, start_time: e.target.value }))} style={INPUT} /></Field><Field label="Bitiş"><input type="time" value={shootForm.end_time} onChange={e => setShootForm(f => ({ ...f, end_time: e.target.value }))} style={INPUT} /></Field></div><Field label="Ekip Üyeleri"><input value={shootForm.team_members} onChange={e => setShootForm(f => ({ ...f, team_members: e.target.value }))} style={INPUT} placeholder="Virgülle ayırın" /></Field><Field label="Çekilecek İçerikler"><input value={shootForm.content_titles} onChange={e => setShootForm(f => ({ ...f, content_titles: e.target.value }))} style={INPUT} placeholder="Virgülle ayırın" /></Field><Field label="Ekipman"><input value={shootForm.equipment} onChange={e => setShootForm(f => ({ ...f, equipment: e.target.value }))} style={INPUT} placeholder="Virgülle ayırın" /></Field><Field label="Ek Çekim Nedeni (4. çekimde zorunlu)"><textarea value={shootForm.extra_reason} onChange={e => setShootForm(f => ({ ...f, extra_reason: e.target.value }))} style={{ ...INPUT, height: 55 }} /></Field><div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}><Check label="Müşteri bilgilendirildi" checked={shootForm.client_informed} onChange={v => setShootForm(f => ({ ...f, client_informed: v }))} /><Check label="Ekip bilgilendirildi" checked={shootForm.team_informed} onChange={v => setShootForm(f => ({ ...f, team_informed: v }))} /><Check label="Koordinatör onayı" checked={shootForm.coordinator_approved} onChange={v => setShootForm(f => ({ ...f, coordinator_approved: v }))} /><Check label="Adaptasyon süreci" checked={shootForm.adaptation_period} onChange={v => setShootForm(f => ({ ...f, adaptation_period: v }))} /><Check label="Ek ücret" checked={shootForm.extra_fee} onChange={v => setShootForm(f => ({ ...f, extra_fee: v }))} /></div><Submit pending={pending} /></form></Modal>}
    </div>
  );
}

const primary: React.CSSProperties = { border: "none", background: "#8b5cf6", color: "#fff", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 600 };
const secondary: React.CSSProperties = { ...primary, background: "transparent", color: "#a78bfa", border: "1px solid rgba(167,139,250,.3)" };
const dangerButton: React.CSSProperties = { border: "none", background: "transparent", color: "#f87171", cursor: "pointer", fontSize: 11 };
const formStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 12 };
const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };
function Empty({ text }: { text: string }) { return <div style={{ ...CARD, padding: 44, textAlign: "center", color: "var(--c-dim)", fontSize: 13 }}>{text}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><label style={LABEL}>{label}</label>{children}</div>; }
function ClientSelect({ clients, value, onChange }: { clients: Client[]; value: string; onChange: (value: string) => void }) { return <Field label="Müşteri"><select value={value} onChange={e => onChange(e.target.value)} style={INPUT} required><option value="">Seçiniz</option>{clients.map(client => <option key={client.id} value={client.id}>{client.ad}</option>)}</select></Field>; }
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label style={{ fontSize: 11, color: "var(--c-text2)" }}><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} /> {label}</label>; }
function Submit({ pending }: { pending: boolean }) { return <button type="submit" disabled={pending} style={{ ...primary, alignSelf: "flex-end" }}>{pending ? "Kaydediliyor..." : "Kaydet"}</button>; }
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) { return <div style={{ position: "fixed", inset: 0, zIndex: 150, background: "rgba(0,0,0,.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}><div role="dialog" aria-modal="true" aria-label={title} style={{ width: "100%", maxWidth: 680, maxHeight: "92vh", overflowY: "auto", background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 24 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}><h2 style={{ margin: 0, fontSize: 16, color: "var(--c-text)" }}>{title}</h2><button type="button" onClick={onClose} aria-label="Kapat" style={{ background: "transparent", border: "none", color: "var(--c-dim)", cursor: "pointer" }}>✕</button></div>{children}</div></div>; }
