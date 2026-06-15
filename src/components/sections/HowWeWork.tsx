"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const STEPS = ["discover", "strategy", "execute", "scale"] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

const ACCENT_COLORS = [
  "from-accent/10 to-accent/5",
  "from-mute-800/10 to-mute-800/5",
  "from-accent/10 to-accent/5",
  "from-mute-800/10 to-mute-800/5",
];

function StepCard({
  step,
  index,
  title,
  description,
}: {
  step: string;
  index: number;
  title: string;
  description: string;
}) {
  const num = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      whileHover={{ scale: 1.035, y: -6 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="group relative flex h-full cursor-default flex-col overflow-hidden rounded-2xl border border-mute-200 bg-paper p-8 shadow-sm"
    >
      {/* Hover background glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgb(128 0 0 / 0.06) 0%, transparent 70%)",
        }}
      />

      {/* Top accent line */}
      <motion.div
        className="mb-8 h-[2px] w-12 rounded-full bg-mute-200 origin-left"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1, ease: EASE }}
      >
        <motion.div
          className="h-full w-full rounded-full bg-accent origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        />
      </motion.div>

      {/* Giant watermark number */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-5 top-4 select-none font-display font-black leading-none tracking-tighter text-mute-100 transition-colors duration-500 group-hover:text-mute-200"
        style={{ fontSize: "clamp(5rem, 10vw, 7.5rem)" }}
      >
        {num}
      </span>

      {/* Step number badge */}
      <p className="relative z-10 mb-5 text-[10px] font-bold uppercase tracking-[0.25em] text-accent">
        {num}
      </p>

      {/* Title */}
      <h3
        className="relative z-10 font-display font-bold leading-tight tracking-tight text-ink transition-colors duration-300"
        style={{ fontSize: "clamp(1rem, 2.2vw, var(--text-xl))" }}
      >
        {title}
      </h3>

      {/* Divider */}
      <div className="relative z-10 my-5 h-px w-full bg-mute-100 transition-colors duration-300 group-hover:bg-mute-200" />

      {/* Description */}
      <p className="relative z-10 flex-1 text-sm leading-[1.75] text-mute-500 transition-colors duration-300 group-hover:text-mute-600">
        {description}
      </p>

      {/* Bottom arrow */}
      <div className="relative z-10 mt-8 flex items-center gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">
          {index + 1} / {STEPS.length}
        </span>
        <svg
          width="20"
          height="8"
          viewBox="0 0 20 8"
          fill="none"
          className="text-accent"
        >
          <path
            d="M0 4H18M15 1L18 4L15 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </motion.div>
  );
}

export function HowWeWork() {
  const t = useTranslations("HowWeWork");

  return (
    <Section spacing="md" className="bg-mute-50">
      <Container>
        {/* Section header */}
        <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              {t("eyebrow")}
            </p>
            <h2
              className="mt-4 max-w-lg font-display font-bold leading-[1.05] tracking-tight text-ink"
              style={{ fontSize: "var(--text-4xl)" }}
            >
              {t("title")}
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-mute-500 md:text-right">
            Her adım birbiriyle bağlantılı, her karar ölçülebilir.
          </p>
        </Reveal>

        {/* Cards grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-stretch">
          {STEPS.map((step, i) => (
            <Reveal key={step} variant="fadeUp" delay={i * 0.08} className="h-full">
              <StepCard
                step={step}
                index={i}
                title={t(`${step}.title`)}
                description={t(`${step}.description`)}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
