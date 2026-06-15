"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markContactRead, markLeadRead } from "@/lib/actions/read";

type Props = {
  id: string;
  isRead: boolean;
  readBy: string | null;
  readAt: string | null;
  table: "contacts" | "audits";
};

export function ReadToggleButton({ id, isRead, readBy, readAt, table }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function markRead() {
    startTransition(async () => {
      try {
        if (table === "contacts") await markContactRead(id, true);
        else await markLeadRead(id, true);
        router.refresh();
      } catch {}
    });
  }

  const readAtFormatted = readAt
    ? new Date(readAt).toLocaleString("tr-TR", {
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
      })
    : null;

  if (isRead) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{
          fontSize: 11,
          padding: "3px 10px",
          borderRadius: 6,
          border: "1px solid rgba(74,222,128,0.2)",
          background: "rgba(74,222,128,0.08)",
          color: "#4ade80",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Okundu
        </span>
        {readBy && (
          <span style={{ fontSize: 11, color: "var(--c-dim)" }}>
            {readBy}{readAtFormatted ? ` · ${readAtFormatted}` : ""}
          </span>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={markRead}
      disabled={isPending}
      style={{
        fontSize: 11,
        padding: "3px 10px",
        borderRadius: 6,
        border: "1px solid var(--c-border)",
        cursor: isPending ? "not-allowed" : "pointer",
        background: "var(--c-surface2)",
        color: "var(--c-text3)",
        fontWeight: 500,
        transition: "opacity 0.15s",
        opacity: isPending ? 0.5 : 1,
      }}
    >
      {isPending ? "…" : "Okunmadı"}
    </button>
  );
}
