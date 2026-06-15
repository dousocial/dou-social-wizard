import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <Section spacing="lg">
      <Container>
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <p className="font-display text-9xl leading-none tracking-tight text-accent md:text-[12rem]">
            404
          </p>
          <h1 className="mt-8 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-md text-mute-600">{t("body")}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/">{t("home")}</ButtonLink>
            <ButtonLink href="/iletisim" variant="secondary">
              {t("contact")}
            </ButtonLink>
          </div>
          <Link
            href="/projeler"
            className="mt-10 text-xs uppercase tracking-wider text-mute-500 transition hover:text-accent"
          >
            ← {t("seeWork")}
          </Link>
        </div>
      </Container>
    </Section>
  );
}
