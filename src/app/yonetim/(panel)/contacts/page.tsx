import { createClient } from "@supabase/supabase-js";
import { ContactsList } from "./_components/ContactsList";

async function getContacts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function ContactsPage() {
  const contacts = await getContacts();
  const unread = contacts.filter((c: Record<string, unknown>) => !c.is_read).length;

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--c-text)" }}>İletişim Formu</h1>
        <span style={{ fontSize: 13, color: "var(--c-dim)" }}>{contacts.length} kayıt</span>
        {unread > 0 && (
          <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", fontWeight: 700 }}>
            {unread} okunmamış
          </span>
        )}
      </div>

      {contacts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "72px 0", color: "var(--c-dim)", fontSize: 14, background: "var(--c-surface2)", borderRadius: 12, border: "1px solid var(--c-border)" }}>
          Henüz iletişim mesajı yok.
        </div>
      ) : (
        <ContactsList contacts={contacts} />
      )}
    </div>
  );
}
