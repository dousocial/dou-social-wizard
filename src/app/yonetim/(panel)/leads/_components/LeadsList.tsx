"use client";

import { useState } from "react";
import { AuditPDFButton } from "@/components/admin/AuditPDFButton";
import { ReadToggleButton } from "../../_components/ReadToggleButton";
import { MessageModal } from "../../_components/MessageModal";

type Audit = Record<string, unknown>;

const SCORE_KEYS = ["score_overall", "score_instagram", "score_linkedin", "score_youtube", "score_google"] as const;

function scoreColor(s: number) {
  if (s === 0) return "#3a3a3a";
  if (s < 40)  return "#f87171";
  if (s < 60)  return "#fb923c";
  if (s < 80)  return "#facc15";
  return "#4ade80";
}

function ScoreChip({ score }: { score: number }) {
  if (score === 0) return <span style={{ color: "var(--c-dim)", fontSize: 12 }}>—</span>;
  return (
    <span style={{
      fontWeight: 600, fontSize: 12,
      color: scoreColor(score),
      background: `${scoreColor(score)}1a`,
      padding: "2px 7px", borderRadius: 6,
    }}>
      {score}
    </span>
  );
}

const th: React.CSSProperties = { padding: "10px 13px", fontSize: 11, fontWeight: 500, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.07em", background: "var(--c-surface)", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "11px 13px", color: "var(--c-text2)", verticalAlign: "middle" };

export function LeadsList({ audits }: { audits: Audit[] }) {
  const [selected, setSelected] = useState<Audit | null>(null);

  return (
    <>
      <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid var(--c-border)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              {["Tarih", "İşletme", "Sektör", "Telefon", "E-posta", "Genel", "IG", "LI", "YT", "GB", "Mod", "PDF", "Durum"].map((h, i) => (
                <th key={h} style={{ ...th, textAlign: i >= 5 && i <= 9 ? "center" : "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {audits.map((a, i) => {
              const isRead = Boolean(a.is_read);
              return (
                <tr
                  key={String(a.id)}
                  onClick={() => setSelected(a)}
                  style={{
                    borderTop: "1px solid var(--c-border)",
                    background: isRead ? (i % 2 === 0 ? "var(--c-bg)" : "var(--c-surface2)") : "var(--c-warm)",
                    borderLeft: isRead ? "none" : "2px solid #800000",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  <td style={td}>
                    <span style={{ fontSize: 11, color: "var(--c-dim)", whiteSpace: "nowrap" }}>
                      {new Date(String(a.created_at)).toLocaleString("tr-TR", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </td>
                  <td style={{ ...td, fontWeight: 600, color: "var(--c-text)" }}>{String(a.business_name)}</td>
                  <td style={{ ...td, color: "var(--c-text3)" }}>{String(a.sector)}</td>
                  <td style={td} onClick={e => e.stopPropagation()}>
                    <a href={`tel:${a.phone}`} style={{ color: "#f87171", textDecoration: "none" }}>{String(a.phone)}</a>
                  </td>
                  <td style={td} onClick={e => e.stopPropagation()}>
                    <a href={`mailto:${a.email}`} style={{ color: "#f87171", textDecoration: "none" }}>{String(a.email)}</a>
                  </td>
                  {SCORE_KEYS.map((k) => (
                    <td key={k} style={{ ...td, textAlign: "center" }}>
                      <ScoreChip score={Number(a[k])} />
                    </td>
                  ))}
                  <td style={td}>
                    <span style={{
                      fontSize: 11, padding: "2px 8px", borderRadius: 5,
                      background: a.mode === "screenshot" ? "#0c1a2e" : "#1a0e2e",
                      color: a.mode === "screenshot" ? "#60a5fa" : "#a78bfa",
                    }}>
                      {a.mode === "screenshot" ? "Ekran görüntüsü" : "Manuel"}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: "center" }} onClick={e => e.stopPropagation()}>
                    <AuditPDFButton
                      audit={{
                        businessName: String(a.business_name),
                        sector:       String(a.sector),
                        phone:        String(a.phone),
                        email:        String(a.email),
                        createdAt:    String(a.created_at),
                        reportText:   String(a.report_text ?? ""),
                        scores: {
                          overall:   Number(a.score_overall),
                          instagram: Number(a.score_instagram),
                          linkedin:  Number(a.score_linkedin),
                          youtube:   Number(a.score_youtube),
                          google:    Number(a.score_google),
                        },
                      }}
                    />
                  </td>
                  <td style={td} onClick={e => e.stopPropagation()}>
                    <ReadToggleButton
                      id={String(a.id)}
                      isRead={isRead}
                      readBy={a.read_by ? String(a.read_by) : null}
                      readAt={a.read_at ? String(a.read_at) : null}
                      table="audits"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <MessageModal
          id={String(selected.id)}
          table="audits"
          data={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
