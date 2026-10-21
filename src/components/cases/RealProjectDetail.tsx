import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import { CLIENT_REFERENCES } from "@/lib/client-references";
import { REAL_PROJECTS, type ProjectLocale } from "@/lib/real-projects";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { CaseStudySchema } from "@/components/seo/CaseStudySchema";
import { FinalCTA } from "@/components/sections/FinalCTA";

type RealProject = (typeof REAL_PROJECTS)[number];
export function RealProjectDetail({
  project,
  locale,
}: {
  project: RealProject;
  locale: ProjectLocale;
}) {
  const client = CLIENT_REFERENCES.find(
    (item) => item.id === project.clientId
  )!;
  const en = locale === "en";
  return (
    <>
      <CaseStudySchema
        slug={project.slug}
        title={project.title[locale]}
        summary={project.summary[locale]}
        locale={locale}
      />
      <BreadcrumbSchema
        locale={locale}
        crumbs={[
          { name: en ? "Home" : "Ana Sayfa", path: "/" },
          { name: en ? "Projects" : "Projeler", path: "/projeler" },
          { name: client.name, path: `/projeler/${project.slug}` },
        ]}
      />
      <Section spacing="hero">
        <Container>
          <Link
            href="/projeler"
            className="text-mute-500 text-sm underline-offset-4 hover:underline"
          >
            ← {en ? "All projects" : "Tüm projeler"}
          </Link>
          <div className="mt-8 grid items-start gap-8 md:grid-cols-[1fr_200px]">
            <div className="min-w-0">
              <p className="text-accent text-xs font-semibold tracking-wide">
                {client.sector[locale]}
              </p>
              <h1 className="font-display text-ink mt-5 text-3xl leading-tight font-semibold tracking-tight break-words md:text-5xl">
                {project.title[locale]}
              </h1>
              <p className="text-mute-600 mt-6 max-w-3xl text-lg leading-relaxed">
                {project.summary[locale]}
              </p>
            </div>
            <div
              className={`relative h-36 w-48 rounded-2xl ${client.dark ? "bg-[#253238]" : "bg-[#f5f2ed]"}`}
            >
              <Image
                src={`/logos/${client.id}.webp`}
                alt={client.name}
                fill
                sizes="192px"
                className="object-contain p-6"
              />
            </div>
          </div>
        </Container>
      </Section>
      <Section spacing="md" className="bg-mute-50 border-mute-100 border-t">
        <Container>
          <p className="text-accent text-xs font-semibold tracking-widest uppercase">
            {en ? "Project result" : "Çalışmanın sonucu"}
          </p>
          <h2 className="font-display text-ink mt-4 text-2xl tracking-tight md:text-3xl">
            {project.result.label[locale]}
          </h2>
          <p className="font-display text-accent mt-6 text-7xl font-semibold tracking-tight">
            {project.result.value}
          </p>
          <p className="text-mute-600 mt-4 max-w-2xl text-lg">
            {en
              ? "According to DOU Social’s project assessment, this conversion rate doubled between the start of the engagement and the second month."
              : "DOU Social’ın proje değerlendirmesine göre, çalışma başlangıcı ile ikinci ay karşılaştırıldığında bu dönüşüm oranı 2 katına çıktı."}
          </p>
          <p className="text-mute-500 mt-5 text-sm">
            {project.result.period[locale]} · {en ? "Source: " : "Kaynak: "}
            {project.result.source[locale]}
          </p>
        </Container>
      </Section>
      <Section spacing="md" className="border-mute-100 border-t">
        <Container>
          <h2 className="font-display text-ink text-2xl tracking-tight md:text-3xl">
            {en ? "Project context" : "Çalışmanın odağı"}
          </h2>
          <p className="text-mute-600 mt-5 max-w-3xl text-lg leading-relaxed">
            {project.focus[locale]}
          </p>
          <h2 className="font-display text-ink mt-12 text-2xl tracking-tight md:text-3xl">
            {en ? "Services delivered" : "Neler yaptık?"}
          </h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {project.work.map((work) => (
              <article
                key={work.href}
                className="border-mute-200 rounded-2xl border p-6 md:p-8"
              >
                <h3 className="font-display text-ink text-xl font-medium">
                  {work.title[locale]}
                </h3>
                <p className="text-mute-600 mt-4 leading-relaxed">
                  {work.description[locale]}
                </p>
                <Link
                  href={work.href}
                  className="text-accent mt-6 inline-flex text-sm font-medium underline-offset-4 hover:underline"
                >
                  {en ? "Explore this service" : "Bu hizmeti incele"} →
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </Section>
      <Section spacing="md" className="border-mute-100 border-t">
        <Container>
          <h2 className="font-display text-ink text-2xl tracking-tight">
            {en ? "Other projects" : "Diğer çalışmalar"}
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {REAL_PROJECTS.filter((other) => other.slug !== project.slug).map(
              (other) => (
                <li key={other.slug}>
                  <Link
                    href={`/projeler/${other.slug}`}
                    className="border-mute-200 text-ink hover:text-accent block rounded-xl border p-5 text-base"
                  >
                    {other.title[locale]} →
                  </Link>
                </li>
              )
            )}
          </ul>
        </Container>
      </Section>
      <FinalCTA />
    </>
  );
}
