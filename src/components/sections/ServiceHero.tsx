import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

export function ServiceHero({
  slug,
  index,
}: {
  slug: string;
  index: number;
}) {
  const t = useTranslations(`ServicesDetail.${slug}`);
  const tShared = useTranslations("ServicesDetail._shared");

  return (
    <Section spacing="hero">
      <Container>
        <Reveal className="max-w-3xl">
          <Link
            href="/hizmetler"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-mute-500 transition hover:text-accent"
          >
            ← {tShared("back")}
          </Link>
          <p className="mt-6 font-display text-sm tracking-widest text-mute-400">
            {String(index + 1).padStart(2, "0")} · {t("eyebrow")}
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight text-ink md:text-7xl">
            {t("title")}
          </h1>
          <p className="mt-8 max-w-2xl text-xl text-mute-600 md:text-2xl">
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
  );
}
