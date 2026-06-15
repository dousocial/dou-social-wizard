import { createClient } from "@supabase/supabase-js";
import { LeadsList } from "./_components/LeadsList";

async function getAudits() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function LeadsPage() {
  const audits = await getAudits();
  const unread = audits.filter((a: Record<string, unknown>) => !a.is_read).length;

  return (
    <div>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "baseline", gap: 10 }}>
        <h1 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "var(--c-text)" }}>Audit Başvuruları</h1>
        <p style={{ margin: 0, fontSize: 12, color: "var(--c-dim)" }}>{audits.length} kayıt</p>
        {unread > 0 && (
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)", fontWeight: 600 }}>
            {unread} okunmamış
          </span>
        )}
      </div>

      {audits.length === 0 ? (
        <div style={{ textAlign: "center", padding: "72px 0", color: "var(--c-dim)", fontSize: 14, background: "var(--c-surface2)", borderRadius: 10, border: "1px solid var(--c-border)" }}>
          Henüz audit başvurusu yok.
        </div>
      ) : (
        <LeadsList audits={audits} />
      )}
    </div>
  );
}
