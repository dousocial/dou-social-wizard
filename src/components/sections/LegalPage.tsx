import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

interface LegalSection {
  heading: string;
  paragraphs: string[];
}

interface Props {
  namespace: string;
}

export function LegalPage({ namespace }: Props) {
  const t = useTranslations(namespace);
  const sections = t.raw("sections") as LegalSection[];

  return (
    <>
      <Section spacing="md">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-ink md:text-6xl">
              {t("title")}
            </h1>
            <p className="mt-4 text-sm text-mute-500">{t("lastUpdated")}</p>
          </div>
        </Container>
      </Section>

      <Section spacing="md" className="border-t border-mute-100">
        <Container>
          <div className="mx-auto max-w-3xl space-y-12">
            {sections.map((section, i) => (
              <section key={i}>
                <h2 className="font-display text-2xl leading-tight tracking-tight text-ink md:text-3xl">
                  {section.heading}
                </h2>
                <div className="mt-4 space-y-4">
                  {section.paragraphs.map((p, j) => (
                    <p key={j} className="text-mute-700">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
