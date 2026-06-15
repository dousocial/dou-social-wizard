"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type UnreadData = {
  contacts: number;
  audits: number;
  total: number;
  latestContactAt: string | null;
  latestAuditAt: string | null;
};

function playAlert() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {}
}

export function NotificationBell() {
  const [data, setData] = useState<UnreadData | null>(null);
  const [open, setOpen] = useState(false);
  const prevContactAt = useRef<string | null>(null);
  const prevAuditAt = useRef<string | null>(null);
  const initialized = useRef(false);
  const router = useRouter();

  // Request notification permission on mount (proactively)
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  async function poll() {
    try {
      const res = await fetch("/api/unread-count");
      if (!res.ok) return;
      const d: UnreadData = await res.json();
      setData(d);

      if (!initialized.current) {
        prevContactAt.current = d.latestContactAt;
        prevAuditAt.current = d.latestAuditAt;
        initialized.current = true;
        return;
      }

      const newContact = d.latestContactAt && d.latestContactAt !== prevContactAt.current;
      const newAudit = d.latestAuditAt && d.latestAuditAt !== prevAuditAt.current;

      if (newContact || newAudit) {
        prevContactAt.current = d.latestContactAt;
        prevAuditAt.current = d.latestAuditAt;
        router.refresh();
        playAlert();

        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          if (newContact) {
            new Notification("Yeni iletişim mesajı", {
              body: "Admin paneline yeni bir iletişim formu başvurusu geldi.",
              icon: "/favicon.ico",
            });
          }
          if (newAudit) {
            new Notification("Yeni audit başvurusu", {
              body: "Admin paneline yeni bir audit talebi geldi.",
              icon: "/favicon.ico",
            });
          }
        }
      }
    } catch {}
  }

  useEffect(() => {
    poll();
    const id = setInterval(poll, 30_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = data?.total ?? 0;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "4px 6px",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          color: total > 0 ? "var(--c-text)" : "var(--c-dim)",
          position: "relative",
        }}
        title="Bildirimler"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {total > 0 && (
          <span style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "#dc2626",
            color: "#fff",
            borderRadius: "50%",
            width: 15,
            height: 15,
            fontSize: 9,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}>
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          background: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          borderRadius: 10,
          padding: "12px 16px",
          minWidth: 200,
          zIndex: 50,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 600, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Okunmamış
          </p>
          <a href="/yonetim/contacts" onClick={() => setOpen(false)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--c-border)", textDecoration: "none" }}>
            <span style={{ fontSize: 13, color: "var(--c-text2)" }}>İletişim</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: data?.contacts ? "#f87171" : "var(--c-dim)" }}>
              {data?.contacts ?? 0}
            </span>
          </a>
          <a href="/yonetim/leads" onClick={() => setOpen(false)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", textDecoration: "none" }}>
            <span style={{ fontSize: 13, color: "var(--c-text2)" }}>Audit</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: data?.audits ? "#f87171" : "var(--c-dim)" }}>
              {data?.audits ?? 0}
            </span>
          </a>
        </div>
      )}
    </div>
  );
}
