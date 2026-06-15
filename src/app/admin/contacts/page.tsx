import { createClient } from "@supabase/supabase-js";

async function getContacts(type?: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  let query = supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (type && type !== "tümü") {
    query = query.eq("type", type);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

const TYPE_LABELS: Record<string, string> = {
  iletisim: "İletişim Formu",
  audit: "Audit Başvurusu",
};

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  iletisim: { bg: "#14251f", color: "#4ade80" },
  audit:    { bg: "#1e1b4b", color: "#a5b4fc" },
};

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type = "tümü" } = await searchParams;
  const contacts = await getContacts(type);

  const filterTypes = ["tümü", "iletisim"];

  return (
    <div>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#e5e5e5" }}>İletişim Formu</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#555" }}>{contacts.length} kayıt</p>
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 6 }}>
          {filterTypes.map((t) => {
            const active = type === t;
            return (
              <a
                key={t}
                href={`/admin/contacts?type=${t}`}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 500,
                  textDecoration: "none",
                  background: active ? "rgba(128,0,0,0.3)" : "#161616",
                  color: active ? "#fca5a5" : "#666",
                  border: "1px solid",
                  borderColor: active ? "rgba(128,0,0,0.5)" : "#222",
                  transition: "all 0.15s",
                }}
              >
                {t === "tümü" ? "Tümü" : TYPE_LABELS[t] ?? t}
              </a>
            );
          })}
        </div>
      </div>

      {contacts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#444", fontSize: 14, background: "#111", borderRadius: 12, border: "1px solid #1f1f1f" }}>
          Henüz hiç kayıt yok.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {contacts.map((c: Record<string, unknown>) => {
            const typeKey = String(c.type ?? "iletisim");
            const chip = TYPE_COLORS[typeKey] ?? { bg: "#1a1a1a", color: "#9ca3af" };
            return (
              <div
                key={String(c.id)}
                style={{
                  background: "#111",
                  border: "1px solid #1f1f1f",
                  borderRadius: 12,
                  padding: "18px 22px",
                  display: "grid",
                  gridTemplateColumns: "160px 1fr 180px 180px",
                  gap: 16,
                  alignItems: "start",
                }}
              >
                {/* Date + type */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "#555" }}>
                    {new Date(String(c.created_at)).toLocaleString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: chip.bg, color: chip.color, width: "fit-content" }}>
                    {TYPE_LABELS[typeKey] ?? typeKey}
                  </span>
                </div>

                {/* Message */}
                <div>
                  <p style={{ margin: 0, fontSize: 13, color: "#d1d5db", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {String(c.message ?? "—")}
                  </p>
                </div>

                {/* Name */}
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: "#555", marginBottom: 3 }}>İsim</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#e5e5e5" }}>{String(c.name)}</p>
                </div>

                {/* Contact */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#555", marginBottom: 3 }}>İletişim</p>
                  <a href={`mailto:${c.email}`} style={{ color: "#f87171", textDecoration: "none", fontSize: 13 }}>{String(c.email)}</a>
                  {!!c.phone && (
                    <a href={`tel:${c.phone}`} style={{ color: "#9ca3af", textDecoration: "none", fontSize: 13 }}>{String(c.phone)}</a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
