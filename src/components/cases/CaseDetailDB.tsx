import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { CaseStudySchema } from "@/components/seo/CaseStudySchema";

export interface DBProject {
  id: string;
  locale: string;
  slug: string;
  industry: string;
  duration: string;
  title: string;
  seo_title: string | null;
  summary: string;
  cover_metric: string;
  cover_metric_label: string;
  cover_image: string | null;
  challenge_title: string;
  challenge_intro: string;
  challenge_points: string[];
  approach_title: string;
  approach_steps: { title: string; description: string }[];
  results_title: string;
  results_summary: string;
  results_metrics: { value: string; label: string }[];
  gallery_images: string[];
  is_published: boolean;
}

const GALLERY_ASPECTS = ["aspect-[4/5]", "aspect-[1/1]", "aspect-[4/5]", "aspect-[1/1]"] as const;

export function CaseDetailDB({ project, locale }: { project: DBProject; locale: string }) {
  const l = locale as "tr" | "en";

  return (
    <>
      <CaseStudySchema
        slug={project.slug}
        title={project.seo_title ?? project.title}
        summary={project.summary}
        locale={l}
      />
      <BreadcrumbSchema
        locale={l}
        crumbs={[
          { name: "Ana Sayfa", path: "/" },
          { name: "Projeler", path: "/projeler" },
          { name: project.title, path: `/projeler/${project.slug}` },
        ]}
      />

      {/* ── Cover ────────────────────────────────────────────────────── */}
      <Section spacing="lg">
        <Container>
          <Reveal>
            <Link
              href="/projeler"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-mute-500 transition hover:text-accent"
            >
              ← Tüm projeler
            </Link>

            <div className="mt-10 grid gap-12 lg:grid-cols-[2fr_1fr] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  {project.industry}{project.duration ? ` · ${project.duration}` : ""}
                </p>
                <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight text-ink md:text-7xl">
                  {project.title}
                </h1>
                <p className="mt-6 max-w-2xl text-xl text-mute-600 md:text-2xl">
                  {project.summary}
                </p>
              </div>
              {project.cover_metric && (
                <div className="lg:text-right">
                  <p className="font-display text-7xl leading-none tracking-tight text-accent md:text-9xl">
                    {project.cover_metric}
                  </p>
                  <p className="mt-3 text-sm text-mute-500">{project.cover_metric_label}</p>
                </div>
              )}
            </div>

            {project.cover_image && (
              <div className="mt-14 overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.cover_image}
                  alt={project.title}
                  className="w-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </div>
            )}
          </Reveal>
        </Container>
      </Section>

      {/* ── Challenge ─────────────────────────────────────────────────── */}
      {(project.challenge_intro || project.challenge_points.length > 0) && (
        <Section spacing="md" className="border-t border-mute-100 bg-mute-50">
          <Container>
            <Reveal className="grid gap-12 md:grid-cols-[1fr_2fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  Sorun
                </p>
                <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl">
                  {project.challenge_title || "Zorluk"}
                </h2>
              </div>
              <div className="space-y-6">
                {project.challenge_intro && (
                  <p className="text-lg text-mute-700">{project.challenge_intro}</p>
                )}
                {project.challenge_points.length > 0 && (
                  <ul className="space-y-3 border-l-2 border-accent pl-6">
                    {project.challenge_points.map((p, i) => (
                      <RevealItem key={i} as="li" className="text-mute-700">
                        {p}
                      </RevealItem>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          </Container>
        </Section>
      )}

      {/* ── Approach ──────────────────────────────────────────────────── */}
      {project.approach_steps.length > 0 && (
        <Section spacing="md">
          <Container>
            <Reveal className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Yaklaşım
              </p>
              <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-ink md:text-5xl">
                {project.approach_title || "Nasıl yaptık?"}
              </h2>
            </Reveal>

            <Reveal stagger as="ol" className="mt-12 grid gap-px bg-mute-200 md:grid-cols-2">
              {project.approach_steps.map((s, i) => (
                <RevealItem key={i} as="li" className="bg-paper p-8 md:p-10">
                  <span className="font-display text-4xl leading-none tracking-tight text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-6 font-display text-2xl tracking-tight text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-mute-600">{s.description}</p>
                </RevealItem>
              ))}
            </Reveal>
          </Container>
        </Section>
      )}

      {/* ── Results ───────────────────────────────────────────────────── */}
      {project.results_metrics.length > 0 && (
        <Section spacing="md" className="bg-ink text-paper">
          <Container>
            <Reveal className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Sonuçlar
              </p>
              <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight md:text-5xl">
                {project.results_title || "Elde ettiğimiz sonuçlar."}
              </h2>
              {project.results_summary && (
                <p className="mt-6 text-lg text-mute-300">{project.results_summary}</p>
              )}
            </Reveal>

            <Reveal stagger className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
              {project.results_metrics.map((m, i) => (
                <RevealItem key={i}>
                  <div className="flex flex-col">
                    <span className="font-display text-6xl leading-none tracking-tight md:text-7xl">
                      {m.value}
                    </span>
                    <p className="mt-4 max-w-[14rem] text-sm text-mute-300">{m.label}</p>
                  </div>
                </RevealItem>
              ))}
            </Reveal>
          </Container>
        </Section>
      )}

      {/* ── Gallery ───────────────────────────────────────────────────── */}
      {(project.gallery_images.length > 0 || project.cover_image) && (
        <Section spacing="md" className="border-t border-mute-100">
          <Container>
            <Reveal className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Galeri
              </p>
            </Reveal>

            <Reveal stagger className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {project.gallery_images.length > 0
                ? project.gallery_images.map((src, i) => (
                    <RevealItem key={i}>
                      <div className={`${GALLERY_ASPECTS[i % 4]} overflow-hidden`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`${project.title} — ${i + 1}`}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </RevealItem>
                  ))
                : GALLERY_ASPECTS.map((aspect, i) => (
                    <RevealItem key={i}>
                      <div className={`${aspect} flex items-center justify-center bg-mute-100 transition hover:bg-mute-200`}>
                        <span className="font-display text-5xl text-mute-300">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                    </RevealItem>
                  ))}
            </Reveal>
          </Container>
        </Section>
      )}

      <FinalCTA />
    </>
  );
}
