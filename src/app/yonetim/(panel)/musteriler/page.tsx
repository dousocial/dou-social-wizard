import { createClient } from "@supabase/supabase-js";
import { MusterilerClient } from "./_components/MusterilerClient";

export const dynamic = "force-dynamic";

async function getData() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase ortam değişkenleri eksik.");
  const supabase = createClient(url, key);

  const [
    { data: musteriler, error: musteriErr },
    { data: leads, error: leadsErr },
    { data: companies },
    { data: contacts },
    { data: users }
  ] = await Promise.all([
    supabase.from("musteriler").select("*").order("created_at", { ascending: false }),
    supabase.from("crm_leads").select("*").order("created_at", { ascending: false }),
    supabase.from("crm_companies").select("id, name").order("name"),
    supabase.from("crm_contacts").select("id, name, company_id").order("name"),
    supabase.from("admin_users").select("id, username, role").order("username")
  ]);

  if (musteriErr) {
    throw new Error(`Müşteriler veritabanı hatası: ${musteriErr.message}`);
  }
  if (leadsErr) {
    throw new Error(`Adaylar veritabanı hatası: ${leadsErr.message}`);
  }

  return {
    musteriler: musteriler ?? [],
    leads: leads ?? [],
    companies: companies ?? [],
    contacts: contacts ?? [],
    users: users ?? []
  };
}

export default async function MusterilerPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; convert_audit?: string; convert_contact?: string }>;
}) {
  try {
    const params = await searchParams;
    const data = await getData();

    let prefill = null;
    if (params.convert_audit || params.convert_contact) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (url && key) {
        const supabase = createClient(url, key);
        if (params.convert_audit) {
          const { data: audit } = await supabase
            .from("audits")
            .select("*")
            .eq("id", params.convert_audit)
            .single();
          if (audit) {
            prefill = {
              type: "audit" as const,
              id: audit.id,
              title: `${audit.business_name} - Dijital Analiz Raporu`,
              company_name: audit.business_name,
              email: audit.email,
              phone: audit.phone,
              sector: audit.sector,
              source: "inbound" as const,
              notes: `Dijital Analiz Raporu Başvurusu.\nGenel Puan: ${audit.score_overall}\nInstagram: ${audit.score_instagram}\nLinkedIn: ${audit.score_linkedin}\nYouTube: ${audit.score_youtube}\nGoogle: ${audit.score_google}`,
            };
          }
        } else if (params.convert_contact) {
          const { data: contact } = await supabase
            .from("contacts")
            .select("*")
            .eq("id", params.convert_contact)
            .single();
          if (contact) {
            prefill = {
              type: "contact" as const,
              id: contact.id,
              title: `${contact.name} - İletişim Formu`,
              company_name: contact.name,
              contact_name: contact.name,
              email: contact.email,
              phone: contact.phone,
              source: "inbound" as const,
              notes: `İletişim Formu Mesajı:\n${contact.message || ""}`,
            };
          }
        }
      }
    }

    return (
      <MusterilerClient
        initialMusteriler={data.musteriler}
        leads={data.leads}
        companies={data.companies}
        contacts={data.contacts}
        users={data.users}
        prefill={prefill}
        initialTab={params.tab || "aktif"}
      />
    );
  } catch (err) {
    return (
      <div style={{ padding: "32px 0" }}>
        <h1 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 600, color: "var(--c-text)" }}>Müşteriler & CRM</h1>
        <div style={{
          background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)",
          borderRadius: 12, padding: "20px 24px",
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#f87171", marginBottom: 8 }}>
            Veritabanı bağlantı hatası veya tablolar eksik
          </div>
          <div style={{ fontSize: 12, color: "var(--c-text2)", fontFamily: "monospace", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {(err as Error).message}
          </div>
        </div>
      </div>
    );
  }
}
