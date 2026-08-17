"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

type HeadingTag = "h1" | "h2" | "h3" | "p" | "span";

interface WordRevealProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  /** Per-word stagger delay in seconds */
  stagger?: number;
  /** Viewport margin for scroll trigger */
  margin?: string;
  as?: HeadingTag;
}

/**
 * Splits text by words and reveals each one with a masked upward slide.
 * The `overflow-hidden` clip on each word container creates a "wipe from below".
 *
 * SSR note: `suppressHydrationWarning` is added to the inner motion.span.
 * Framer Motion serialises `y: "105%"` as a CSS transform string on SSR, but
 * manages it via a MotionValue on CSR, causing a style-attribute mismatch.
 * suppressHydrationWarning tells React to accept the server-rendered style
 * so Framer Motion can animate from the correct initial position.
 */
export function WordReveal({
  text,
  className,
  style,
  stagger = 0.075,
  margin = "-20px",
  as: Tag = "span",
}: WordRevealProps) {
  const reduceMotion = useReducedMotion();
  const words = text.split(" ");

  return (
    <Tag className={cn("block", className)} style={style} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden"
          // bottom padding prevents descenders (ş, ğ, etc.) from clipping
          style={{ paddingBottom: "0.08em", marginRight: "0.25em" }}
        >
          <motion.span
            suppressHydrationWarning
            className="inline-block"
            initial={reduceMotion ? {} : { y: "105%" }}
            whileInView={reduceMotion ? {} : { y: 0 }}
            viewport={{ once: true, margin }}
            transition={{
              duration: 0.75,
              ease: EASE,
              delay: i * stagger,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
