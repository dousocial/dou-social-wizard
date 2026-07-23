"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { type CaseSlug } from "@/lib/cases";
import { getLenis } from "@/components/layout/SmoothScrollProvider";

const EASE = [0.16, 1, 0.3, 1] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Content types ────────────────────────────────────────────────────────────

interface CaseContent {
  industry: string;
  duration: string;
  title: string;
  summary: string;
  coverMetric: string;
  coverMetricLabel: string;
  challengeTitle: string;
  challengeIntro: string;
  challengePoints: string[];
  approachTitle: string;
  approachSteps: { title: string; description: string }[];
  resultsTitle: string;
  resultsSummary: string;
  resultsMetrics: { value: string; label: string }[];
}

// ─── Drawer content ───────────────────────────────────────────────────────────

function DrawerContent({
  slug,
  content,
  tS,
  onClose,
}: {
  slug: CaseSlug;
  content: CaseContent;
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
        <div className="flex-1 overflow-y-auto">
          {/* Sticky header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-mute-100 bg-paper/90 px-6 py-4 backdrop-blur-sm md:px-8">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-mute-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-mute-600">
                {content.industry}
              </span>
              <span className="text-xs text-mute-400">{content.duration}</span>
            </div>
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
            {/* Hero metric */}
            <div>
              <p
                className="font-display font-bold leading-none tracking-tight text-ink"
                style={{ fontSize: "var(--text-6xl)" }}
              >
                {content.coverMetric}
              </p>
              <p className="mt-2 text-sm font-medium text-mute-500">
                {content.coverMetricLabel}
              </p>
            </div>

            {/* Title + summary */}
            <h2
              className="mt-6 font-display font-bold leading-tight tracking-tight text-ink"
              style={{ fontSize: "var(--text-3xl)" }}
            >
              {content.title}
            </h2>
            <p className="mt-3 leading-relaxed text-mute-600" style={{ fontSize: "var(--text-base)" }}>
              {content.summary}
            </p>

            {/* ── Challenge ── */}
            <div className="mt-10 border-t border-mute-100 pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mute-500">
                {tS("challengeEyebrow")}
              </p>
              <h3
                className="mt-2 font-display font-bold leading-tight text-ink"
                style={{ fontSize: "var(--text-xl)" }}
              >
                {content.challengeTitle}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-mute-600">
                {content.challengeIntro}
              </p>
              <ul className="mt-4 space-y-3">
                {content.challengePoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 h-5 w-5 shrink-0 rounded-full border border-mute-300 flex items-center justify-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    </span>
                    <span className="text-sm leading-relaxed text-mute-600">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Approach ── */}
            <div className="mt-10 border-t border-mute-100 pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mute-500">
                {tS("approachEyebrow")}
              </p>
              <h3
                className="mt-2 font-display font-bold leading-tight text-ink"
                style={{ fontSize: "var(--text-xl)" }}
              >
                {content.approachTitle}
              </h3>
              <ol className="mt-5 space-y-5">
                {content.approachSteps.map((step, i) => (
                  <li key={i} className="flex gap-5">
                    <span className="w-7 shrink-0 font-display text-sm font-semibold tracking-widest text-mute-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{step.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-mute-500">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* ── Results ── */}
            <div className="mt-10 border-t border-mute-100 pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mute-500">
                {tS("resultsEyebrow")}
              </p>
              <h3
                className="mt-2 font-display font-bold leading-tight text-ink"
                style={{ fontSize: "var(--text-xl)" }}
              >
                {content.resultsTitle}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-mute-600">
                {content.resultsSummary}
              </p>

              {/* Metrics grid */}
              <div className="mt-6 grid grid-cols-2 gap-px bg-mute-200">
                {content.resultsMetrics.map((m, i) => (
                  <div key={i} className="bg-paper p-5">
                    <p
                      className="font-display font-bold leading-none tracking-tight text-ink"
                      style={{ fontSize: "var(--text-3xl)" }}
                    >
                      {m.value}
                    </p>
                    <p className="mt-2 text-xs leading-snug text-mute-500">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA footer ── */}
        <div className="flex-none border-t border-mute-100 bg-paper px-6 py-4 md:px-8">
          <div className="flex gap-3">
            <Link
              href={`/projeler/${slug}` as never}
              className="flex-1 rounded-full bg-ink py-3 text-center text-sm font-semibold text-paper transition-colors duration-200 hover:bg-mute-800"
            >
              {tS("ctaProject")}
            </Link>
            <Link
              href="/iletisim"
              className="flex-1 rounded-full border border-mute-300 py-3 text-center text-sm font-semibold text-ink transition-all duration-200 hover:border-ink hover:bg-mute-50"
            >
              {tS("ctaContact")}
            </Link>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export function CaseDrawer({
  slug,
  onClose,
}: {
  slug: CaseSlug | null;
  onClose: () => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tItems = useTranslations("Cases.items") as any;
  const tS = useTranslations("Cases._shared");
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

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  if (!mounted) return null;

  const content: CaseContent | null = slug
    ? {
        industry:        tItems(`${slug}.industry`)                                             as string,
        duration:        tItems(`${slug}.duration`)                                             as string,
        title:           tItems(`${slug}.title`)                                                as string,
        summary:         tItems(`${slug}.summary`)                                              as string,
        coverMetric:     tItems(`${slug}.coverMetric`)                                          as string,
        coverMetricLabel:tItems(`${slug}.coverMetricLabel`)                                     as string,
        challengeTitle:  tItems(`${slug}.challenge.title`)                                      as string,
        challengeIntro:  tItems(`${slug}.challenge.intro`)                                      as string,
        challengePoints: tItems.raw(`${slug}.challenge.points`)                                 as string[],
        approachTitle:   tItems(`${slug}.approach.title`)                                       as string,
        approachSteps:   tItems.raw(`${slug}.approach.steps`)                                   as { title: string; description: string }[],
        resultsTitle:    tItems(`${slug}.results.title`)                                        as string,
        resultsSummary:  tItems(`${slug}.results.summary`)                                      as string,
        resultsMetrics:  tItems.raw(`${slug}.results.metrics`)                                  as { value: string; label: string }[],
      }
    : null;

  return createPortal(
    <AnimatePresence>
      {slug && content && (
        <DrawerContent
          key={slug}
          slug={slug}
          content={content}
          tS={tS}
          onClose={onClose}
        />
      )}
    </AnimatePresence>,
    document.body
  );
}
