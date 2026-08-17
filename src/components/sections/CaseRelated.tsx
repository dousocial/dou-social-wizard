import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { CASE_SLUGS, type CaseSlug } from "@/lib/cases";

export function CaseRelated({ slug }: { slug: CaseSlug }) {
  const t = useTranslations("Cases.items");
  const tShared = useTranslations("Cases._shared");

  const related = CASE_SLUGS.filter((s) => s !== slug).slice(0, 3);

  return (
    <Section spacing="md" className="bg-mute-50">
      <Container>
        <Reveal className="flex items-end justify-between gap-6">
          <h2 className="font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl">
            {tShared("relatedTitle")}
          </h2>
          <Link
            href="/projeler"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-mute-500 transition hover:text-accent"
          >
            {tShared("viewAll")} →
          </Link>
        </Reveal>

        <Reveal stagger className="mt-12 grid gap-8 md:grid-cols-3">
          {related.map((r) => (
            <RevealItem key={r}>
              <Link href={`/projeler/${r}` as never} className="group block">
                <div className="aspect-[4/3] w-full overflow-hidden bg-paper transition group-hover:bg-mute-100">
                  <div className="flex h-full w-full items-center justify-center p-8">
                    <span className="font-display text-5xl text-mute-300 transition group-hover:text-accent">
                      {t(`${r}.coverMetric`)}
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-xs uppercase tracking-wider text-mute-500">
                  {t(`${r}.industry`)}
                </p>
                <h3 className="mt-2 font-display text-xl leading-tight tracking-tight text-ink transition group-hover:text-accent">
                  {t(`${r}.title`)}
                </h3>
              </Link>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
