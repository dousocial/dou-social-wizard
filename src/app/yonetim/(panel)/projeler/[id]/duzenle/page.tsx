import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ProjectForm } from "../../_components/ProjectForm";

async function getProject(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supabase.from("projects").select("*").eq("id", id).single();
  return data;
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <div>
      <a href="/yonetim/projeler" style={{ display: "inline-block", marginBottom: 24, fontSize: 13, color: "var(--c-dim)", textDecoration: "none" }}>
        ← Projeler
      </a>

      <ProjectForm
        mode="edit"
        initialData={{
          id: project.id,
          locale: project.locale ?? "tr",
          title: project.title ?? "",
          seoTitle: project.seo_title ?? "",
          slug: project.slug ?? "",
          industry: project.industry ?? "",
          duration: project.duration ?? "",
          summary: project.summary ?? "",
          coverMetric: project.cover_metric ?? "",
          coverMetricLabel: project.cover_metric_label ?? "",
          coverImage: project.cover_image ?? "",
          challengeTitle: project.challenge_title ?? "",
          challengeIntro: project.challenge_intro ?? "",
          challengePoints: Array.isArray(project.challenge_points) ? project.challenge_points : [""],
          approachTitle: project.approach_title ?? "",
          approachSteps: Array.isArray(project.approach_steps) ? project.approach_steps : [{ title: "", description: "" }],
          resultsTitle: project.results_title ?? "",
          resultsSummary: project.results_summary ?? "",
          resultsMetrics: Array.isArray(project.results_metrics) ? project.results_metrics : [{ value: "", label: "" }],
          galleryImages: Array.isArray(project.gallery_images) ? project.gallery_images : [""],
          isPublished: project.is_published ?? false,
        }}
      />
    </div>
  );
}
