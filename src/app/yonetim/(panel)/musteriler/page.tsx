import { createClient } from "@supabase/supabase-js";
import { MusterilerClient } from "./_components/MusterilerClient";

export const dynamic = "force-dynamic";

async function getData() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase ortam değişkenleri eksik: NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY tanımlı değil.");
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("musteriler")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Supabase hatası: ${error.message} — Supabase Dashboard'da "musteriler" tablosunun oluşturulduğunu kontrol edin (supabase/crm.sql).`);
  return data ?? [];
}

export default async function MusterilerPage() {
  try {
    const musteriler = await getData();
    return <MusterilerClient musteriler={musteriler} />;
  } catch (err) {
    return (
      <div style={{ padding: "32px 0" }}>
        <h1 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 600, color: "var(--c-text)" }}>Müşteriler</h1>
        <div style={{
          background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)",
          borderRadius: 12, padding: "20px 24px",
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#f87171", marginBottom: 8 }}>
            Veritabanı bağlantı hatası
          </div>
          <div style={{ fontSize: 12, color: "var(--c-text2)", fontFamily: "monospace", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {(err as Error).message}
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: "var(--c-dim)" }}>
            Çözüm: Supabase Dashboard → SQL Editor → <code style={{ background: "var(--c-border)", padding: "2px 6px", borderRadius: 4 }}>supabase/crm.sql</code> içeriğini çalıştırın.
          </div>
        </div>
      </div>
    );
  }
}
