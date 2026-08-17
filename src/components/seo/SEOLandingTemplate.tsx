import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal"; // RevealItem diğer bölümlerde kullanılıyor
import { Accordion } from "@/components/ui/Accordion";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { FAQPageSchema } from "@/components/seo/FAQPageSchema";

interface ProblemPoint {
  title: string;
  description: string;
}
interface ProcessStep {
  title: string;
  description: string;
}
interface CaseRef {
  slug: string;
  metric: string;
  industry: string;
  title: string;
}
interface FAQItem {
  q: string;
  a: string;
}
interface ProofMetric {
  value: string;
  label: string;
}

export function SEOLandingTemplate({ slug }: { slug: string }) {
  const t = useTranslations(`SeoLanding.${slug}`);
  const tShared = useTranslations("SeoLanding._shared");

  const proof = t.raw("proof") as ProofMetric[];
  const problems = t.raw("problems") as ProblemPoint[];
  const process = t.raw("process") as ProcessStep[];
  const cases = t.raw("cases") as CaseRef[];
  const faqs = t.raw("faq") as FAQItem[];

  return (
    <>
      <FAQPageSchema items={faqs} />
      {/* Hero */}
      <Section spacing="lg">
        <Container>
          <Reveal className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {t("eyebrow")}
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight text-ink md:text-7xl">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-2xl text-xl text-mute-600 md:text-2xl">
              {t("lead")}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/teklif-al">{tShared("ctaPrimary")}</ButtonLink>
              <ButtonLink href="/strateji-gorusmesi" variant="secondary">
                {tShared("ctaSecondary")}
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* Sosyal kanıt */}
      <Section spacing="md" className="border-t border-mute-100 bg-ink text-paper">
        <Container>
          <Reveal stagger className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {proof.map((m, i) => (
              <RevealItem key={i}>
                <div>
                  <span className="font-display text-5xl leading-none tracking-tight md:text-6xl">
                    {m.value}
                  </span>
                  <p className="mt-3 text-sm text-mute-300">{m.label}</p>
                </div>
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </Section>

      {/* Problem */}
      <Section spacing="md">
        <Container>
          <Reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {tShared("problemEyebrow")}
            </p>
            <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-ink md:text-5xl">
              {t("problemsTitle")}
            </h2>
          </Reveal>
          <Reveal stagger as="ul" className="mt-12 grid gap-px bg-mute-200 md:grid-cols-3">
            {problems.map((p, i) => (
              <RevealItem key={i} as="li">
                <div className="flex h-full flex-col bg-paper p-8">
                  <span className="font-display text-3xl text-accent">✕</span>
                  <h3 className="mt-6 font-display text-xl tracking-tight text-ink">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm text-mute-600">{p.description}</p>
                </div>
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </Section>

      {/* Process */}
      <Section spacing="md" className="bg-mute-50">
        <Container>
          <Reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {tShared("processEyebrow")}
            </p>
            <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-ink md:text-5xl">
              {t("processTitle")}
            </h2>
          </Reveal>
          <Reveal stagger as="ol" className="mt-12 grid gap-12 md:grid-cols-2">
            {process.map((s, i) => (
              <RevealItem key={i} as="li" className="flex gap-6">
                <span className="font-display text-4xl leading-none tracking-tight text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-2xl tracking-tight text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-mute-600">{s.description}</p>
                </div>
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </Section>

      {/* Mini case studies */}
      <Section spacing="md">
        <Container>
          <Reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {tShared("casesEyebrow")}
            </p>
            <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-ink md:text-5xl">
              {t("casesTitle")}
            </h2>
          </Reveal>
          <Reveal stagger className="mt-12 grid gap-8 md:grid-cols-3">
            {cases.map((c) => (
              <RevealItem key={c.slug}>
                <Link
                  href={`/projeler/${c.slug}` as never}
                  className="group block"
                >
                  <div className="aspect-[4/3] flex items-center justify-center overflow-hidden bg-mute-100 transition group-hover:bg-mute-200">
                    <span className="font-display text-6xl leading-none text-mute-300 transition group-hover:text-accent">
                      {c.metric}
                    </span>
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-wider text-mute-500">
                    {c.industry}
                  </p>
                  <h3 className="mt-2 font-display text-xl leading-tight tracking-tight text-ink transition group-hover:text-accent">
                    {c.title}
                  </h3>
                </Link>
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </Section>

      {/* FAQ */}
      <Section spacing="md" className="border-t border-mute-100">
        <Container>
          <Reveal className="grid gap-12 md:grid-cols-[1fr_2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {tShared("faqEyebrow")}
              </p>
              <h2
                className="mt-4 font-display leading-tight tracking-tight text-ink"
                style={{ fontSize: "var(--text-3xl)" }}
              >
                {t("faqTitle")}
              </h2>
            </div>
            <Accordion items={faqs} />
          </Reveal>
        </Container>
      </Section>

      <FinalCTA />
    </>
  );
}
