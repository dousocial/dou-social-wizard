import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

// ─── Google Auth helper ──────────────────────────────────────────────────────

function getGoogleAuth(scopes: string[]) {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const credentials = JSON.parse(raw);
    return new google.auth.GoogleAuth({ credentials, scopes });
  } catch {
    return null;
  }
}

// ─── GA4 Data API ─────────────────────────────────────────────────────────────

type GA4Data = {
  users: number | null;
  sessions: number | null;
  pageViews: number | null;
  error?: string;
};

async function getGA4Data(): Promise<GA4Data> {
  const auth = getGoogleAuth(["https://www.googleapis.com/auth/analytics.readonly"]);
  if (!auth) return { users: null, sessions: null, pageViews: null, error: "credentials missing" };
  try {
    const analyticsdata = google.analyticsdata({ version: "v1beta", auth });
    const res = await analyticsdata.properties.runReport({
      property: "properties/541672727",
      requestBody: {
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
        ],
      },
    });
    const row = res.data.rows?.[0]?.metricValues;
    return {
      users:     parseInt(row?.[0]?.value ?? "0"),
      sessions:  parseInt(row?.[1]?.value ?? "0"),
      pageViews: parseInt(row?.[2]?.value ?? "0"),
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message.slice(0, 120) : "fetch failed";
    return { users: null, sessions: null, pageViews: null, error: msg };
  }
}

// ─── Search Console API ───────────────────────────────────────────────────────

type SearchConsoleData = {
  clicks: number | null;
  impressions: number | null;
  ctr: number | null;
  position: number | null;
  error?: string;
};

async function getSearchConsoleData(): Promise<SearchConsoleData> {
  const auth = getGoogleAuth(["https://www.googleapis.com/auth/webmasters.readonly"]);
  if (!auth) return { clicks: null, impressions: null, ctr: null, position: null, error: "credentials missing" };
  try {
    const searchconsole = google.searchconsole({ version: "v1", auth });
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    const res = await searchconsole.searchanalytics.query({
      siteUrl: "https://www.dousocial.com",
      requestBody: {
        startDate: fmt(start),
        endDate: fmt(end),
      },
    });
    const totals = res.data.rows?.[0];
    return {
      clicks:      totals?.clicks      ?? 0,
      impressions: totals?.impressions ?? 0,
      ctr:         totals?.ctr         ?? 0,
      position:    totals?.position    ?? 0,
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message.slice(0, 120) : "fetch failed";
    return { clicks: null, impressions: null, ctr: null, position: null, error: msg };
  }
}

// ─── Google Business (Places API) ────────────────────────────────────────────
// Env vars required: GOOGLE_MAPS_API_KEY + GOOGLE_PLACE_ID

type GoogleBusiness = {
  rating: number | null;
  reviewCount: number | null;
  error?: string;
};

async function getGoogleBusiness(): Promise<GoogleBusiness> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const pid = process.env.GOOGLE_PLACE_ID;
  if (!key || !pid) return { rating: null, reviewCount: null, error: "credentials missing" };
  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${encodeURIComponent(pid)}&fields=rating%2Cuser_ratings_total&key=${key}`;
    const res = await fetch(url, { next: { revalidate: 3600 } }); // 1 saatte bir tazele
    const json = await res.json() as { result?: { rating?: number; user_ratings_total?: number } };
    return {
      rating:      json.result?.rating      ?? null,
      reviewCount: json.result?.user_ratings_total ?? null,
    };
  } catch {
    return { rating: null, reviewCount: null, error: "fetch failed" };
  }
}

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
  const [{ stats, chartData, recentContacts, recentAudits }, gbiz, ga4, gsc] = await Promise.all([
    getDashboardData(),
    getGoogleBusiness(),
    getGA4Data(),
    getSearchConsoleData(),
  ]);

  const statCards = [
    {
      label: "Okunmamış Mesaj",
      value: stats.unread,
      icon: Icons.envelope,
      href: "/yonetim/contacts",
      color: "#f87171",
      bg: "rgba(248,113,113,0.12)",
      border: "rgba(248,113,113,0.3)",
      gradient: "linear-gradient(135deg, rgba(248,113,113,0.18) 0%, rgba(239,68,68,0.06) 100%)",
    },
    {
      label: "Toplam Başvuru",
      value: stats.audits,
      icon: Icons.clipboard,
      href: "/yonetim/leads",
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.12)",
      border: "rgba(251,191,36,0.3)",
      gradient: "linear-gradient(135deg, rgba(251,191,36,0.18) 0%, rgba(245,158,11,0.06) 100%)",
    },
    {
      label: "Toplam İletişim",
      value: stats.contacts,
      icon: Icons.chat,
      href: "/yonetim/contacts",
      color: "#34d399",
      bg: "rgba(52,211,153,0.12)",
      border: "rgba(52,211,153,0.3)",
      gradient: "linear-gradient(135deg, rgba(52,211,153,0.18) 0%, rgba(16,185,129,0.06) 100%)",
    },
    {
      label: "Yayınlanan Blog",
      value: stats.blogPub,
      sub: stats.blogDraft > 0 ? `${stats.blogDraft} taslak` : undefined,
      icon: Icons.document,
      href: "/yonetim/blog",
      color: "#60a5fa",
      bg: "rgba(96,165,250,0.12)",
      border: "rgba(96,165,250,0.3)",
      gradient: "linear-gradient(135deg, rgba(96,165,250,0.18) 0%, rgba(59,130,246,0.06) 100%)",
    },
    {
      label: "Yayınlanan Proje",
      value: stats.projPub,
      sub: stats.projDraft > 0 ? `${stats.projDraft} taslak` : undefined,
      icon: Icons.folder,
      href: "/yonetim/projeler",
      color: "#f472b6",
      bg: "rgba(244,114,182,0.12)",
      border: "rgba(244,114,182,0.3)",
      gradient: "linear-gradient(135deg, rgba(244,114,182,0.18) 0%, rgba(236,72,153,0.06) 100%)",
    },
    {
      label: "Panel Kullanıcısı",
      value: stats.users,
      icon: Icons.users,
      href: "/yonetim/kullanicilar",
      color: "#a78bfa",
      bg: "rgba(167,139,250,0.12)",
      border: "rgba(167,139,250,0.3)",
      gradient: "linear-gradient(135deg, rgba(167,139,250,0.18) 0%, rgba(139,92,246,0.06) 100%)",
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
              padding: "20px",
              borderRadius: 14,
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              border: `1px solid ${s.border}`,
              background: s.gradient,
              transition: "transform 0.15s, box-shadow 0.15s",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Glow spot */}
            <div style={{
              position: "absolute",
              top: -20,
              right: -20,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: s.color,
              opacity: 0.1,
              filter: "blur(20px)",
              pointerEvents: "none",
            }} />
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: s.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: s.color,
              border: `1px solid ${s.border}`,
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{
                fontSize: 30, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1,
                color: s.color,
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

      {/* ── Google Business ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Google logo badge */}
        <div style={{
          ...card,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}>
          {/* Coloured "G" */}
          <svg viewBox="0 0 24 24" style={{ width: 22, height: 22 }} fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335"/>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--c-text2)", letterSpacing: "-0.01em" }}>
            Google Business
          </span>
        </div>

        {/* Rating */}
        <div style={{
          ...card,
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flex: "0 0 auto",
        }}>
          <div>
            <div style={{
              fontSize: 32, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em",
              color: gbiz.rating != null ? "#fbbf24" : "var(--c-dim)",
              fontVariantNumeric: "tabular-nums",
            }}>
              {gbiz.rating != null ? gbiz.rating.toFixed(1) : "—"}
            </div>
            <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 4, fontWeight: 500 }}>
              Ortalama Puan
            </div>
          </div>
          {/* Stars */}
          {gbiz.rating != null && (
            <div style={{ display: "flex", gap: 2 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <svg key={n} viewBox="0 0 20 20" style={{ width: 16, height: 16 }}
                  fill={gbiz.rating! >= n ? "#fbbf24" : gbiz.rating! >= n - 0.5 ? "url(#half)" : "none"}
                  stroke="#fbbf24" strokeWidth="1.2">
                  <defs>
                    <linearGradient id="half">
                      <stop offset="50%" stopColor="#fbbf24" />
                      <stop offset="50%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <path d="M10 1l2.39 4.84L18 6.72l-4 3.9.94 5.5L10 13.77l-4.94 2.35.94-5.5-4-3.9 5.61-.88L10 1z" />
                </svg>
              ))}
            </div>
          )}
        </div>

        {/* Review count */}
        <div style={{
          ...card,
          padding: "14px 24px",
          flex: "0 0 auto",
        }}>
          <div style={{
            fontSize: 32, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em",
            color: "var(--c-text)",
            fontVariantNumeric: "tabular-nums",
          }}>
            {gbiz.reviewCount != null ? gbiz.reviewCount.toLocaleString("tr-TR") : "—"}
          </div>
          <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 4, fontWeight: 500 }}>
            Google Yorum
          </div>
        </div>

        {/* Error or refresh note */}
        {gbiz.error && (
          <div style={{ fontSize: 12, color: "var(--c-dim)", padding: "0 8px" }}>
            {gbiz.error === "credentials missing"
              ? "⚠️ GOOGLE_MAPS_API_KEY veya GOOGLE_PLACE_ID eksik"
              : "⚠️ Google verisi alınamadı"}
          </div>
        )}
      </div>

      {/* ── GA4 + Search Console ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 14 }}>

        {/* GA4 label */}
        <div style={{ ...card, padding: "14px 16px", display: "flex", alignItems: "center", gap: 8 }}>
          <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, flexShrink: 0 }}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335"/>
          </svg>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text2)" }}>Analytics</div>
            <div style={{ fontSize: 10, color: "var(--c-dim)" }}>Son 7 gün</div>
          </div>
        </div>

        {/* Kullanıcılar */}
        <div style={{ ...card, padding: "14px 18px" }}>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.04em", color: "#60a5fa", fontVariantNumeric: "tabular-nums" }}>
            {ga4.users != null ? ga4.users.toLocaleString("tr-TR") : "—"}
          </div>
          <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 4, fontWeight: 500 }}>Aktif Kullanıcı</div>
          {ga4.error && <div style={{ fontSize: 9, color: "#f87171", marginTop: 2, wordBreak: "break-all" }}>{ga4.error}</div>}
        </div>

        {/* Oturum */}
        <div style={{ ...card, padding: "14px 18px" }}>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.04em", color: "#34d399", fontVariantNumeric: "tabular-nums" }}>
            {ga4.sessions != null ? ga4.sessions.toLocaleString("tr-TR") : "—"}
          </div>
          <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 4, fontWeight: 500 }}>Oturum</div>
        </div>

        {/* Sayfa görüntüleme */}
        <div style={{ ...card, padding: "14px 18px" }}>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.04em", color: "#a78bfa", fontVariantNumeric: "tabular-nums" }}>
            {ga4.pageViews != null ? ga4.pageViews.toLocaleString("tr-TR") : "—"}
          </div>
          <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 4, fontWeight: 500 }}>Sayfa Görüntüleme</div>
        </div>

        {/* Search Console tıklama */}
        <div style={{ ...card, padding: "14px 18px" }}>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.04em", color: "#f59e0b", fontVariantNumeric: "tabular-nums" }}>
            {gsc.clicks != null ? gsc.clicks.toLocaleString("tr-TR") : "—"}
          </div>
          <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 4, fontWeight: 500 }}>Google Tıklama</div>
          {gsc.error && <div style={{ fontSize: 9, color: "#f87171", marginTop: 2, wordBreak: "break-all" }}>{gsc.error}</div>}
        </div>

        {/* Gösterim */}
        <div style={{ ...card, padding: "14px 18px" }}>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.04em", color: "#fb923c", fontVariantNumeric: "tabular-nums" }}>
            {gsc.impressions != null ? gsc.impressions.toLocaleString("tr-TR") : "—"}
          </div>
          <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 4, fontWeight: 500 }}>Gösterim</div>
        </div>

        {/* Ortalama sıra */}
        <div style={{ ...card, padding: "14px 18px" }}>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.04em", color: "#f472b6", fontVariantNumeric: "tabular-nums" }}>
            {gsc.position != null ? gsc.position.toFixed(1) : "—"}
          </div>
          <div style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 4, fontWeight: 500 }}>Ort. Sıralama</div>
        </div>
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
