"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { markMessageRead } from "@/lib/actions/read";
import { addMessageNote, deleteMessageNote } from "@/lib/actions/notes";

type Read = { username: string; read_at: string };
type Note = { id: string; username: string; content: string; created_at: string };
type DetailData = {
  reads: Read[];
  notes: Note[];
  allUsers: string[];
  currentUsername: string;
};

type Props = {
  id: string;
  table: "contacts" | "audits";
  data: Record<string, unknown>;
  onClose: () => void;
};

function fmt(ts: string) {
  return new Date(ts).toLocaleString("tr-TR", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtShort(ts: string) {
  return new Date(ts).toLocaleString("tr-TR", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export function MessageModal({ id, table, data, onClose }: Props) {
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [noteText, setNoteText] = useState("");
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function loadDetail() {
    const res = await fetch(`/api/message-detail?id=${id}&table=${table}`);
    if (res.ok) setDetail(await res.json());
  }

  useEffect(() => {
    loadDetail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, table]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleMarkRead() {
    startTransition(async () => {
      await markMessageRead(id, table);
      await loadDetail();
    });
  }

  function handleAddNote() {
    const text = noteText.trim();
    if (!text) return;
    startTransition(async () => {
      await addMessageNote(id, table, text);
      setNoteText("");
      await loadDetail();
    });
  }

  function handleDeleteNote(noteId: string) {
    startTransition(async () => {
      await deleteMessageNote(noteId);
      await loadDetail();
    });
  }

  const hasRead = detail?.reads.some(r => r.username === detail.currentUsername);
  const notReaders = detail ? detail.allUsers.filter(u => !detail.reads.some(r => r.username === u)) : [];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.65)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--c-surface)",
          border: "1px solid var(--c-border2)",
          borderRadius: 16,
          width: "100%",
          maxWidth: 700,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "18px 24px",
          borderBottom: "1px solid var(--c-border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--c-text)" }}>
            {table === "contacts" ? "İletişim Mesajı" : "Audit Başvurusu"}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: "var(--c-dim)", fontSize: 18, lineHeight: 1, padding: "2px 6px",
            }}
          >✕</button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* ── Message content ── */}
          <section>
            <SectionLabel>Mesaj Bilgileri</SectionLabel>
            {table === "contacts" ? (
              <ContactDetail data={data} />
            ) : (
              <AuditDetail data={data} />
            )}
          </section>

          {/* ── Read status ── */}
          <section>
            <SectionLabel>Okunma Durumu</SectionLabel>
            {!detail ? (
              <Spinner />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {detail.reads.length === 0 && notReaders.length === 0 && (
                  <span style={{ fontSize: 13, color: "var(--c-dim)" }}>Henüz kimse okumadı.</span>
                )}

                {detail.reads.map(r => (
                  <div key={r.username} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      fontSize: 11, padding: "2px 8px", borderRadius: 20,
                      background: "rgba(74,222,128,0.1)", color: "#4ade80",
                      border: "1px solid rgba(74,222,128,0.2)", fontWeight: 600,
                    }}>✓ Okudu</span>
                    <span style={{ fontSize: 13, color: "var(--c-text)", fontWeight: 500 }}>{r.username}</span>
                    <span style={{ fontSize: 12, color: "var(--c-dim)" }}>{fmtShort(r.read_at)}</span>
                  </div>
                ))}

                {notReaders.map(u => (
                  <div key={u} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      fontSize: 11, padding: "2px 8px", borderRadius: 20,
                      background: "var(--c-surface2)", color: "var(--c-dim)",
                      border: "1px solid var(--c-border)", fontWeight: 500,
                    }}>Okumadı</span>
                    <span style={{ fontSize: 13, color: "var(--c-text2)" }}>{u}</span>
                  </div>
                ))}

                {!hasRead && (
                  <button
                    onClick={handleMarkRead}
                    disabled={isPending}
                    style={{
                      marginTop: 8, alignSelf: "flex-start",
                      background: "#9b1c1c", color: "#fff", border: "none",
                      borderRadius: 8, padding: "8px 18px", fontSize: 13,
                      fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer",
                      opacity: isPending ? 0.7 : 1,
                    }}
                  >
                    {isPending ? "İşleniyor…" : "Okundu İşaretle"}
                  </button>
                )}
              </div>
            )}
          </section>

          {/* ── Notes ── */}
          <section>
            <SectionLabel>Notlar</SectionLabel>
            {!detail ? (
              <Spinner />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {detail.notes.length === 0 && (
                  <span style={{ fontSize: 13, color: "var(--c-dim)" }}>Henüz not eklenmedi.</span>
                )}
                {detail.notes.map(n => (
                  <div key={n.id} style={{
                    background: "var(--c-surface2)", border: "1px solid var(--c-border)",
                    borderRadius: 8, padding: "10px 14px",
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--c-text2)" }}>{n.username}</span>
                        <span style={{ fontSize: 11, color: "var(--c-dim)" }}>{fmtShort(n.created_at)}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: "var(--c-text)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                        {n.content}
                      </p>
                    </div>
                    {n.username === detail.currentUsername && (
                      <button
                        onClick={() => handleDeleteNote(n.id)}
                        disabled={isPending}
                        style={{
                          background: "transparent", border: "none", cursor: "pointer",
                          color: "var(--c-dim)", fontSize: 13, padding: "2px 4px", flexShrink: 0,
                        }}
                        title="Notu sil"
                      >✕</button>
                    )}
                  </div>
                ))}

                {/* Add note */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                  <textarea
                    ref={textareaRef}
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAddNote();
                    }}
                    placeholder="Not ekle… (Ctrl+Enter ile gönder)"
                    rows={3}
                    style={{
                      background: "var(--c-input)", border: "1px solid var(--c-border2)",
                      borderRadius: 8, padding: "10px 12px", fontSize: 13,
                      color: "var(--c-text)", resize: "vertical", outline: "none",
                      fontFamily: "inherit",
                    }}
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={isPending || !noteText.trim()}
                    style={{
                      alignSelf: "flex-end",
                      background: isPending || !noteText.trim() ? "var(--c-border)" : "#800000",
                      color: isPending || !noteText.trim() ? "var(--c-dim)" : "#fff",
                      border: "none", borderRadius: 8, padding: "7px 18px",
                      fontSize: 13, fontWeight: 600,
                      cursor: isPending || !noteText.trim() ? "not-allowed" : "pointer",
                    }}
                  >
                    {isPending ? "Kaydediliyor…" : "Not Ekle"}
                  </button>
                </div>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      margin: "0 0 10px", fontSize: 11, fontWeight: 600,
      color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.07em",
    }}>
      {children}
    </p>
  );
}

function Spinner() {
  return <span style={{ fontSize: 13, color: "var(--c-dim)" }}>Yükleniyor…</span>;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontSize: 11, color: "var(--c-dim)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
      <span style={{ fontSize: 14, color: "var(--c-text)", lineHeight: 1.6 }}>{value}</span>
    </div>
  );
}

function ContactDetail({ data }: { data: Record<string, unknown> }) {
  return (
    <div style={{
      background: "var(--c-surface2)", border: "1px solid var(--c-border)",
      borderRadius: 10, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14,
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="İsim" value={String(data.name ?? "—")} />
        <Field label="Tarih" value={data.created_at ? fmt(String(data.created_at)) : "—"} />
        <Field label="E-posta" value={
          <a href={`mailto:${data.email}`} style={{ color: "#f87171", textDecoration: "none" }}>
            {String(data.email ?? "—")}
          </a>
        } />
        <Field label="Telefon" value={
          data.phone
            ? <a href={`tel:${data.phone}`} style={{ color: "var(--c-text2)", textDecoration: "none" }}>{String(data.phone)}</a>
            : <span style={{ color: "var(--c-dim)" }}>—</span>
        } />
      </div>
      {!!data.message && (
        <div>
          <span style={{ fontSize: 11, color: "var(--c-dim)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Mesaj</span>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--c-text)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {String(data.message)}
          </p>
        </div>
      )}
    </div>
  );
}

function scoreColor(s: number) {
  if (s === 0) return "var(--c-dim)";
  if (s < 40)  return "#f87171";
  if (s < 60)  return "#fb923c";
  if (s < 80)  return "#facc15";
  return "#4ade80";
}

function AuditDetail({ data }: { data: Record<string, unknown> }) {
  const scores = [
    { key: "score_overall",   label: "Genel" },
    { key: "score_instagram", label: "Instagram" },
    { key: "score_linkedin",  label: "LinkedIn" },
    { key: "score_youtube",   label: "YouTube" },
    { key: "score_google",    label: "Google" },
  ];

  return (
    <div style={{
      background: "var(--c-surface2)", border: "1px solid var(--c-border)",
      borderRadius: 10, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14,
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="İşletme" value={String(data.business_name ?? "—")} />
        <Field label="Sektör" value={String(data.sector ?? "—")} />
        <Field label="E-posta" value={
          <a href={`mailto:${data.email}`} style={{ color: "#f87171", textDecoration: "none" }}>
            {String(data.email ?? "—")}
          </a>
        } />
        <Field label="Telefon" value={
          <a href={`tel:${data.phone}`} style={{ color: "var(--c-text2)", textDecoration: "none" }}>
            {String(data.phone ?? "—")}
          </a>
        } />
        <Field label="Tarih" value={data.created_at ? fmt(String(data.created_at)) : "—"} />
        <Field label="Mod" value={
          <span style={{
            fontSize: 12, padding: "2px 8px", borderRadius: 5,
            background: data.mode === "screenshot" ? "#0c1a2e" : "#1a0e2e",
            color: data.mode === "screenshot" ? "#60a5fa" : "#a78bfa",
          }}>
            {data.mode === "screenshot" ? "Ekran görüntüsü" : "Manuel"}
          </span>
        } />
      </div>

      {/* Scores */}
      <div>
        <span style={{ fontSize: 11, color: "var(--c-dim)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Skorlar</span>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
          {scores.map(({ key, label }) => {
            const val = Number(data[key] ?? 0);
            return (
              <div key={key} style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: 18, fontWeight: 700, color: scoreColor(val),
                  background: `${scoreColor(val)}18`, borderRadius: 8,
                  padding: "6px 14px", minWidth: 52,
                }}>
                  {val === 0 ? "—" : val}
                </div>
                <div style={{ fontSize: 10, color: "var(--c-dim)", marginTop: 3 }}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {!!data.report_text && String(data.report_text).trim() && (
        <div>
          <span style={{ fontSize: 11, color: "var(--c-dim)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Rapor</span>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--c-text)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {String(data.report_text)}
          </p>
        </div>
      )}
    </div>
  );
}
