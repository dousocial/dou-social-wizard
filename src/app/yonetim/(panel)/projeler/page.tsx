import { createClient } from "@supabase/supabase-js";

async function getProjects() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await supabase
    .from("projects")
    .select("id, slug, title, locale, industry, summary, is_published, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
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
    <div style={{ maxWidth: 860 }}>

      {/* Başlık */}
      <div style={{ marginBottom: 32, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "var(--c-text)", letterSpacing: "-0.025em", lineHeight: 1.1 }}>
            Projeler
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--c-dim)", lineHeight: 1.5 }}>
            {projects.length > 0
              ? <>{published} proje yayında · {drafts} taslak</>
              : "Henüz proje eklenmemiş"}
          </p>
        </div>
        <a
          href="/yonetim/projeler/yeni"
          style={{
            padding: "10px 22px",
            borderRadius: 9,
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
            background: "linear-gradient(135deg, #9b1c1c 0%, #7f1d1d 100%)",
            color: "#fff",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(155,28,28,0.3)",
            letterSpacing: "0.01em",
          }}
        >
          + Yeni Proje
        </a>
      </div>

      {/* Hata */}
      {dbError && (
        <div style={{
          padding: "16px 20px",
          borderRadius: 10,
          background: "rgba(248,113,113,0.07)",
          border: "1px solid rgba(248,113,113,0.2)",
          color: "#f87171",
          fontSize: 14,
          marginBottom: 20,
          lineHeight: 1.6,
        }}>
          <strong>Veritabanı hatası:</strong> {dbError}
          <br />
          <span style={{ fontSize: 12, opacity: 0.75 }}>
            Supabase&apos;de <code>projects</code> tablosunun oluşturulduğundan emin olun.
          </span>
        </div>
      )}

      {/* Boş durum */}
      {!dbError && projects.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "80px 0",
          color: "var(--c-dim)",
          background: "var(--c-surface)",
          borderRadius: 14,
          border: "1px dashed var(--c-border)",
        }}>
          <p style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "var(--c-text3)" }}>Boş sayfa</p>
          <p style={{ margin: "0 0 20px", fontSize: 14 }}>İlk projeyi ekleyerek başla.</p>
          <a href="/yonetim/projeler/yeni" style={{
            display: "inline-block",
            padding: "10px 22px",
            borderRadius: 9,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
            background: "rgba(155,28,28,0.12)",
            color: "#fca5a5",
            border: "1px solid rgba(155,28,28,0.3)",
          }}>
            İlk projeyi ekle →
          </a>
        </div>
      )}

      {/* Liste */}
      {projects.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {projects.map((project, i) => (
            <div
              key={project.id}
              style={{
                padding: "20px 0",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 24,
                borderBottom: i < projects.length - 1 ? "1px solid var(--c-border)" : "none",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Badges */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <span style={{
                    fontSize: 11,
                    padding: "2px 9px",
                    borderRadius: 20,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    background: project.is_published ? "rgba(34,197,94,0.1)" : "rgba(251,191,36,0.1)",
                    color: project.is_published ? "#86efac" : "#fde68a",
                    border: `1px solid ${project.is_published ? "rgba(34,197,94,0.25)" : "rgba(251,191,36,0.25)"}`,
                  }}>
                    {project.is_published ? "Yayında" : "Taslak"}
                  </span>
                  {project.industry && (
                    <span style={{
                      fontSize: 11,
                      padding: "2px 9px",
                      borderRadius: 20,
                      fontWeight: 500,
                      background: "rgba(96,165,250,0.1)",
                      color: "#93c5fd",
                      border: "1px solid rgba(96,165,250,0.2)",
                    }}>
                      {project.industry}
                    </span>
                  )}
                  <span style={{
                    fontSize: 11,
                    padding: "2px 7px",
                    borderRadius: 20,
                    fontWeight: 600,
                    background: "var(--c-surface2)",
                    color: "var(--c-text3)",
                    border: "1px solid var(--c-border)",
                  }}>
                    {project.locale.toUpperCase()}
                  </span>
                </div>

                {/* Başlık */}
                <a
                  href={`/yonetim/projeler/${project.id}/duzenle`}
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <p style={{
                    margin: "0 0 5px",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--c-text)",
                    lineHeight: 1.3,
                    letterSpacing: "-0.01em",
                  }}>
                    {project.title}
                  </p>
                </a>

                {/* Özet */}
                {project.summary && (
                  <p style={{
                    margin: "0 0 8px",
                    fontSize: 13,
                    color: "var(--c-dim)",
                    lineHeight: 1.5,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: "2",
                    WebkitBoxOrient: "vertical" as const,
                  }}>
                    {project.summary}
                  </p>
                )}

                {/* Meta */}
                <p style={{ margin: 0, fontSize: 12, color: "var(--c-dim)", fontFamily: "monospace" }}>
                  /projeler/{project.slug} · {formatDate(project.created_at)}
                </p>
              </div>

              {/* Aksiyonlar */}
              <div style={{ display: "flex", gap: 8, flexShrink: 0, paddingTop: 2 }}>
                {project.is_published && (
                  <a
                    href={`/${project.locale}/projeler/${project.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "6px 14px",
                      borderRadius: 7,
                      fontSize: 12,
                      fontWeight: 500,
                      textDecoration: "none",
                      color: "var(--c-text3)",
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
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: "none",
                    color: "#fca5a5",
                    border: "1px solid rgba(155,28,28,0.35)",
                    background: "rgba(155,28,28,0.08)",
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
