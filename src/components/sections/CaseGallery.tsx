import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal";

const PLACEHOLDER_TILES = [
  { aspect: "aspect-[4/5]" },
  { aspect: "aspect-[1/1]" },
  { aspect: "aspect-[4/5]" },
  { aspect: "aspect-[1/1]" },
] as const;

export function CaseGallery({ slug }: { slug: string }) {
  const t = useTranslations(`Cases.items.${slug}`);
  const tShared = useTranslations("Cases._shared");

  return (
    <Section spacing="md" className="border-t border-mute-100">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {tShared("galleryEyebrow")}
          </p>
          <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl">
            {t("galleryTitle")}
          </h2>
        </Reveal>

        <Reveal stagger className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PLACEHOLDER_TILES.map((tile, i) => (
            <RevealItem key={i}>
              <div
                className={`${tile.aspect} flex items-center justify-center bg-mute-100 transition hover:bg-mute-200`}
              >
                <span className="font-display text-5xl text-mute-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            </RevealItem>
          ))}
        </Reveal>

        <Reveal className="mt-6">
          <p className="text-xs uppercase tracking-wider text-mute-400">
            {tShared("galleryNote")}
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
