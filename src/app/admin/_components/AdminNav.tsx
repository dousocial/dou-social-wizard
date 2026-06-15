"use client";

import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/leads",    label: "Audit Başvuruları" },
  { href: "/admin/contacts", label: "İletişim Formu" },
];

export function AdminNav() {
  const path = usePathname();

  return (
    <nav style={{ display: "flex", gap: 4 }}>
      {LINKS.map((l) => {
        const active = path.startsWith(l.href);
        return (
          <a
            key={l.href}
            href={l.href}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
              background: active ? "rgba(128,0,0,0.25)" : "transparent",
              color: active ? "#f87171" : "#9ca3af",
              border: "1px solid",
              borderColor: active ? "rgba(128,0,0,0.5)" : "transparent",
              transition: "all 0.15s",
            }}
          >
            {l.label}
          </a>
        );
      })}
    </nav>
  );
}
