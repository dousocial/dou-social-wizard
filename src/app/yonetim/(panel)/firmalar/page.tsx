import { createClient } from "@supabase/supabase-js";
import { CompaniesClient } from "./_components/CompaniesClient";

export const dynamic = "force-dynamic";

async function getData() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase ortam değişkenleri eksik.");
  const supabase = createClient(url, key);

  const [
    { data: companies, error: compErr },
    { data: contacts },
    { data: users }
  ] = await Promise.all([
    supabase.from("crm_companies").select("*").order("name"),
    supabase.from("crm_contacts").select("*").order("name"),
    supabase.from("admin_users").select("id, username, role").order("username")
  ]);

  if (compErr) {
    throw new Error(`Veritabanı hatası: ${compErr.message}`);
  }

  return {
    companies: companies ?? [],
    contacts: contacts ?? [],
    users: users ?? []
  };
}

export default async function CompaniesPage() {
  try {
    const data = await getData();
    return (
      <CompaniesClient
        companies={data.companies}
        contacts={data.contacts}
        users={data.users}
      />
    );
  } catch (err) {
    return (
      <div style={{ padding: "32px 0" }}>
        <h1 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 600, color: "var(--c-text)" }}>Firmalar & Rehber</h1>
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
        </div>
      </div>
    );
  }
}
