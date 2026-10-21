import Image from "next/image";
import { getLocale } from "next-intl/server";
import { REAL_PROJECTS } from "@/lib/real-projects";
import { CLIENT_REFERENCES } from "@/lib/client-references";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";

export async function ClientReferences() {
  const locale = (await getLocale()) === "en" ? "en" : "tr";
  const en = locale === "en";
  const otherClients = CLIENT_REFERENCES.filter(
    (client) => !REAL_PROJECTS.some((project) => project.clientId === client.id)
  );
  return (
    <>
      <Section spacing="md" className="border-mute-100 border-t">
        <Container>
          <h2 className="font-display text-ink mb-8 text-2xl tracking-tight md:text-3xl">
            {en ? "Selected projects" : "Seçili çalışmalar"}
          </h2>
          <div className="grid gap-6 lg:grid-cols-3">
            {REAL_PROJECTS.map((project) => {
              const client = CLIENT_REFERENCES.find(
                (item) => item.id === project.clientId
              )!;
              return (
                <article
                  key={client.id}
                  id={client.id}
                  className="border-mute-200 bg-paper scroll-mt-28 rounded-2xl border p-6"
                >
                  <div
                    className={`relative h-24 w-28 overflow-hidden rounded-xl ${client.dark ? "bg-[#253238]" : "bg-[#f5f2ed]"}`}
                  >
                    <Image
                      src={`/logos/${client.id}.webp`}
                      alt={client.name}
                      fill
                      sizes="112px"
                      className="object-contain p-3"
                    />
                  </div>
                  <p className="text-accent mt-6 text-xs font-semibold tracking-wide">
                    {client.sector[locale]}
                  </p>
                  <h3 className="font-display text-ink mt-2 text-2xl font-semibold tracking-tight break-words">
                    {client.name}
                  </h3>
                  <p className="text-mute-600 mt-4 leading-relaxed">
                    {project.summary[locale]}
                  </p>
                  <div className="border-mute-200 mt-6 border-t pt-5">
                    <p className="font-display text-accent text-4xl font-semibold">
                      {project.result.value}
                    </p>
                    <p className="text-ink mt-2 text-sm font-medium">
                      {project.result.label[locale]}
                    </p>
                    <p className="text-mute-500 mt-2 text-xs leading-relaxed">
                      {project.result.period[locale]}
                    </p>
                    <p className="text-mute-500 mt-2 text-xs">
                      {en ? "Source: " : "Kaynak: "}
                      {project.result.source[locale]}
                    </p>
                  </div>
                  <Link
                    href={`/projeler/${project.slug}`}
                    className="text-accent mt-6 inline-flex text-sm font-semibold underline-offset-4 hover:underline"
                  >
                    {en
                      ? "Explore the project"
                      : "Çalışmanın detaylarını incele"}{" "}
                    →
                  </Link>
                </article>
              );
            })}
          </div>
        </Container>
      </Section>
      <Section spacing="md" className="border-mute-100 border-t">
        <Container>
          <h2 className="font-display text-ink text-2xl tracking-tight md:text-3xl">
            {en ? "Other client brands" : "Diğer referans markalarımız"}
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {otherClients.map((client) => (
              <li
                key={client.id}
                id={client.id}
                className="border-mute-200 scroll-mt-28 overflow-hidden rounded-2xl border"
              >
                <div
                  className={`relative aspect-[4/3] ${client.dark ? "bg-[#253238]" : "bg-[#f5f2ed]"}`}
                >
                  <Image
                    src={`/logos/${client.id}.webp`}
                    alt={client.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-contain p-5"
                  />
                </div>
                <p className="text-ink px-3 py-4 text-center text-sm font-medium">
                  {client.name}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
