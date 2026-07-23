"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export interface AccordionItem {
  q: string;
  a: string;
}

interface AccordionProps {
  items: AccordionItem[];
  /** Aynı anda yalnızca bir öğe açık kalsın */
  single?: boolean;
  className?: string;
}

export function Accordion({ items, single = true, className }: AccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());
  const reduceMotion = useReducedMotion();

  const toggle = (i: number) => {
    setOpenIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        if (single) next.clear();
        next.add(i);
      }
      return next;
    });
  };

  return (
    <ul className={cn("space-y-0", className)}>
      {items.map((item, i) => {
        const isOpen = openIndexes.has(i);

        return (
          <li key={i} className="border-b border-mute-200">
            {/* Soru satırı */}
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
              className={cn(
                "flex w-full cursor-pointer items-start justify-between gap-6 py-6 text-left",
                "text-base font-medium text-ink transition-colors duration-200 hover:text-accent",
                "focus-visible:outline-none focus-visible:text-accent",
                isOpen && "text-accent"
              )}
              style={{ fontSize: "var(--text-lg)" }}
            >
              <span>{item.q}</span>

              {/* + / × ikonu */}
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.3, ease: EASE }
                }
                className="mt-0.5 shrink-0 text-2xl leading-none text-mute-400"
                aria-hidden
              >
                +
              </motion.span>
            </button>

            {/* Cevap — AnimatePresence ile yükseklik animasyonu */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={
                    reduceMotion
                      ? { opacity: 0 }
                      : { height: 0, opacity: 0 }
                  }
                  transition={
                    reduceMotion
                      ? { duration: 0.15 }
                      : {
                          height: { duration: 0.4, ease: EASE },
                          opacity: { duration: 0.3, ease: "easeOut" },
                        }
                  }
                  style={{ overflow: "hidden" }}
                >
                  <p
                    className="pb-6 max-w-2xl leading-relaxed text-mute-600"
                    style={{ fontSize: "var(--text-base)" }}
                  >
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
