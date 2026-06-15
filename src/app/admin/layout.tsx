export const dynamic = "force-dynamic";

import { AdminNav } from "./_components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, background: "#0a0a0a", color: "#e5e5e5", fontFamily: "'Inter', 'Arial', sans-serif", minHeight: "100vh" }}>

        {/* Top bar */}
        <header style={{ background: "#111", borderBottom: "1px solid #1f1f1f", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, background: "#800000", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>D</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#e5e5e5", letterSpacing: "-0.01em" }}>DOU Social</span>
              <span style={{ fontSize: 12, color: "#555", marginLeft: 2 }}>/ Admin</span>
            </div>
            {/* Divider */}
            <div style={{ width: 1, height: 20, background: "#222" }} />
            {/* Nav */}
            <AdminNav />
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: "28px 32px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
