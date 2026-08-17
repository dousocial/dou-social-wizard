"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const PHONE = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "905300845468";

const pulseAnimation = {
  scale: [1, 1.7, 1.7],
  opacity: [0.4, 0, 0],
};

/**
 * Mobile-only "tap to call" floating action button.
 * Stacks above the WhatsApp FAB.
 */
export function CallFab({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "fixed bottom-24 right-6 z-40 md:hidden",
        className
      )}
    >
      {/* Pulse halkası */}
      <motion.span
        animate={pulseAnimation}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.3 }}
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-ink"
      />

      {/* Ana buton */}
      <motion.a
        href={`tel:+${PHONE}`}
        aria-label="Telefon ile ara"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-ink text-paper shadow-lg shadow-ink/20"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6 fill-current"
          aria-hidden="true"
        >
          <path d="M19.23 15.26l-2.54-.29a1.99 1.99 0 0 0-1.64.57l-1.84 1.84a15.045 15.045 0 0 1-6.59-6.59l1.85-1.85c.43-.43.64-1.03.57-1.64L8.79 4.77c-.12-1.01-.97-1.77-1.99-1.77H5.03c-1.13 0-2.07.94-2 2.07.53 8.54 7.36 15.36 15.89 15.89 1.13.07 2.07-.87 2.07-2v-1.77c.01-1.01-.75-1.86-1.76-1.93z" />
        </svg>
      </motion.a>
    </div>
  );
}
