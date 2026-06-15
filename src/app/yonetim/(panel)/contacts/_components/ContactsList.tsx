"use client";

import { useState } from "react";
import { ReadToggleButton } from "../../_components/ReadToggleButton";
import { MessageModal } from "../../_components/MessageModal";

type Contact = Record<string, unknown>;

export function ContactsList({ contacts }: { contacts: Contact[] }) {
  const [selected, setSelected] = useState<Contact | null>(null);

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {contacts.map((c) => {
          const isRead = Boolean(c.is_read);
          return (
            <div
              key={String(c.id)}
              onClick={() => setSelected(c)}
              style={{
                background: isRead ? "var(--c-surface2)" : "var(--c-warm)",
                border: "1px solid",
                borderColor: isRead ? "var(--c-border)" : "var(--c-warm-b)",
                borderLeft: isRead ? "1px solid var(--c-border)" : "3px solid #c0392b",
                borderRadius: 12,
                padding: "18px 22px",
                display: "grid",
                gridTemplateColumns: "1fr 220px",
                gap: 24,
                alignItems: "start",
                cursor: "pointer",
                transition: "opacity 0.1s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              {/* Left: contact info */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: isRead ? "var(--c-text3)" : "var(--c-text)" }}>
                    {String(c.name)}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--c-dim)" }}>
                    {new Date(String(c.created_at)).toLocaleString("tr-TR", {
                      day: "2-digit", month: "long", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--c-dim)", padding: "1px 6px", borderRadius: 4, border: "1px solid var(--c-border)" }}>
                    detay için tıkla
                  </span>
                </div>

                <p style={{
                  margin: 0, fontSize: 14,
                  color: isRead ? "var(--c-dim)" : "var(--c-text)",
                  lineHeight: 1.7, whiteSpace: "pre-wrap",
                  display: "-webkit-box", WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {String(c.message ?? "—")}
                </p>

                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <a
                    href={`mailto:${c.email}`}
                    onClick={e => e.stopPropagation()}
                    style={{ color: isRead ? "var(--c-text3)" : "#f87171", textDecoration: "none", fontSize: 13, fontWeight: 500 }}
                  >
                    {String(c.email)}
                  </a>
                  {c.phone && (
                    <a
                      href={`tel:${c.phone}`}
                      onClick={e => e.stopPropagation()}
                      style={{ color: isRead ? "var(--c-dim)" : "var(--c-text2)", textDecoration: "none", fontSize: 13 }}
                    >
                      {String(c.phone)}
                    </a>
                  )}
                </div>
              </div>

              {/* Right: read status */}
              <div
                style={{ display: "flex", justifyContent: "flex-end", paddingTop: 2 }}
                onClick={e => e.stopPropagation()}
              >
                <ReadToggleButton
                  id={String(c.id)}
                  isRead={isRead}
                  readBy={c.read_by ? String(c.read_by) : null}
                  readAt={c.read_at ? String(c.read_at) : null}
                  table="contacts"
                />
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <MessageModal
          id={String(selected.id)}
          table="contacts"
          data={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
