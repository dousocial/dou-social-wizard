import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/forms/ContactForm";

export function ContactFormSection() {
  const t = useTranslations("Contact.form");

  return (
    <Section spacing="md">
      <Container>
        <Reveal className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {t("eyebrow")}
            </p>
            <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-6 text-mute-600">{t("subtitle")}</p>
          </div>
          <ContactForm />
        </Reveal>
      </Container>
    </Section>
  );
}
