import { ProjectForm } from "../_components/ProjectForm";

export default function NewProjectPage() {
  return (
    <div>
      <a href="/yonetim/projeler" style={{ display: "inline-block", marginBottom: 24, fontSize: 13, color: "var(--c-dim)", textDecoration: "none" }}>
        ← Projeler
      </a>
      <ProjectForm mode="create" />
    </div>
  );
}
