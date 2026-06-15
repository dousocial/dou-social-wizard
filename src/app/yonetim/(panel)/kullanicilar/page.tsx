import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { verifyToken } from "@/lib/session";
import { AddUserForm } from "./_components/AddUserForm";
import { DeleteUserButton } from "./_components/DeleteUserButton";

async function getUsers() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, username, role, created_at")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

const ROLE_LABEL: Record<string, string> = {
  yonetici: "Yönetici",
  izleyici: "İzleyici",
};

export default async function KullanicilarPage({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string; bilgi?: string }>;
}) {
  // Only yönetici can access this page
  const cookieStore = await cookies();
  const token = cookieStore.get("dou_sid")?.value;
  const session = token ? verifyToken(token) : null;
  if (!session || session.role !== "yonetici") redirect("/yonetim/leads");

  const { hata, bilgi } = await searchParams;
  const users = await getUsers();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "var(--c-text)" }}>Kullanıcılar</h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--c-dim)" }}>{users.length} kullanıcı</p>
      </div>

      {hata && (
        <div style={{ background: "#2d1010", border: "1px solid #4a1010", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#f87171" }}>
          {decodeURIComponent(hata)}
        </div>
      )}
      {bilgi && (
        <div style={{ background: "#0d2d1a", border: "1px solid #0f4a2a", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#4ade80" }}>
          {decodeURIComponent(bilgi)}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, alignItems: "start" }}>

        {/* User list */}
        <div style={{ borderRadius: 10, border: "1px solid var(--c-border)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Kullanıcı Adı", "Rol", "Oluşturulma", ""].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u: Record<string, unknown>, i: number) => (
                <tr key={String(u.id)} style={{ borderTop: "1px solid var(--c-border)", background: i % 2 === 0 ? "var(--c-surface2)" : "var(--c-surface)" }}>
                  <td style={{ ...td, fontWeight: 600, color: "var(--c-text)" }}>
                    {String(u.username)}
                    {String(u.id) === session.userId && (
                      <span style={{ fontSize: 10, marginLeft: 6, color: "var(--c-dim)", background: "var(--c-border)", padding: "1px 6px", borderRadius: 4 }}>
                        siz
                      </span>
                    )}
                  </td>
                  <td style={td}>
                    <span style={{
                      fontSize: 11,
                      padding: "2px 9px",
                      borderRadius: 6,
                      background: u.role === "yonetici" ? "rgba(128,0,0,0.2)" : "var(--c-border)",
                      color: u.role === "yonetici" ? "#fca5a5" : "var(--c-text3)",
                      border: "1px solid",
                      borderColor: u.role === "yonetici" ? "rgba(128,0,0,0.35)" : "var(--c-border2)",
                      fontWeight: 500,
                    }}>
                      {ROLE_LABEL[String(u.role)] ?? String(u.role)}
                    </span>
                  </td>
                  <td style={{ ...td, color: "var(--c-dim)", fontSize: 11 }}>
                    {new Date(String(u.created_at)).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td style={{ ...td, textAlign: "right" }}>
                    {String(u.id) !== session.userId && (
                      <DeleteUserButton id={String(u.id)} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add user form */}
        <AddUserForm />
      </div>
    </div>
  );
}

const th: React.CSSProperties = { padding: "10px 13px", fontSize: 11, fontWeight: 500, color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.07em", background: "var(--c-surface)", textAlign: "left" };
const td: React.CSSProperties = { padding: "11px 13px", fontSize: 13, color: "var(--c-text2)", verticalAlign: "middle" };
