import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

import { Link } from "@/i18n/navigation";
import { CLIENT_REFERENCES } from "@/lib/client-references";

export async function ClientLogos() {
  const t = await getTranslations("ClientLogos");
  return (
    <Section spacing="md" className="border-mute-100 border-t">
      <Container>
        <div className="text-center">
          <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase">
            {t("eyebrow")}
          </p>
          <h2
            className="font-display text-ink mt-3 leading-tight tracking-tight"
            style={{ fontSize: "var(--text-3xl)" }}
          >
            {t("title")}
          </h2>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
          {CLIENT_REFERENCES.map((client) => (
            <li
              key={client.id}
              className="border-mute-200 bg-paper overflow-hidden rounded-2xl border"
            >
              <Link
                href={`/projeler#${client.id}`}
                className="group focus-visible:outline-accent block focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <div
                  className={`relative aspect-[4/3] ${client.dark ? "bg-[#253238]" : "bg-[#f5f2ed]"}`}
                >
                  <Image
                    src={`/logos/${client.id}.webp`}
                    alt={client.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    className="object-contain p-5 md:p-7"
                  />
                </div>
                <p className="text-ink flex min-h-14 items-center justify-center px-3 py-3 text-center text-xs leading-relaxed font-medium">
                  {client.name}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
