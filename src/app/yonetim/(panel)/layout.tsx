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
        padding: "0 40px",
        height: 58,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <a href="/yonetim" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{
              width: 30,
              height: 30,
              background: "linear-gradient(135deg, #9b1c1c 0%, #7f1d1d 100%)",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 1px 4px rgba(155,28,28,0.35)",
            }}>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 800, letterSpacing: "-0.03em" }}>D</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--c-text2)", letterSpacing: "-0.01em" }}>
              DOU <span style={{ color: "var(--c-dim)", fontWeight: 400 }}>Panel</span>
            </span>
          </a>
          <div style={{ width: 1, height: 18, background: "var(--c-border)" }} />
          <AdminNav role={session.role} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ThemeToggle />
          <div style={{ width: 1, height: 16, background: "var(--c-border)" }} />
          <NotificationBell />
          <div style={{ width: 1, height: 16, background: "var(--c-border)" }} />
          <a href="/yonetim/sifre-degistir" style={{ fontSize: 13, color: "var(--c-text3)", textDecoration: "none" }}>
            Şifre
          </a>
          <div style={{ width: 1, height: 16, background: "var(--c-border)" }} />
          <span style={{
            fontSize: 12,
            padding: "3px 10px",
            borderRadius: 20,
            background: session.role === "yonetici" ? "rgba(155,28,28,0.18)" : "var(--c-border)",
            color: session.role === "yonetici" ? "#fca5a5" : "var(--c-text3)",
            border: "1px solid",
            borderColor: session.role === "yonetici" ? "rgba(155,28,28,0.35)" : "var(--c-border2)",
            fontWeight: 600,
            letterSpacing: "0.02em",
          }}>
            {ROLE_LABEL[session.role] ?? session.role}
          </span>
          <LogoutButton />
        </div>
      </header>

      <main style={{ padding: "40px 40px", maxWidth: 1400, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {children}
      </main>
    </>
  );
}
