"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Noise } from "@/components/ui/Noise";
import { useCountUp } from "@/hooks/useCountUp";

const METRICS = [
  { key: "roas",       prefix: "",  value: 250, suffix: "k+", decimals: 0 },
  { key: "cpl",        prefix: "%", value: 41,  suffix: "",   decimals: 0 },
  { key: "engagement", prefix: "",  value: 3,   suffix: " Yıl", decimals: 0 },
  { key: "brands",     prefix: "",  value: 10,  suffix: "+",  decimals: 0 },
] as const;

function MetricCard({
  metric,
  description,
  index,
}: {
  metric: (typeof METRICS)[number];
  description: string;
  index: number;
}) {
  const { value, ref } = useCountUp({
    to: metric.value,
    duration: 1600 + index * 120,
    decimals: metric.decimals,
  });

  const displayValue =
    metric.decimals > 0 ? value.toFixed(metric.decimals) : Math.round(value);

  return (
    <div className="flex flex-col">
      {/* Animated accent hairline */}
      <motion.div
        className="mb-8 h-px w-12 bg-mute-700"
        initial={{ scaleX: 0, transformOrigin: "left" }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.6,
          delay: index * 0.1,
          ease: [0.16, 1, 0.3, 1],
        }}
      />

      {/* Count-up number */}
      <span
        ref={ref as React.RefObject<HTMLSpanElement>}
        className="font-display leading-none tracking-tight text-paper"
        style={{ fontSize: "var(--text-6xl)" }}
        aria-label={`${metric.prefix}${metric.value}${metric.suffix}`}
      >
        {metric.prefix}{displayValue}{metric.suffix}
      </span>

      {/* Description */}
      <p className="mt-4 max-w-[14rem] text-sm leading-relaxed text-mute-400">
        {description}
      </p>
    </div>
  );
}

export function Metrics() {
  const t = useTranslations("Metrics");

  return (
    <Section spacing="md" className="relative bg-ink text-paper overflow-hidden">
      {/* Noise texture for organic depth on the dark surface */}
      <Noise opacity={0.055} />

      {/* Subtle radial highlight behind the numbers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgb(128 0 0 / 0.12) 0%, transparent 65%)",
        }}
      />

      <Container className="relative z-10">
        <Reveal className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mute-500">
            Sonuçlarla konuşuyoruz
          </p>
        </Reveal>

        <Reveal stagger className="grid gap-12 sm:grid-cols-2 sm:gap-x-20 lg:grid-cols-4 lg:gap-x-16">
          {METRICS.map((m, i) => (
            <RevealItem key={m.key} variant="fadeUp">
              <MetricCard metric={m} description={t(m.key)} index={i} />
            </RevealItem>
          ))}
        </Reveal>

        <Reveal delay={0.4} className="mt-16 border-t border-mute-800 pt-8">
          <p className="text-xs text-mute-700">
            * Ortalama müşteri performansı, son 12 ay verisi.
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
