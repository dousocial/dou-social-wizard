"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleFollowUpCompleted } from "@/lib/actions/crmFollowUps";

type FollowUpWithLead = {
  id: string;
  type: "arama" | "whatsapp" | "eposta" | "toplanti" | "instagram_dm";
  note: string;
  follow_up_date: string;
  completed: boolean;
  lead_id: string;
  crm_leads?: {
    id: string;
    title: string;
  } | null;
};

const TYPES: Record<FollowUpWithLead["type"], { label: string; color: string }> = {
  arama:        { label: "Arama", color: "#10b981" },
  whatsapp:     { label: "WhatsApp", color: "#22c55e" },
  eposta:       { label: "E-posta", color: "#3b82f6" },
  toplanti:     { label: "Toplantı", color: "#8b5cf6" },
  instagram_dm: { label: "Instagram DM", color: "#ec4899" },
};

export function DashboardFollowUps({ initialFollowUps }: { initialFollowUps: FollowUpWithLead[] }) {
  const router = useRouter();
  const [followUps, setFollowUps] = useState(initialFollowUps);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleToggle(id: string, leadId: string, currentVal: boolean) {
    setLoadingId(id);
    const result = await toggleFollowUpCompleted(id, leadId, !currentVal);
    setLoadingId(null);
    if (!result.error) {
      setFollowUps(prev => prev.filter(f => f.id !== id));
      router.refresh();
    } else {
      alert("Durum güncellenirken hata oluştu: " + result.error);
    }
  }

  if (followUps.length === 0) {
    return null; // Bugün takip edilecek görev yoksa bileşeni gizle
  }

  const cardStyle: React.CSSProperties = {
    background: "var(--c-surface)",
    border: "1px solid rgba(245,158,11,0.25)",
    borderRadius: 14,
    padding: "20px 24px",
    boxShadow: "0 0 20px rgba(245,158,11,0.04)",
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20, color: "var(--c-text)" }}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <div>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--c-text)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Bugün Takip Edilecekler
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--c-dim)" }}>
            Bugün yapılması planlanan görüşmeler ({followUps.length} görev)
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {followUps.map(f => {
          const typeInfo = TYPES[f.type] || { label: f.type, color: "gray" };
          const leadTitle = f.crm_leads?.title || "Bilinmeyen Aday";

          return (
            <div
              key={f.id}
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid var(--c-border)",
                background: "rgba(255,255,255,0.01)",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                opacity: loadingId === f.id ? 0.6 : 1,
              }}
            >
              <input
                type="checkbox"
                checked={f.completed}
                disabled={loadingId === f.id}
                onChange={() => handleToggle(f.id, f.lead_id, f.completed)}
                style={{ width: 16, height: 16, accentColor: "#10b981", cursor: "pointer", marginTop: 2 }}
                title="Tamamlandı olarak işaretle"
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--c-text)" }}>
                    {typeInfo.label}
                  </span>
                  <a
                    href={`/yonetim/crm-leads/${f.lead_id}`}
                    style={{ fontSize: 11, color: "#60a5fa", textDecoration: "none", fontWeight: 600 }}
                  >
                    {leadTitle}
                  </a>
                </div>
                {f.note && (
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--c-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={f.note}>
                    {f.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
