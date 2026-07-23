"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Easing curves ───────────────────────────────────────────────────────────
const EASE_OUT_EXPO  = [0.16, 1, 0.3, 1] as const;
const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;
const EASE_SPRING    = [0.34, 1.56, 0.64, 1] as const;

// ─── Variant definitions ─────────────────────────────────────────────────────
// NOTE: Never use filter:blur() in hidden states — causes SSR hydration mismatch.
// NOTE: suppressHydrationWarning is added to all MotionTags because Framer Motion
//       serialises styles differently on SSR (string) vs CSR (number/MotionValue).
//       suppressHydrationWarning tells React "don't patch this element" so Framer
//       Motion can own the DOM from the server-rendered initial state. Without it
//       React may override styles, breaking the animation start position.

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

const fadeOnly: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3, ease: EASE_OUT_QUART } },
};

const slideRight: Variants = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

const slideLeft: Variants = {
  hidden: { opacity: 0, x: 24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

const clipReveal: Variants = {
  hidden: { clipPath: "inset(0 0 100% 0)", opacity: 0 },
  show: {
    clipPath: "inset(0 0 0% 0)",
    opacity: 1,
    transition: { duration: 0.55, ease: EASE_OUT_EXPO },
  },
};

const blurIn: Variants = {
  hidden: { opacity: 0, scale: 1.02 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_OUT_QUART },
  },
};

const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: EASE_SPRING },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const staggerFast: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.02 },
  },
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type RevealVariant =
  | "fadeUp"
  | "fadeOnly"
  | "slideRight"
  | "slideLeft"
  | "scaleUp"
  | "clipReveal"
  | "blurIn"
  | "popIn";

const variantMap: Record<RevealVariant, Variants> = {
  fadeUp, fadeOnly, slideRight, slideLeft, scaleUp, clipReveal, blurIn, popIn,
};

type AsTag = "div" | "section" | "ul" | "ol" | "span" | "header" | "footer" | "article";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  as?: AsTag;
  delay?: number;
  stagger?: boolean;
  staggerFast?: boolean;
  variant?: RevealVariant;
  margin?: string;
}

// ─── Reveal (container) ──────────────────────────────────────────────────────

export function Reveal({
  children,
  className,
  as = "div",
  delay = 0,
  stagger: useStagger = false,
  staggerFast: useFastStagger = false,
  variant = "fadeUp",
  margin = "-60px",
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as];

  let variants: Variants;
  if (useStagger)          variants = staggerContainer;
  else if (useFastStagger) variants = staggerFast;
  else if (reduceMotion)   variants = fadeOnly;
  else                     variants = variantMap[variant];

  return (
    <MotionTag
      suppressHydrationWarning
      className={cn(className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin, amount: 0.1 }}
      variants={variants}
      transition={delay && !useStagger && !useFastStagger ? { delay } : undefined}
    >
      {children}
    </MotionTag>
  );
}

// ─── RevealItem (stagger child) ──────────────────────────────────────────────

interface RevealItemProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article" | "span" | "p";
  variant?: RevealVariant;
  delay?: number;
}

export function RevealItem({
  children,
  className,
  as = "div",
  variant = "fadeUp",
  delay,
}: RevealItemProps) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as];
  const variants = reduceMotion ? fadeOnly : variantMap[variant];

  return (
    <MotionTag
      suppressHydrationWarning
      className={cn(className)}
      variants={variants}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </MotionTag>
  );
}

