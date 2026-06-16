"use client";

import { usePathname } from "next/navigation";

const BASE_LINKS = [
  { href: "/yonetim/leads",    label: "Audit Başvuruları" },
  { href: "/yonetim/contacts", label: "İletişim Formu" },
  { href: "/yonetim/blog",     label: "Blog" },
  { href: "/yonetim/projeler", label: "Projeler" },
];

const YONETICI_LINKS = [
  { href: "/yonetim/kullanicilar", label: "Kullanıcılar" },
];

export function AdminNav({ role }: { role: string }) {
  const path = usePathname();
  const links = role === "yonetici" ? [...BASE_LINKS, ...YONETICI_LINKS] : BASE_LINKS;

  return (
    <nav style={{ display: "flex", gap: 4 }}>
      {links.map((l) => {
        const active = path.startsWith(l.href);
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
