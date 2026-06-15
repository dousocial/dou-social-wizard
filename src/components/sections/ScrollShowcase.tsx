"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
} from "framer-motion";
import { Link } from "@/i18n/navigation";

const SLIDES = [
  {
    num: "01",
    metric: "3.4×",
    metricLabel: "dönüşüm artışı",
    titleKey: "case1",
    href: "/projeler/e-ticaret-3x-donusum",
  },
  {
    num: "02",
    metric: "%58",
    metricLabel: "düşük lead maliyeti",
    titleKey: "case2",
    href: "/projeler/b2b-yazilim-lead-jenerasyonu",
  },
  {
    num: "03",
    metric: "2×",
    metricLabel: "şube ziyareti artışı",
    titleKey: "case3",
    href: "/projeler/restoran-yerel-buyume",
  },
] as const;

// ─── Fallback ─────────────────────────────────────────────────────────────────

function ShowcaseFallback({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <section className="bg-ink py-20 md:py-28">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {t("eyebrow")}
            </p>
            <h2
              className="mt-3 font-display leading-tight tracking-tight text-paper"
              style={{ fontSize: "var(--text-4xl)" }}
            >
              {t("title")}
            </h2>
          </div>
          <Link
            href="/projeler"
            className="text-sm font-medium text-mute-400 transition hover:text-paper"
          >
            {t("viewAll")} →
          </Link>
        </div>
        <div className="mt-14 grid gap-10 border-t border-mute-800 pt-10 md:grid-cols-3">
          {SLIDES.map((s) => (
            <Link
              key={s.num}
              href={s.href as never}
              className="group block border-b border-mute-800 pb-10"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mute-600">
                {s.num}
              </p>
              <p
                className="mt-6 font-display font-bold leading-none tracking-tight text-paper transition-colors duration-300 group-hover:text-accent"
                style={{ fontSize: "clamp(3.5rem, 8vw, 5rem)" }}
              >
                {s.metric}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.15em] text-mute-500">
                {s.metricLabel}
              </p>
              <h3
                className="mt-6 font-display leading-tight tracking-tight text-paper"
                style={{ fontSize: "var(--text-xl)" }}
              >
                {t(`${s.titleKey}.title`)}
              </h3>
              <p className="mt-2 text-sm text-mute-600">{t(`${s.titleKey}.metric`)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Inner (client-only, scroll logic) ───────────────────────────────────────
// This component only mounts after hydration, so containerRef is always
// attached to a real DOM node. We use useScroll() (window scroll, no target)
// and manually normalise the progress from the container's document bounds.
// This pattern is required when Lenis smooth-scroll is active because Framer
// Motion's target-based useScroll relies on IntersectionObserver which can
// desync from Lenis's virtual scroll position.

function ScrollShowcaseInner({ t }: { t: ReturnType<typeof useTranslations> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef({ start: 0, end: 1 });
  const [activeIndex, setActiveIndex] = useState(0);

  // Measure container position in document coordinates after first paint
  // and whenever the viewport resizes (other content might shift).
  useEffect(() => {
    const measure = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollY = window.scrollY;
      const start = rect.top + scrollY;
      const end = start + el.offsetHeight - window.innerHeight;
      boundsRef.current = { start, end };
    };

    // Defer one frame so the browser has finished its first layout pass
    const id = requestAnimationFrame(measure);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Track raw window scrollY — works reliably with Lenis because Lenis
  // calls window.scrollTo() which fires native scroll events on the window.
  const { scrollY } = useScroll();

  // Normalise scroll position to [0, 1] over the container's scroll range
  const scrollYProgress = useTransform(scrollY, (v) => {
    const { start, end } = boundsRef.current;
    if (end <= start) return 0;
    return Math.max(0, Math.min(1, (v - start) / (end - start)));
  });

  // 3 slides: hold ~25% each, transition ~12% between them
  const x = useTransform(
    scrollYProgress,
    [0, 0.15, 0.38, 0.5, 0.72, 1],
    ["0%", "0%", "-33.33%", "-33.33%", "-66.67%", "-66.67%"]
  );

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActiveIndex(v < 0.38 ? 0 : v < 0.72 ? 1 : 2);
  });

  return (
    <div ref={containerRef} className="h-[300vh]">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden bg-ink">

        {/* Header row */}
        <div className="mx-auto w-full max-w-[1280px] flex-none px-6 pt-12 md:px-10 md:pt-14">
          <div className="flex items-end justify-between pb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {t("eyebrow")}
              </p>
              <h2
                className="mt-3 font-display leading-tight tracking-tight text-paper"
                style={{ fontSize: "var(--text-3xl)" }}
              >
                {t("title")}
              </h2>
            </div>
            <Link
              href="/projeler"
              className="hidden text-sm font-medium text-mute-500 transition duration-200 hover:text-paper md:block"
            >
              {t("viewAll")} →
            </Link>
          </div>
          <div className="h-px bg-mute-800" />
        </div>

        {/* Slide track */}
        <div className="flex-1 overflow-hidden">
          <motion.div
            suppressHydrationWarning
            className="flex h-full"
            style={{ x, width: "300%" }}
          >
            {SLIDES.map((slide) => (
              <div
                key={slide.num}
                className="flex h-full w-1/3 flex-col justify-between px-6 py-10 md:px-10 md:py-12"
              >
                {/* Slide number + industry */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-mute-600">
                    {slide.num}
                  </span>
                  <div className="h-px flex-1 bg-mute-800" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-mute-600">
                    {t(`${slide.titleKey}.industry`)}
                  </span>
                </div>

                {/* Giant metric */}
                <div>
                  <p
                    aria-label={`${slide.metric} ${slide.metricLabel}`}
                    className="font-display font-bold leading-none tracking-tight text-paper"
                    style={{ fontSize: "clamp(5rem, 20vw, 14rem)" }}
                  >
                    {slide.metric}
                  </p>
                  <p className="mt-3 text-sm font-medium uppercase tracking-[0.18em] text-mute-500">
                    {slide.metricLabel}
                  </p>
                </div>

                {/* Project title + link */}
                <div className="flex items-end justify-between gap-6">
                  <div className="max-w-lg">
                    <h3
                      className="font-display leading-tight tracking-tight text-paper"
                      style={{ fontSize: "var(--text-xl)" }}
                    >
                      {t(`${slide.titleKey}.title`)}
                    </h3>
                    <p className="mt-2 text-sm text-mute-500">
                      {t(`${slide.titleKey}.metric`)}
                    </p>
                  </div>
                  <Link
                    href={slide.href as never}
                    className="group flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-mute-500 transition-colors duration-200 hover:text-paper"
                  >
                    İncele
                    <svg
                      className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1"
                      viewBox="0 0 12 12"
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
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Active slide dots */}
        <div className="flex-none pb-8">
          <div className="flex items-center justify-center gap-2">
            {SLIDES.map((_, i) => (
              <motion.div
                key={i}
                suppressHydrationWarning
                className="rounded-full"
                animate={{
                  width: activeIndex === i ? 28 : 6,
                  height: 6,
                  backgroundColor:
                    activeIndex === i ? "rgb(128 0 0)" : "rgb(64 64 64)",
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export function ScrollShowcase() {
  const t = useTranslations("CaseStudies");
  const reduceMotion = useReducedMotion();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || reduceMotion) {
    return <ShowcaseFallback t={t} />;
  }

  return <ScrollShowcaseInner t={t} />;
}
