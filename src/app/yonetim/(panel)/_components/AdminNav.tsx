"use client";

import { usePathname } from "next/navigation";

const BASE_LINKS = [
  {
    href: "/yonetim",
    label: "Dashboard",
    exact: true,
    color: "#6366f1",
    bg: "rgba(99,102,241,0.15)",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18 }}>
        <rect x="2" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.6"/>
        <rect x="11" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.6"/>
        <rect x="2" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.6"/>
        <rect x="11" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      </svg>
    ),
  },
  {
    href: "/yonetim/leads",
    label: "Audit Başvuruları",
    exact: false,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.15)",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18 }}>
        <rect x="4" y="3" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M7 3.5A1.5 1.5 0 018.5 2h3A1.5 1.5 0 0113 3.5v1H7v-1z" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M7 9h6M7 12h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/yonetim/contacts",
    label: "İletişim Formu",
    exact: false,
    color: "#10b981",
    bg: "rgba(16,185,129,0.15)",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18 }}>
        <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2H7l-4 3V5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/yonetim/blog",
    label: "Blog",
    exact: false,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.15)",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18 }}>
        <path d="M6 2h8l4 4v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M14 2v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M8 11h4M8 14h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/yonetim/projeler",
    label: "Projeler",
    exact: false,
    color: "#ec4899",
    bg: "rgba(236,72,153,0.15)",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18 }}>
        <path d="M2 6a2 2 0 012-2h3.586a1 1 0 01.707.293L9.707 5.7A1 1 0 0010.414 6H16a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" stroke="currentColor" strokeWidth="1.6"/>
      </svg>
    ),
  },
];

const YONETICI_LINKS = [
  {
    href: "/yonetim/kullanicilar",
    label: "Kullanıcılar",
    exact: false,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.15)",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18 }}>
        <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M1 17c0-3.314 2.686-6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <circle cx="15" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M19 17c0-2.761-1.79-5-4-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export function AdminNav({ role }: { role: string }) {
  const path = usePathname();
  const links = role === "yonetici" ? [...BASE_LINKS, ...YONETICI_LINKS] : BASE_LINKS;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.1em",
        color: "var(--c-dim)",
        textTransform: "uppercase",
        padding: "0 10px",
        marginBottom: 6,
      }}>
        Menü
      </div>
      {links.map((l) => {
        const active = l.exact ? path === l.href : path.startsWith(l.href);
        return (
          <a
            key={l.href}
            href={l.href}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              textDecoration: "none",
              background: active ? l.bg : "transparent",
              color: active ? l.color : "var(--c-text2)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              transition: "all 0.15s",
              border: "1px solid",
              borderColor: active ? `${l.color}33` : "transparent",
            }}
          >
            <span style={{ color: active ? l.color : "var(--c-dim)", flexShrink: 0 }}>
              {l.icon}
            </span>
            {l.label}
            {active && (
              <span style={{
                marginLeft: "auto",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: l.color,
                flexShrink: 0,
              }} />
            )}
          </a>
        );
      })}
    </div>
  );
}
