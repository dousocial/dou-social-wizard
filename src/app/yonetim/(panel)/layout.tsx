import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/session";
import { AdminNav } from "./_components/AdminNav";
import { NotificationBell } from "./_components/NotificationBell";
import { LogoutButton } from "./_components/LogoutButton";
import { ThemeToggle } from "./_components/ThemeToggle";

const ROLE_LABEL: Record<string, string> = {
  yonetici: "Yönetici",
  izleyici: "İzleyici",
};

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("dou_sid")?.value;
  const session = token ? verifyToken(token) : null;

  if (!session) {
    redirect("/yonetim/giris");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--c-bg)" }}>

      {/* ── Sol Sidebar ─────────────────────────────────────────────── */}
      <aside style={{
        width: 240,
        flexShrink: 0,
        background: "var(--c-surface)",
        borderRight: "1px solid var(--c-border)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 20,
        overflowY: "auto",
      }}>

        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--c-border)" }}>
          <a href="/yonetim" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 38,
              height: 38,
              background: "linear-gradient(135deg, #ef4444 0%, #9b1c1c 100%)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(239,68,68,0.35)",
            }}>
              <span style={{ color: "#fff", fontSize: 18, fontWeight: 900, letterSpacing: "-0.04em" }}>D</span>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--c-text)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                DOU
              </div>
              <div style={{ fontSize: 11, color: "var(--c-dim)", fontWeight: 500, marginTop: 1 }}>
                Social Panel
              </div>
            </div>
          </a>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          <AdminNav role={session.role} />
        </nav>

        {/* Alt kullanıcı bilgisi */}
        <div style={{
          padding: "16px 16px 20px",
          borderTop: "1px solid var(--c-border)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
            }}>
              {session.role[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {ROLE_LABEL[session.role] ?? session.role}
              </div>
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                color: session.role === "yonetici" ? "#f87171" : "var(--c-dim)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}>
                {ROLE_LABEL[session.role] ?? session.role}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ThemeToggle />
            <NotificationBell />
            <a href="/yonetim/sifre-degistir" style={{
              fontSize: 11,
              color: "var(--c-dim)",
              textDecoration: "none",
              padding: "5px 8px",
              borderRadius: 7,
              background: "var(--c-border)",
              fontWeight: 500,
              flex: 1,
              textAlign: "center",
            }}>
              Şifre
            </a>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* ── İçerik alanı ────────────────────────────────────────────── */}
      <div style={{ flex: 1, marginLeft: 240, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Üst çubuk */}
        <header style={{
          background: "var(--c-surface)",
          borderBottom: "1px solid var(--c-border)",
          padding: "0 32px",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(12px)",
          gap: 12,
        }}>
          <span style={{ fontSize: 12, color: "var(--c-dim)" }}>
            dousocial.com
          </span>
          <div style={{ width: 1, height: 16, background: "var(--c-border)" }} />
          <a
            href="/"
            target="_blank"
            style={{
              fontSize: 12,
              color: "var(--c-text3)",
              textDecoration: "none",
              padding: "5px 12px",
              borderRadius: 8,
              border: "1px solid var(--c-border)",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <svg viewBox="0 0 16 16" fill="none" style={{ width: 12, height: 12 }}>
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 2h4v4M14 2L8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Siteyi Gör
          </a>
        </header>

        <main style={{ flex: 1, padding: "32px 32px", maxWidth: 1300, width: "100%", boxSizing: "border-box" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
