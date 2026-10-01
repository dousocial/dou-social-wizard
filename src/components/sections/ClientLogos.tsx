import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

const CLIENTS = [
  { name: "Yapıgranit Mermercilik", logo: "yapigranit", dark: true },
  { name: "Fitlife Kitchen", logo: "fitlife", dark: false },
  { name: "EN20 Spor Salonu", logo: "en20", dark: true },
  { name: "Kayra Designer", logo: "kayra", dark: false },
  { name: "B2 Mimarlık", logo: "b2mimarlik", dark: false },
  { name: "Vintora Etiket", logo: "vintora", dark: false },
  { name: "Real Broker", logo: "rb", dark: false },
  { name: "Diyetisyen Ceylin Yastıkçı", logo: "ceylin", dark: false },
  { name: "Hangarage", logo: "han", dark: false },
  { name: "Pamair Havacılık", logo: "pamair", dark: false },
];

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
          {CLIENTS.map((client) => (
            <li
              key={client.logo}
              className="border-mute-200 bg-paper overflow-hidden rounded-2xl border"
            >
              <div
                className={`relative aspect-[4/3] ${client.dark ? "bg-[#253238]" : "bg-[#f5f2ed]"}`}
              >
                <Image
                  src={`/logos/${client.logo}.webp`}
                  alt={client.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                  className="object-contain p-5 md:p-7"
                />
              </div>
              <p className="text-ink flex min-h-14 items-center justify-center px-3 py-3 text-center text-xs leading-relaxed font-medium">
                {client.name}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
