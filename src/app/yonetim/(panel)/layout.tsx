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
    <>
      <header style={{
        background: "var(--c-surface)",
        borderBottom: "1px solid var(--c-border)",
        padding: "0 32px",
        height: 62,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <a href="/yonetim/leads" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, background: "#9b1c1c", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>D</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--c-text2)" }}>
              DOU <span style={{ color: "var(--c-dim)" }}>/ Panel</span>
            </span>
          </a>
          <div style={{ width: 1, height: 20, background: "var(--c-border)" }} />
          <AdminNav role={session.role} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ThemeToggle />
          <div style={{ width: 1, height: 16, background: "var(--c-border)" }} />
          <NotificationBell />
          <div style={{ width: 1, height: 16, background: "var(--c-border)" }} />
          <a href="/yonetim/sifre-degistir" style={{ fontSize: 14, color: "var(--c-text3)", textDecoration: "none" }}>
            Şifre Değiştir
          </a>
          <div style={{ width: 1, height: 16, background: "var(--c-border)" }} />
          <span style={{
            fontSize: 13,
            padding: "4px 12px",
            borderRadius: 6,
            background: session.role === "yonetici" ? "rgba(155,28,28,0.2)" : "var(--c-border)",
            color: session.role === "yonetici" ? "#fca5a5" : "var(--c-text3)",
            border: "1px solid",
            borderColor: session.role === "yonetici" ? "rgba(155,28,28,0.4)" : "var(--c-border2)",
            fontWeight: 500,
          }}>
            {ROLE_LABEL[session.role] ?? session.role}
          </span>

          <LogoutButton />
        </div>
      </header>

      <main style={{ padding: "32px 32px", fontSize: 15 }}>
        {children}
      </main>
    </>
  );
}
