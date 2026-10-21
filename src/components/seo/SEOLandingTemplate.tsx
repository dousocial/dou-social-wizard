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
interface RelatedResource {
  href: string;
  title: string;
  description: string;
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
  const resources = t.raw("resources") as RelatedResource[];
  const faqs = t.raw("faq") as FAQItem[];

  return (
    <>
      <FAQPageSchema items={faqs} />
      {/* Hero */}
      <Section spacing="lg">
        <Container>
          <Reveal className="max-w-4xl">
            <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase">
              {t("eyebrow")}
            </p>
            <h1 className="font-display text-ink mt-6 text-5xl leading-[1.05] tracking-tight md:text-7xl">
              {t("title")}
            </h1>
            <p className="text-mute-600 mt-6 max-w-2xl text-xl md:text-2xl">
              {t("lead")}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/teklif-al">{tShared("ctaPrimary")}</ButtonLink>
              <ButtonLink href="/iletisim" variant="secondary">
                {tShared("ctaSecondary")}
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* Service scope: only verifiable process information. */}
      <Section
        spacing="md"
        className="border-mute-100 bg-ink text-paper border-t"
      >
        <Container>
          <Reveal stagger className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {proof.map((m, i) => (
              <RevealItem key={i}>
                <div>
                  <span className="font-display text-5xl leading-none tracking-tight md:text-6xl">
                    {m.value}
                  </span>
                  <p className="text-mute-300 mt-3 text-sm">{m.label}</p>
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
            <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase">
              {tShared("problemEyebrow")}
            </p>
            <h2 className="font-display text-ink mt-4 text-3xl leading-tight tracking-tight md:text-5xl">
              {t("problemsTitle")}
            </h2>
          </Reveal>
          <Reveal
            stagger
            as="ul"
            className="bg-mute-200 mt-12 grid gap-px md:grid-cols-3"
          >
            {problems.map((p, i) => (
              <RevealItem key={i} as="li">
                <div className="bg-paper flex h-full flex-col p-8">
                  <span className="font-display text-accent text-3xl">✕</span>
                  <h3 className="font-display text-ink mt-6 text-xl tracking-tight">
                    {p.title}
                  </h3>
                  <p className="text-mute-600 mt-3 text-sm">{p.description}</p>
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
            <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase">
              {tShared("processEyebrow")}
            </p>
            <h2 className="font-display text-ink mt-4 text-3xl leading-tight tracking-tight md:text-5xl">
              {t("processTitle")}
            </h2>
          </Reveal>
          <Reveal stagger as="ol" className="mt-12 grid gap-12 md:grid-cols-2">
            {process.map((s, i) => (
              <RevealItem key={i} as="li" className="flex gap-6">
                <span className="font-display text-accent text-4xl leading-none tracking-tight">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-ink text-2xl tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-mute-600 mt-3">{s.description}</p>
                </div>
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </Section>

      {/* Relevant services, without unverified case-study claims. */}
      <Section spacing="md">
        <Container>
          <Reveal className="max-w-2xl">
            <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase">
              {tShared("casesEyebrow")}
            </p>
            <h2 className="font-display text-ink mt-4 text-3xl leading-tight tracking-tight md:text-5xl">
              {t("casesTitle")}
            </h2>
          </Reveal>
          <Reveal stagger className="mt-12 grid gap-8 md:grid-cols-3">
            {resources.map((resource) => (
              <RevealItem key={resource.href}>
                <Link href={resource.href as never} className="group block">
                  <h3 className="font-display text-ink group-hover:text-accent mt-2 text-xl leading-tight tracking-tight transition">
                    {resource.title}
                  </h3>
                  <p className="text-mute-600 mt-3 text-sm">
                    {resource.description}
                  </p>
                  <span
                    className="text-accent mt-4 inline-block text-sm"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Link>
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </Section>

      {/* FAQ */}
      <Section spacing="md" className="border-mute-100 border-t">
        <Container>
          <Reveal className="grid gap-12 md:grid-cols-[1fr_2fr]">
            <div>
              <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase">
                {tShared("faqEyebrow")}
              </p>
              <h2
                className="font-display text-ink mt-4 leading-tight tracking-tight"
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
