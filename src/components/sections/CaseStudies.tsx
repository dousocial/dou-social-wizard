"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Tilt } from "@/components/ui/Tilt";

const CASES = [
  { slug: "case-1", key: "case1", color: "bg-mute-900" },
  { slug: "case-2", key: "case2", color: "bg-mute-800" },
  { slug: "case-3", key: "case3", color: "bg-mute-700" },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

function CaseCard({
  caseItem,
  index,
  t,
}: {
  caseItem: (typeof CASES)[number];
  index: number;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <Tilt maxTilt={6} scale={1.012}>
      <motion.div whileHover="hovered" initial="rest" className="group relative">
        <Link href={`/projeler/${caseItem.slug}` as never} className="block">
          {/* Image placeholder */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm">
            <div
              className={`absolute inset-0 ${caseItem.color} transition-transform duration-700 group-hover:scale-[1.03]`}
            />

            {/* Case number watermark */}
            <motion.div
              variants={{
                rest:    { opacity: 1, scale: 1 },
                hovered: { opacity: 0, scale: 0.9, transition: { duration: 0.25, ease: EASE } },
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span
                className="font-display font-bold leading-none text-paper/10 select-none"
                style={{ fontSize: "clamp(6rem, 15vw, 10rem)" }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </motion.div>

            {/* Hover overlay */}
            <motion.div
              variants={{
                rest:    { y: "100%" },
                hovered: { y: 0, transition: { duration: 0.45, ease: EASE } },
              }}
              className="absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-ink/95 via-ink/70 to-transparent p-7 pt-20"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-paper/50">
                {t(`${caseItem.key}.industry`)}
              </p>
              <h3
                className="mt-2 font-display leading-tight tracking-tight text-paper"
                style={{ fontSize: "var(--text-xl)" }}
              >
                {t(`${caseItem.key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-paper/60">
                {t(`${caseItem.key}.metric`)}
              </p>
              <div className="mt-5 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-paper/70">
                <span>İncele</span>
                <motion.svg
                  variants={{
                    rest:    { x: 0 },
                    hovered: { x: 4, transition: { duration: 0.3, ease: EASE, delay: 0.1 } },
                  }}
                  viewBox="0 0 12 12"
                  className="h-3 w-3"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M1 6h10m0 0L7 2m4 4L7 10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </div>
            </motion.div>
          </div>

          {/* Below-card meta */}
          <div className="mt-5">
            <p className="text-xs uppercase tracking-wider text-mute-500">
              {t(`${caseItem.key}.industry`)}
            </p>
            <h3
              className="mt-2 font-display leading-tight tracking-tight text-ink transition-colors duration-200 group-hover:text-accent"
              style={{ fontSize: "var(--text-2xl)" }}
            >
              {t(`${caseItem.key}.title`)}
            </h3>
            <p className="mt-2 text-sm text-mute-500">
              {t(`${caseItem.key}.metric`)}
            </p>
          </div>
        </Link>
      </motion.div>
    </Tilt>
  );
}

export function CaseStudies() {
  const t = useTranslations("CaseStudies");

  return (
    <Section spacing="md">
      <Container>
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {t("eyebrow")}
            </p>
            <h2
              className="mt-4 font-display leading-[1.1] tracking-tight text-ink"
              style={{ fontSize: "var(--text-4xl)" }}
            >
              {t("title")}
            </h2>
          </div>
          <ButtonLink href="/projeler" variant="ghost" size="sm">
            {t("viewAll")} →
          </ButtonLink>
        </Reveal>

        <Reveal staggerFast className="mt-16 grid gap-8 md:grid-cols-3">
          {CASES.map((c, i) => (
            <RevealItem key={c.key} variant="fadeUp">
              <CaseCard caseItem={c} index={i} t={t} />
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
