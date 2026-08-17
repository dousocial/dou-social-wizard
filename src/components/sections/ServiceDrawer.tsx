"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { type ServiceSlug } from "@/lib/services";
import { getLenis } from "@/components/layout/SmoothScrollProvider";

const EASE = [0.16, 1, 0.3, 1] as const;

// ─── Small icon helpers ───────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" fill="none" aria-hidden>
      <path d="M2.5 8l3.5 3.5 7.5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceContent {
  eyebrow: string;
  title: string;
  lead: string;
  problemTitle: string;
  problemPoints: string[];
  processTitle: string;
  processSteps: { title: string; description: string }[];
  delivTitle: string;
  delivItems: string[];
  faqTitle: string;
  faqItems: { q: string; a: string }[];
}

// ─── Drawer inner (only rendered when slug is non-null) ───────────────────────

function DrawerContent({
  content,
  tS,
  onClose,
}: {
  content: ServiceContent;
  tS: ReturnType<typeof useTranslations>;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        suppressHydrationWarning
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-40 cursor-pointer bg-black/40 dark:bg-black/60"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <motion.aside
        suppressHydrationWarning
        key="panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.5, ease: EASE }}
        className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-2xl flex-col border-l border-mute-200 bg-paper shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={content.title}
      >
        {/* ── Scrollable body ── */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain">
          {/* Sticky header bar */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-mute-100 bg-paper/90 px-6 py-4 backdrop-blur-sm md:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {content.eyebrow}
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-mute-200 text-mute-500 transition-all duration-200 hover:border-ink hover:bg-ink hover:text-paper"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="px-6 pb-16 pt-8 md:px-8">
            {/* Title + lead */}
            <h2
              className="font-display font-bold leading-tight tracking-tight text-ink"
              style={{ fontSize: "var(--text-4xl)" }}
            >
              {content.title}
            </h2>
            <p
              className="mt-4 leading-relaxed text-mute-600"
              style={{ fontSize: "var(--text-base)" }}
            >
              {content.lead}
            </p>

            {/* ── Problem ── */}
            <div className="mt-10 border-t border-mute-100 pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mute-500">
                {tS("problemEyebrow")}
              </p>
              <h3
                className="mt-2 font-display font-bold leading-tight text-ink"
                style={{ fontSize: "var(--text-xl)" }}
              >
                {content.problemTitle}
              </h3>
              <ul className="mt-5 space-y-3">
                {content.problemPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 h-5 w-5 shrink-0 rounded-full border border-mute-300 flex items-center justify-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    </span>
                    <span className="text-sm leading-relaxed text-mute-600">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Process ── */}
            <div className="mt-10 border-t border-mute-100 pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mute-500">
                {tS("processEyebrow")}
              </p>
              <h3
                className="mt-2 font-display font-bold leading-tight text-ink"
                style={{ fontSize: "var(--text-xl)" }}
              >
                {content.processTitle}
              </h3>
              <ol className="mt-5 space-y-5">
                {content.processSteps.map((step, i) => (
                  <li key={i} className="flex gap-5">
                    <span className="w-7 shrink-0 font-display text-sm font-semibold tracking-widest text-mute-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{step.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-mute-500">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* ── Deliverables ── */}
            <div className="mt-10 border-t border-mute-100 pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mute-500">
                {tS("deliverablesEyebrow")}
              </p>
              <h3
                className="mt-2 font-display font-bold leading-tight text-ink"
                style={{ fontSize: "var(--text-xl)" }}
              >
                {content.delivTitle}
              </h3>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {content.delivItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckIcon />
                    <span className="text-sm leading-relaxed text-mute-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── FAQ ── */}
            <div className="mt-10 border-t border-mute-100 pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mute-500">
                {tS("faqEyebrow")}
              </p>
              <h3
                className="mt-2 font-display font-bold leading-tight text-ink"
                style={{ fontSize: "var(--text-xl)" }}
              >
                {content.faqTitle}
              </h3>
              <dl className="mt-5 space-y-3">
                {content.faqItems.map((item, i) => (
                  <div key={i} className="rounded-xl bg-mute-50 p-5">
                    <dt className="font-semibold text-sm text-ink">{item.q}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-mute-500">{item.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* ── CTA footer ── */}
        <div className="flex-none border-t border-mute-100 bg-paper px-6 py-4 md:px-8">
          <div className="flex gap-3">
            <Link
              href="/iletisim"
              className="flex-1 rounded-full bg-ink py-3 text-center text-sm font-semibold text-paper transition-colors duration-200 hover:bg-mute-800"
            >
              {tS("ctaPrimary")}
            </Link>
            <a
              href="tel:+905300845468"
              className="flex-1 rounded-full border border-mute-300 py-3 text-center text-sm font-semibold text-ink transition-all duration-200 hover:border-ink hover:bg-mute-50"
            >
              {tS("ctaSecondary")}
            </a>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export function ServiceDrawer({
  slug,
  onClose,
}: {
  slug: ServiceSlug | null;
  onClose: () => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tD = useTranslations("ServicesDetail") as any;
  const tS = useTranslations("ServicesDetail._shared");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const lenis = getLenis();
    if (slug) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.body.style.overflow = "";
    }
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [slug]);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  if (!mounted) return null;

  // Build content object only when a slug is active
  const content: ServiceContent | null = slug
    ? {
        eyebrow:       tD(`${slug}.eyebrow`)                                              as string,
        title:         tD(`${slug}.title`)                                                 as string,
        lead:          tD(`${slug}.lead`)                                                  as string,
        problemTitle:  tD(`${slug}.problem.title`)                                         as string,
        problemPoints: tD.raw(`${slug}.problem.points`)                                    as string[],
        processTitle:  tD(`${slug}.process.title`)                                         as string,
        processSteps:  tD.raw(`${slug}.process.steps`)                                     as { title: string; description: string }[],
        delivTitle:    tD(`${slug}.deliverables.title`)                                    as string,
        delivItems:    tD.raw(`${slug}.deliverables.items`)                                as string[],
        faqTitle:      tD(`${slug}.faq.title`)                                             as string,
        faqItems:      tD.raw(`${slug}.faq.items`)                                         as { q: string; a: string }[],
      }
    : null;

  return createPortal(
    <AnimatePresence>
      {slug && content && (
        <DrawerContent
          key={slug}
          content={content}
          tS={tS}
          onClose={onClose}
        />
      )}
    </AnimatePresence>,
    document.body
  );
}
