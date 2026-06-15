import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

interface FAQItem {
  question: string;
  answer: string;
}

export async function FAQSection() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = await getTranslations("FAQ") as any;
  const items = t.raw("items") as FAQItem[];

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      {/* JSON-LD for Google featured snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <Section spacing="md" className="border-t border-mute-100">
        <Container>
          <Reveal className="mx-auto max-w-3xl">
            <div className="divide-y divide-mute-100">
              {items.map((item, i) => (
                <details
                  key={i}
                  className="group py-6 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <span className="font-display text-base font-semibold leading-snug tracking-tight text-ink transition-colors duration-200 group-open:text-accent md:text-lg">
                      {item.question}
                    </span>
                    {/* Plus/Minus toggle */}
                    <span className="relative ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-mute-200 text-mute-500 transition-all duration-200 group-open:border-accent group-open:bg-accent group-open:text-paper">
                      <svg
                        viewBox="0 0 12 12"
                        className="h-3 w-3 transition-transform duration-300 group-open:rotate-45"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M6 1v10M1 6h10"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-mute-600 md:text-base">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </Reveal>

          {/* Bottom CTA */}
          <Reveal delay={0.2} className="mt-16 rounded-2xl bg-mute-50 border border-mute-100 p-8 md:p-10">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  {t("ctaLabel")}
                </p>
                <p
                  className="mt-2 font-display font-semibold tracking-tight text-ink"
                  style={{ fontSize: "var(--text-2xl)" }}
                >
                  {t("ctaText")}
                </p>
              </div>
              <Link
                href="/iletisim"
                className="shrink-0 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-colors duration-200 hover:bg-mute-800"
              >
                {t("ctaButton")} →
              </Link>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
