"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Noise } from "@/components/ui/Noise";

// ─── Easing ──────────────────────────────────────────────────────────────────
const EASE = [0.16, 1, 0.3, 1] as const;

// ─── Entrance variants ────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } },
};

const titleVariants = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
};

const subtleVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const scrollIndicatorVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.6, delay: 1.2 } },
};

// ─── Animated background orbs ────────────────────────────────────────────────
// Three slow-drifting radial gradient orbs layered behind the content.
// Purely decorative — `aria-hidden`, `pointer-events-none`.

const ORBS = [
  {
    // Top-left maroon bloom
    style: {
      width: 900,
      height: 900,
      left: "-15%",
      top: "-35%",
      background:
        "radial-gradient(circle, rgb(128 0 0 / 0.09) 0%, transparent 65%)",
    },
    animate: { x: [0, 50, -30, 0], y: [0, -40, 25, 0] },
    duration: 22,
  },
  {
    // Bottom-right warm bloom
    style: {
      width: 700,
      height: 700,
      right: "-10%",
      bottom: "-25%",
      background:
        "radial-gradient(circle, rgb(128 0 0 / 0.06) 0%, transparent 65%)",
    },
    animate: { x: [0, -40, 20, 0], y: [0, 30, -20, 0] },
    duration: 26,
  },
  {
    // Centre top diffuse highlight
    style: {
      width: 600,
      height: 600,
      left: "30%",
      top: "-20%",
      background:
        "radial-gradient(circle, rgb(200 60 60 / 0.04) 0%, transparent 70%)",
    },
    animate: { x: [0, 30, -15, 0], y: [0, -20, 10, 0] },
    duration: 18,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function Hero() {
  const t = useTranslations("Hero");
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Gate parallax to client-side only → prevents SSR/CSR style mismatch
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const bgY      = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const opacity  = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const parallaxActive = isClient && !reduceMotion;
  const bgStyle      = parallaxActive ? { y: bgY }               : {};
  const contentStyle = parallaxActive ? { y: contentY, opacity } : {};

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-center overflow-hidden"
      aria-label="Hero"
    >
      {/* ── Video background ───────────────────────────────────────── */}
      <motion.div
        aria-hidden
        style={bgStyle}
        className="pointer-events-none absolute inset-0 select-none"
      >
        {/* Rendered server-side for LCP; CSS hides it when prefers-reduced-motion is set */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
          src="/videos/hero-bg.mp4"
        />
        {/* Fallback dark background for reduced-motion / no-video */}
        <div className="absolute inset-0 bg-ink motion-safe:opacity-0" />

        {/* Karartma + marka rengi geçişi */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,_rgb(128_0_0_/_0.25)_0%,_transparent_65%)]" />

        {/* Noise texture */}
        <Noise opacity={0.03} />
      </motion.div>

      {/* ── Content ────────────────────────────────────────────────── */}
      <Container className="relative z-10 w-full">
        <motion.div
          style={contentStyle}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center py-32 text-center md:py-40 lg:py-48"
        >
          {/* Eyebrow badge */}
          <motion.div variants={subtleVariants}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-widest text-white/70 uppercase backdrop-blur-sm">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"
              />
              Denizli · Türkiye
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={titleVariants}
            className="mt-8 max-w-4xl font-display font-bold leading-[1.02] tracking-tight text-white"
            style={{ fontSize: "var(--text-6xl)" }}
          >
            {t("titleBefore")}{" "}
            <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-700 bg-clip-text text-transparent font-bold">
              {t("titleHighlight")}
            </span>{" "}
            {t("titleAfter")}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={subtleVariants}
            className="mt-7 max-w-2xl leading-relaxed text-white/65"
            style={{ fontSize: "var(--text-lg)" }}
          >
            {t("subtitle")}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={subtleVariants}
            className="mt-12 flex flex-col gap-3 sm:flex-row sm:gap-4"
          >
            <ButtonLink href="/audit" variant="primary" size="lg">
              {t("ctaPrimary")}
            </ButtonLink>
            <ButtonLink href="/projeler" variant="secondary" size="lg">
              {t("ctaSecondary")}
            </ButtonLink>
          </motion.div>

          {/* Social proof stats */}
          <motion.div
            variants={subtleVariants}
            className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
          >
            {[
              { value: "10+",   label: "Marka" },
              { value: "250k+", label: "Reklam Bütçesi" },
              { value: "3 yıl", label: "Deneyim" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <span
                  className="font-display font-semibold text-white"
                  style={{ fontSize: "var(--text-2xl)" }}
                >
                  {stat.value}
                </span>
                <span className="text-xs tracking-wide text-white/50 uppercase">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </Container>

      {/* ── Scroll indicator ──────────────────────────────────────── */}
      <motion.div
        variants={scrollIndicatorVariants}
        initial="hidden"
        animate="show"
        aria-hidden
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.2em] text-white/40 uppercase">
          Scroll
        </span>
        <div className="relative h-10 w-px overflow-hidden bg-white/20">
          <motion.div
            className="absolute top-0 left-0 h-full w-full bg-accent"
            animate={reduceMotion ? {} : { y: ["-100%", "100%"] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.4 }}
          />
        </div>
      </motion.div>

      {/* ── Bottom fade to paper ───────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-paper to-transparent"
      />
    </section>
  );
}
