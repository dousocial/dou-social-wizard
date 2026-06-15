import { createClient } from "@supabase/supabase-js";
import { AuditPDFButton } from "@/components/admin/AuditPDFButton";

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

function scoreColor(s: number) {
  if (s === 0) return "#555";
  if (s < 40)  return "#f87171";
  if (s < 60)  return "#fb923c";
  if (s < 80)  return "#facc15";
  return "#4ade80";
}

function ScoreChip({ score }: { score: number }) {
  if (score === 0) return <span style={{ color: "#444", fontSize: 12 }}>—</span>;
  return (
    <span style={{
      fontWeight: 600,
      fontSize: 13,
      color: scoreColor(score),
      background: `${scoreColor(score)}18`,
      padding: "2px 8px",
      borderRadius: 6,
    }}>
      {score}
    </span>
  );
}

export default async function LeadsPage() {
  const audits = await getAudits();

  return (
    <div>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#e5e5e5" }}>Audit Başvuruları</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#555" }}>{audits.length} kayıt</p>
        </div>
      </div>

      {audits.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#444", fontSize: 14, background: "#111", borderRadius: 12, border: "1px solid #1f1f1f" }}>
          Henüz hiç başvuru yok.
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #1f1f1f" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1f1f1f" }}>
                {["Tarih", "İşletme", "Sektör", "Telefon", "E-posta", "Genel", "IG", "LI", "YT", "GB", "Mod", "PDF"].map((h, i) => (
                  <th key={h} style={{
                    ...th,
                    textAlign: i >= 5 && i <= 9 ? "center" : "left",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {audits.map((a: Record<string, unknown>, i: number) => (
                <tr key={String(a.id)} style={{ borderBottom: "1px solid #181818", background: i % 2 === 0 ? "#0f0f0f" : "#111" }}>
                  <td style={td}>
                    <span style={{ fontSize: 11, color: "#555", whiteSpace: "nowrap" }}>
                      {new Date(String(a.created_at)).toLocaleString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </td>
                  <td style={{ ...td, fontWeight: 600, color: "#e5e5e5" }}>{String(a.business_name)}</td>
                  <td style={{ ...td, color: "#9ca3af" }}>{String(a.sector)}</td>
                  <td style={td}>
                    <a href={`tel:${a.phone}`} style={{ color: "#f87171", textDecoration: "none", fontSize: 13 }}>{String(a.phone)}</a>
                  </td>
                  <td style={td}>
                    <a href={`mailto:${a.email}`} style={{ color: "#f87171", textDecoration: "none", fontSize: 13 }}>{String(a.email)}</a>
                  </td>
                  {(["score_overall", "score_instagram", "score_linkedin", "score_youtube", "score_google"] as const).map((k) => (
                    <td key={k} style={{ ...td, textAlign: "center" }}>
                      <ScoreChip score={Number(a[k])} />
                    </td>
                  ))}
                  <td style={td}>
                    <span style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: a.mode === "screenshot" ? "#172554" : "#2e1065",
                      color: a.mode === "screenshot" ? "#93c5fd" : "#c4b5fd",
                    }}>
                      {a.mode === "screenshot" ? "Ekran görüntüsü" : "Manuel"}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: "center" }}>
                    <AuditPDFButton
                      audit={{
                        businessName: String(a.business_name),
                        sector:       String(a.sector),
                        phone:        String(a.phone),
                        email:        String(a.email),
                        createdAt:    String(a.created_at),
                        reportText:   String(a.report_text ?? ""),
                        scores: {
                          overall:   Number(a.score_overall),
                          instagram: Number(a.score_instagram),
                          linkedin:  Number(a.score_linkedin),
                          youtube:   Number(a.score_youtube),
                          google:    Number(a.score_google),
                        },
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = { padding: "10px 14px", fontSize: 11, fontWeight: 500, color: "#555", textTransform: "uppercase", letterSpacing: "0.07em", background: "#111", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "12px 14px", fontSize: 13, color: "#9ca3af", verticalAlign: "middle" };
