import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SetupForm } from "./_components/SetupForm";

export default async function KurulumPage() {
  const { count } = await supabase
    .from("admin_users")
    .select("*", { count: "exact", head: true });
  if ((count ?? 0) > 0) redirect("/yonetim/giris");

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
          <div style={{ width: 36, height: 36, background: "#800000", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>D</span>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--c-text)", lineHeight: 1 }}>DOU Social</div>
            <div style={{ fontSize: 12, color: "var(--c-dim)", marginTop: 2 }}>İlk Kurulum</div>
          </div>
        </div>

        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 28 }}>
          <h1 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 600, color: "var(--c-text)" }}>Admin Oluştur</h1>
          <p style={{ margin: "0 0 24px", fontSize: 13, color: "var(--c-dim)" }}>Bu ekran yalnızca bir kez kullanılabilir.</p>
          <SetupForm />
        </div>

        <p style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: "var(--c-dim)" }}>
          <a href="/yonetim/giris" style={{ color: "var(--c-text3)", textDecoration: "none" }}>← Giriş sayfasına dön</a>
        </p>
      </div>
    </div>
  );
}
