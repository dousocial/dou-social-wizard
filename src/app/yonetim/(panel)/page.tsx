import { createClient } from "@supabase/supabase-js";

// ─── Supabase ─────────────────────────────────────────────────────────────────

async function getDashboardData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Last 7 days (YYYY-MM-DD)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const [
    { data: contacts },
    { data: audits },
    { data: blogs },
    { data: projects },
    { data: users },
  ] = await Promise.all([
    supabase.from("contacts").select("id,name,message,created_at,is_read").order("created_at", { ascending: false }),
    supabase.from("audits").select("id,business_name,email,score_overall,created_at,is_read").order("created_at", { ascending: false }),
    supabase.from("blog_posts").select("id,is_published"),
    supabase.from("projects").select("id,is_published"),
    supabase.from("admin_users").select("id,username,role"),
  ]);

  const C = contacts ?? [];
  const A = audits   ?? [];
  const B = blogs    ?? [];
  const P = projects ?? [];
  const U = users    ?? [];

  const chartData = days.map((day) => ({
    label: day.slice(5).replace("-", "/"), // MM/DD
    value:
      C.filter((c) => c.created_at?.startsWith(day)).length +
      A.filter((a) => a.created_at?.startsWith(day)).length,
  }));

  return {
    stats: {
      unread:    C.filter((c) => !c.is_read).length + A.filter((a) => !a.is_read).length,
      audits:    A.length,
      contacts:  C.length,
      blogPub:   B.filter((b) => b.is_published).length,
      blogDraft: B.filter((b) => !b.is_published).length,
      projPub:   P.filter((p) => p.is_published).length,
      projDraft: P.filter((p) => !p.is_published).length,
      users:     U.length,
    },
    chartData,
    recentContacts: C.slice(0, 6),
    recentAudits:   A.slice(0, 6),
  };
}

// ─── SVG Line Chart ──────────────────────────────────────────────────────────

function LineChart({ data }: { data: { label: string; value: number }[] }) {
  const W = 600, H = 170;
  const PL = 38, PR = 12, PT = 14, PB = 30;
  const cW = W - PL - PR;
  const cH = H - PT - PB;
  const max = Math.max(...data.map((d) => d.value), 4);

  const xOf = (i: number) => PL + (i / Math.max(data.length - 1, 1)) * cW;
  const yOf = (v: number) => PT + cH - (v / max) * cH;

  const linePath = data
    .map((d, i) => {
      const x = xOf(i), y = yOf(d.value);
      if (i === 0) return `M${x.toFixed(1)},${y.toFixed(1)}`;
      const px = xOf(i - 1), py = yOf(data[i - 1].value);
      const cx = ((px + x) / 2).toFixed(1);
      return `C${cx},${py.toFixed(1)} ${cx},${y.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const areaPath =
    linePath +
    ` L${xOf(data.length - 1).toFixed(1)},${(PT + cH).toFixed(1)} L${xOf(0).toFixed(1)},${(PT + cH).toFixed(1)}Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", overflow: "visible" }}>
      <defs>
        <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9b1c1c" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#9b1c1c" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Grid */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={PL} y1={PT + cH * (1 - f)}
          x2={W - PR} y2={PT + cH * (1 - f)}
          stroke="rgba(255,255,255,0.055)" strokeWidth="1" strokeDasharray="4 4"
        />
      ))}
      {/* Y labels */}
      {[0, 0.5, 1].map((f) => (
        <text
          key={f}
          x={PL - 6} y={PT + cH * (1 - f) + 4}
          textAnchor="end" fontSize="10" fill="rgba(255,255,255,0.22)"
        >
          {Math.round(max * f)}
        </text>
      ))}
      {/* Area */}
      {data.length > 1 && <path d={areaPath} fill="url(#dg)" />}
      {/* Line */}
      {data.length > 1 && (
        <path d={linePath} fill="none" stroke="#9b1c1c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {/* Points */}
      {data.map((d, i) => (
        <circle
          key={i}
          cx={xOf(i)} cy={yOf(d.value)}
          r="4" fill="#9b1c1c" stroke="var(--c-surface)" strokeWidth="2"
        />
      ))}
      {/* X labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={xOf(i)} y={H - 4}
          textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.25)"
        >
          {d.label}
        </text>
      ))}
    </svg>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icons = {
  envelope: (
    <svg viewBox="0 0 20 20" fill="none" style={{ width: 20, height: 20 }}>
      <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 7l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  clipboard: (
    <svg viewBox="0 0 20 20" fill="none" style={{ width: 20, height: 20 }}>
      <rect x="4" y="3" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 3.5A1.5 1.5 0 018.5 2h3A1.5 1.5 0 0113 3.5v1H7v-1z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 9h6M7 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 20 20" fill="none" style={{ width: 20, height: 20 }}>
      <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2H7l-4 3V5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  document: (
    <svg viewBox="0 0 20 20" fill="none" style={{ width: 20, height: 20 }}>
      <path d="M6 2h8l4 4v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 2v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 11h4M8 14h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  folder: (
    <svg viewBox="0 0 20 20" fill="none" style={{ width: 20, height: 20 }}>
      <path d="M2 6a2 2 0 012-2h3.586a1 1 0 01.707.293L9.707 5.7A1 1 0 0010.414 6H16a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 20 20" fill="none" style={{ width: 20, height: 20 }}>
      <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1 17c0-3.314 2.686-6 6-6M13 17c0-3.314-2.686-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="15" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19 17c0-2.761-1.79-5-4-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function excerpt(text: string, len = 60) {
  if (!text) return "—";
  return text.length > len ? text.slice(0, len) + "…" : text;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const { stats, chartData, recentContacts, recentAudits } = await getDashboardData();

  const statCards = [
    {
      label: "Okunmamış Mesaj",
      value: stats.unread,
      icon: Icons.envelope,
      accent: stats.unread > 0,
      href: "/yonetim/contacts",
    },
    {
      label: "Toplam Başvuru",
      value: stats.audits,
      icon: Icons.clipboard,
      accent: false,
      href: "/yonetim/leads",
    },
    {
      label: "Toplam İletişim",
      value: stats.contacts,
      icon: Icons.chat,
      accent: false,
      href: "/yonetim/contacts",
    },
    {
      label: "Yayınlanan Blog",
      value: stats.blogPub,
      sub: stats.blogDraft > 0 ? `${stats.blogDraft} taslak` : undefined,
      icon: Icons.document,
      accent: false,
      href: "/yonetim/blog",
    },
    {
      label: "Yayınlanan Proje",
      value: stats.projPub,
      sub: stats.projDraft > 0 ? `${stats.projDraft} taslak` : undefined,
      icon: Icons.folder,
      accent: false,
      href: "/yonetim/projeler",
    },
    {
      label: "Panel Kullanıcısı",
      value: stats.users,
      icon: Icons.users,
      accent: false,
      href: "/yonetim/kullanicilar",
    },
  ];

  // ── Card + table styles shared ──
  const card: React.CSSProperties = {
    background: "var(--c-surface)",
    border: "1px solid var(--c-border)",
    borderRadius: 14,
    padding: "20px 24px",
  };

  const th: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--c-dim)",
    paddingBottom: 10,
    borderBottom: "1px solid var(--c-border)",
  };

  const td: React.CSSProperties = {
    fontSize: 13,
    color: "var(--c-text2)",
    paddingTop: 10,
    paddingBottom: 10,
    borderBottom: "1px solid var(--c-border2)",
    verticalAlign: "middle",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Title ── */}
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--c-text)", letterSpacing: "-0.03em" }}>
          Dashboard
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--c-dim)" }}>
          Genel bakış ve son aktiviteler
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14 }}>
        {statCards.map((s) => (
          <a
            key={s.label}
            href={s.href}
            style={{
              ...card,
              padding: "18px 20px",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              border: s.accent && stats.unread > 0 ? "1px solid rgba(155,28,28,0.5)" : "1px solid var(--c-border)",
              background: s.accent && stats.unread > 0 ? "rgba(155,28,28,0.12)" : "var(--c-surface)",
              transition: "border-color 0.15s",
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: s.accent && stats.unread > 0 ? "rgba(155,28,28,0.25)" : "var(--c-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: s.accent && stats.unread > 0 ? "#fca5a5" : "var(--c-text3)",
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{
                fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1,
                color: s.accent && stats.unread > 0 ? "#fca5a5" : "var(--c-text)",
                fontVariantNumeric: "tabular-nums",
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 5, fontWeight: 500 }}>
                {s.label}
              </div>
              {s.sub && (
                <div style={{ fontSize: 10, color: "var(--c-dim)", marginTop: 2, opacity: 0.7 }}>
                  {s.sub}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>

      {/* ── Chart + Recent contacts ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 14 }}>

        {/* Chart */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text)" }}>Son 7 Günlük Aktivite</div>
              <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 2 }}>İletişim + Audit başvuruları</div>
            </div>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
              color: "var(--c-dim)", background: "var(--c-border)",
              padding: "4px 10px", borderRadius: 20,
            }}>
              7 GÜN
            </div>
          </div>
          <LineChart data={chartData} />
        </div>

        {/* Recent contacts */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text)" }}>Son İletişim</div>
            <a href="/yonetim/contacts" style={{ fontSize: 11, color: "#fca5a5", textDecoration: "none", fontWeight: 600 }}>
              Tümü →
            </a>
          </div>
          {recentContacts.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--c-dim)", textAlign: "center", padding: "32px 0" }}>Mesaj yok</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {recentContacts.map((c: Record<string, string | boolean>, i: number) => (
                <div key={String(c.id)} style={{
                  padding: "10px 0",
                  borderBottom: i < recentContacts.length - 1 ? "1px solid var(--c-border2)" : "none",
                  display: "flex", flexDirection: "column", gap: 2,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)" }}>
                      {String(c.name || "—")}
                    </span>
                    {!c.is_read && (
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "#f87171", flexShrink: 0,
                      }} />
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--c-dim)" }}>
                    {excerpt(String(c.message || ""), 55)}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--c-dim)", opacity: 0.6, fontVariantNumeric: "tabular-nums" }}>
                    {fmtDate(String(c.created_at))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent audits table ── */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text)" }}>Son Audit Başvuruları</div>
          <a href="/yonetim/leads" style={{ fontSize: 11, color: "#fca5a5", textDecoration: "none", fontWeight: 600 }}>
            Tümü →
          </a>
        </div>
        {recentAudits.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--c-dim)", textAlign: "center", padding: "32px 0" }}>Başvuru yok</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["İşletme", "E-posta", "Skor", "Tarih", "Durum"].map((h) => (
                  <th key={h} style={{ ...th, textAlign: "left", paddingRight: 16 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentAudits.map((a: Record<string, string | number | boolean>, i: number) => (
                <tr key={String(a.id)}>
                  <td style={{ ...td, paddingRight: 16, fontWeight: 600, color: "var(--c-text)" }}>
                    {String(a.business_name || "—")}
                  </td>
                  <td style={{ ...td, paddingRight: 16 }}>{String(a.email || "—")}</td>
                  <td style={{ ...td, paddingRight: 16 }}>
                    {a.score_overall != null ? (
                      <span style={{
                        fontSize: 12, fontWeight: 700,
                        color: Number(a.score_overall) >= 70 ? "#4ade80" : Number(a.score_overall) >= 40 ? "#fbbf24" : "#f87171",
                        fontVariantNumeric: "tabular-nums",
                      }}>
                        {Number(a.score_overall).toFixed(0)}
                      </span>
                    ) : "—"}
                  </td>
                  <td style={{ ...td, paddingRight: 16, fontVariantNumeric: "tabular-nums", fontSize: 12 }}>
                    {fmtDate(String(a.created_at))}
                  </td>
                  <td style={{ ...td }}>
                    {!a.is_read ? (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                        background: "rgba(248,113,113,0.15)", color: "#f87171",
                        border: "1px solid rgba(248,113,113,0.3)",
                      }}>
                        YENİ
                      </span>
                    ) : (
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
                        background: "var(--c-border)", color: "var(--c-dim)",
                      }}>
                        Okundu
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
