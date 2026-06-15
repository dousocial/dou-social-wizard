import { supabase } from "@/lib/supabase";
import { LoginForm } from "./_components/LoginForm";

async function hasAdmins() {
  const { count } = await supabase
    .from("admin_users")
    .select("*", { count: "exact", head: true });
  return (count ?? 0) > 0;
}

export default async function GirisPage({
  searchParams,
}: {
  searchParams: Promise<{ bilgi?: string }>;
}) {
  const { bilgi } = await searchParams;
  const adminsExist = await hasAdmins();

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
          <div style={{ width: 36, height: 36, background: "#800000", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>D</span>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--c-text)", lineHeight: 1 }}>DOU Social</div>
            <div style={{ fontSize: 12, color: "var(--c-dim)", marginTop: 2 }}>Yönetim Paneli</div>
          </div>
        </div>

        <LoginForm bilgi={bilgi} />

        {!adminsExist && (
          <p style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: "var(--c-dim)" }}>
            Henüz admin oluşturulmadı.{" "}
            <a href="/yonetim/giris/kurulum" style={{ color: "#f87171", textDecoration: "none" }}>
              İlk admini oluştur →
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
