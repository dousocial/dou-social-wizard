"use client";

import { usePathname } from "next/navigation";

const BASE_LINKS = [
  { href: "/yonetim",          label: "Dashboard",         exact: true },
  { href: "/yonetim/leads",    label: "Audit Başvuruları", exact: false },
  { href: "/yonetim/contacts", label: "İletişim Formu",    exact: false },
  { href: "/yonetim/blog",     label: "Blog",              exact: false },
  { href: "/yonetim/projeler", label: "Projeler",          exact: false },
];

const YONETICI_LINKS = [
  { href: "/yonetim/kullanicilar", label: "Kullanıcılar", exact: false },
];

export function AdminNav({ role }: { role: string }) {
  const path = usePathname();
  const links = role === "yonetici" ? [...BASE_LINKS, ...YONETICI_LINKS] : BASE_LINKS;

  return (
    <nav style={{ display: "flex", gap: 4 }}>
      {links.map((l) => {
        const active = l.exact ? path === l.href : path.startsWith(l.href);
        return (
          <a
            key={l.href}
            href={l.href}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 500,
              textDecoration: "none",
              background: active ? "rgba(155,28,28,0.25)" : "transparent",
              color: active ? "#fca5a5" : "var(--c-text2)",
              border: "1px solid",
              borderColor: active ? "rgba(155,28,28,0.5)" : "transparent",
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
