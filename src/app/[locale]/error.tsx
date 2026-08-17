"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Section spacing="lg">
      <Container>
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <p className="font-display text-9xl leading-none tracking-tight text-accent md:text-[12rem]">
            500
          </p>
          <h1 className="mt-8 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-md text-mute-600">{t("body")}</p>
          {error.digest && (
            <p className="mt-3 font-mono text-xs text-mute-400">
              {t("ref", { digest: error.digest })}
            </p>
          )}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button onClick={reset}>{t("retry")}</Button>
            <ButtonLink href="/" variant="secondary">
              {t("home")}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
