import { createClient } from "@supabase/supabase-js";

async function getProjects() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await supabase
    .from("projects")
    .select("id, slug, title, locale, industry, is_published, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function ProjectsAdminPage() {
  let projects: Awaited<ReturnType<typeof getProjects>> = [];
  let dbError: string | null = null;

  try {
    projects = await getProjects();
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  const published = projects.filter((p) => p.is_published).length;
  const drafts = projects.length - published;

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "var(--c-text)" }}>Projeler</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--c-dim)" }}>
            {projects.length} proje · {published} yayında · {drafts} taslak
          </p>
        </div>
        <a
          href="/yonetim/projeler/yeni"
          style={{
            padding: "9px 20px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
            background: "#9b1c1c",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          + Yeni Proje
        </a>
      </div>

      {dbError && (
        <div style={{
          padding: "14px 18px",
          borderRadius: 10,
          background: "rgba(248,113,113,0.08)",
          border: "1px solid rgba(248,113,113,0.2)",
          color: "#f87171",
          fontSize: 14,
          marginBottom: 16,
        }}>
          <strong>Veritabanı hatası:</strong> {dbError}
          <br />
          <span style={{ fontSize: 12, opacity: 0.8 }}>
            Supabase&apos;de <code>projects</code> tablosunun oluşturulduğundan emin olun.
          </span>
        </div>
      )}

      {!dbError && projects.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "72px 0",
          color: "var(--c-dim)",
          fontSize: 14,
          background: "var(--c-surface2)",
          borderRadius: 10,
          border: "1px solid var(--c-border)",
        }}>
          Henüz proje yok.{" "}
          <a href="/yonetim/projeler/yeni" style={{ color: "#fca5a5", textDecoration: "none" }}>
            İlk projeyi ekle →
          </a>
        </div>
      )}

      {projects.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {projects.map((project) => (
            <div
              key={project.id}
              style={{
                background: "var(--c-surface)",
                border: "1px solid var(--c-border)",
                borderRadius: 10,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 6,
                    fontWeight: 600,
                    background: project.is_published ? "rgba(34,197,94,0.1)" : "rgba(251,191,36,0.1)",
                    color: project.is_published ? "#86efac" : "#fde68a",
                    border: `1px solid ${project.is_published ? "rgba(34,197,94,0.25)" : "rgba(251,191,36,0.25)"}`,
                  }}>
                    {project.is_published ? "Yayında" : "Taslak"}
                  </span>
                  {project.industry && (
                    <span style={{ fontSize: 11, color: "var(--c-dim)", fontWeight: 500 }}>
                      {project.industry}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: "var(--c-dim)", fontWeight: 600 }}>
                    {project.locale.toUpperCase()}
                  </span>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--c-text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {project.title}
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--c-dim)" }}>
                  /projeler/{project.slug} · {formatDate(project.created_at)}
                </p>
              </div>

              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {project.is_published && (
                  <a
                    href={`/${project.locale}/projeler/${project.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "6px 14px",
                      borderRadius: 7,
                      fontSize: 13,
                      fontWeight: 500,
                      textDecoration: "none",
                      color: "var(--c-text2)",
                      border: "1px solid var(--c-border)",
                    }}
                  >
                    Görüntüle ↗
                  </a>
                )}
                <a
                  href={`/yonetim/projeler/${project.id}/duzenle`}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 7,
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: "none",
                    color: "#fca5a5",
                    border: "1px solid rgba(155,28,28,0.4)",
                    background: "rgba(155,28,28,0.1)",
                  }}
                >
                  Düzenle
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
