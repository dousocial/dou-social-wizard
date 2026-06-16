import { ProjectForm } from "../_components/ProjectForm";

export default function NewProjectPage() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <a href="/yonetim/projeler" style={{ fontSize: 13, color: "var(--c-dim)", textDecoration: "none" }}>
          ← Projeler
        </a>
        <h1 style={{ margin: "8px 0 0", fontSize: 17, fontWeight: 600, color: "var(--c-text)" }}>
          Yeni Proje
        </h1>
      </div>
      <ProjectForm mode="create" />
    </div>
  );
}
