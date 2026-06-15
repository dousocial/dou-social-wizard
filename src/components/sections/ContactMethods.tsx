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

// ─── Data ─────────────────────────────────────────────────────────────────────

const METHODS = [
  {
    num: "01",
    key: "whatsapp",
    href: "https://wa.me/905300845468",
    line1: "+90 530",
    line2: "084 54 68",
    external: true,
  },
  {
    num: "02",
    key: "phone",
    href: "tel:+905300845468",
    line1: "+90 530",
    line2: "084 54 68",
    external: false,
  },
  {
    num: "03",
    key: "email",
    href: "mailto:info@dousocial.com",
    line1: "info@",
    line2: "dousocial.com",
    external: false,
  },
  {
    num: "04",
    key: "address",
    href: "https://maps.app.goo.gl/TJxDnehJCVooSquR7",
    line1: "Zafer Mah.",
    line2: "Merkezefendi / Denizli",
    external: true,
  },
] as const;

// ─── Icons ────────────────────────────────────────────────────────────────────

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-full w-full" aria-hidden>
      <path d="M24 4C13 4 4 13 4 24c0 3.6.97 7 2.67 9.93L4 44l10.38-2.63A19.88 19.88 0 0024 44c11 0 20-9 20-20S35 4 24 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 18.5c0-.83.67-1.5 1.5-1.5h1a1.5 1.5 0 011.41.99l1 2.7a1.5 1.5 0 01-.35 1.58l-.9.9a10.15 10.15 0 005.67 5.67l.9-.9a1.5 1.5 0 011.58-.35l2.7 1A1.5 1.5 0 0131 30v1a1.5 1.5 0 01-1.5 1.5C19.28 32.5 16 23.22 16 18.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-full w-full" aria-hidden>
      <path d="M14.5 8h5a2 2 0 012 1.67l1.5 7a2 2 0 01-1.1 2.17l-3.2 1.6a22.1 22.1 0 0010.86 10.86l1.6-3.2a2 2 0 012.17-1.1l7 1.5A2 2 0 0142 30.5V35a2 2 0 01-2 2C18.96 37 11 20.04 11 16.5v-6a2 2 0 012-2h1.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-full w-full" aria-hidden>
      <rect x="6" y="12" width="36" height="26" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M6 15l18 12 18-12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-full w-full" aria-hidden>
      <path d="M24 4C17.37 4 12 9.37 12 16c0 9 12 28 12 28s12-19 12-28c0-6.63-5.37-12-12-12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="16" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

const ICONS = {
  whatsapp: WhatsAppIcon,
  phone:    PhoneIcon,
  email:    EmailIcon,
  address:  LocationIcon,
} as const;

// ─── Light-mode token override — forces this section to always render dark
// regardless of the site's dark/light mode toggle.
const FORCE_DARK: React.CSSProperties = {
  "--color-ink":    "#000000",
  "--color-paper":  "#ffffff",
  "--color-mute-50":  "#fafafa",
  "--color-mute-100": "#f5f5f5",
  "--color-mute-200": "#e5e5e5",
  "--color-mute-300": "#d4d4d4",
  "--color-mute-400": "#a3a3a3",
  "--color-mute-500": "#737373",
  "--color-mute-600": "#525252",
  "--color-mute-700": "#404040",
  "--color-mute-800": "#262626",
  "--color-mute-900": "#171717",
} as React.CSSProperties;

// ─── Fallback (SSR + reduced motion) ─────────────────────────────────────────

function MethodsFallback({ t }: { t: ReturnType<typeof useTranslations<"Contact.methods">> }) {
  return (
    <section className="bg-ink" style={FORCE_DARK}>
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-px bg-mute-800 sm:grid-cols-2 lg:grid-cols-4">
          {METHODS.map((m) => {
            const Icon = ICONS[m.key];
            return (
              <a
                key={m.key}
                href={m.href}
                target={m.external ? "_blank" : undefined}
                rel={m.external ? "noopener noreferrer" : undefined}
                className="group flex flex-col bg-ink p-8 transition-colors hover:bg-mute-900"
              >
                <div className="mb-6 h-10 w-10 text-mute-600 transition-colors group-hover:text-accent">
                  <Icon />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mute-500">
                  {t(`${m.key}.label`)}
                </p>
                <p className="mt-3 font-display text-xl leading-snug text-paper">
                  {m.line1} {m.line2}
                </p>
                <span className="mt-auto pt-6 text-xs uppercase tracking-wider text-mute-600 transition-colors group-hover:text-paper">
                  {t(`${m.key}.cta`)} →
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Inner (client-only) ──────────────────────────────────────────────────────
// Split from outer so useScroll runs only after hydration — ref is always live.

type TMethod = ReturnType<typeof useTranslations<"Contact.methods">>;

function ContactMethodsInner({ t, eyebrow }: { t: TMethod; eyebrow: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef({ start: 0, end: 1 });
  const [activeIndex, setActiveIndex] = useState(0);

  // Measure container document bounds after first paint + on resize
  useEffect(() => {
    const measure = () => {
      const el = containerRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      boundsRef.current = { start: top, end: top + el.offsetHeight - window.innerHeight };
    };
    const id = requestAnimationFrame(measure);
    window.addEventListener("resize", measure, { passive: true });
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", measure); };
  }, []);

  // useScroll() without target — tracks window, compatible with Lenis
  const { scrollY } = useScroll();

  const progress = useTransform(scrollY, (v) => {
    const { start, end } = boundsRef.current;
    if (end <= start) return 0;
    return Math.max(0, Math.min(1, (v - start) / (end - start)));
  });

  // Progress bar scale: 0→1 as scroll covers all 4 methods
  const progressBarScale = useTransform(progress, [0, 1], [0, 1]);

  // Horizontal track with 4 slides
  // Each slide: ~22% hold, ~6% transition to next
  const x = useTransform(
    progress,
    [0, 0.16, 0.25, 0.41, 0.50, 0.66, 0.75, 1],
    ["0%", "0%", "-25%", "-25%", "-50%", "-50%", "-75%", "-75%"]
  );

  useMotionValueEvent(progress, "change", (v) => {
    setActiveIndex(v < 0.25 ? 0 : v < 0.50 ? 1 : v < 0.75 ? 2 : 3);
  });

  return (
    <div ref={containerRef} className="h-[380vh]" style={FORCE_DARK}>
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden bg-ink">

        {/* ── Top bar ── */}
        <div className="mx-auto w-full max-w-[1280px] flex-none px-6 pt-10 md:px-10 md:pt-12">
          <div className="flex items-center justify-between pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mute-600">
              {eyebrow}
            </p>

            {/* Animated progress bar — desktop only */}
            <div className="relative hidden h-px w-48 overflow-hidden bg-mute-800 md:block">
              <motion.div
                suppressHydrationWarning
                className="absolute inset-y-0 left-0 bg-mute-500 origin-left"
                style={{ scaleX: progressBarScale, width: "100%" }}
              />
            </div>

            {/* Slide counter */}
            <p className="font-display text-xs tracking-widest text-mute-600">
              0{activeIndex + 1}
              <span className="text-mute-800"> / 04</span>
            </p>
          </div>
          <div className="h-px bg-mute-800" />
        </div>

        {/* ── Slide track ── */}
        <div className="flex-1 overflow-hidden">
          <motion.div
            suppressHydrationWarning
            className="flex h-full"
            style={{ x, width: "400%" }}
          >
            {METHODS.map((method) => {
              const Icon = ICONS[method.key];
              return (
                <div
                  key={method.key}
                  className="flex h-full w-1/4 flex-col justify-between px-6 py-8 md:px-10 md:py-10"
                >
                  {/* Method number + icon */}
                  <div className="flex items-start justify-between">
                    <span className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-mute-700">
                      {method.num}
                    </span>
                    <div className="h-10 w-10 text-mute-700 md:h-12 md:w-12">
                      <Icon />
                    </div>
                  </div>

                  {/* Main contact info */}
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                      {t(`${method.key}.label`)}
                    </p>
                    <div
                      className="mt-5 font-display font-bold leading-[0.95] tracking-tight"
                      style={{ fontSize: "clamp(2.6rem, 7.5vw, 7rem)" }}
                    >
                      <div className="text-paper">{method.line1}</div>
                      <div className="text-mute-500">{method.line2}</div>
                    </div>
                  </div>

                  {/* CTA */}
                  <a
                    href={method.href}
                    target={method.external ? "_blank" : undefined}
                    rel={method.external ? "noopener noreferrer" : undefined}
                    className="group inline-flex items-center gap-4 self-start"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-mute-700 text-mute-600 transition-all duration-300 group-hover:border-paper group-hover:bg-paper group-hover:text-ink">
                      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-base font-medium text-mute-500 transition-colors duration-200 group-hover:text-paper">
                      {t(`${method.key}.cta`)}
                    </span>
                  </a>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* ── Progress dots ── */}
        <div className="flex-none pb-8">
          <div className="flex items-center justify-center gap-2">
            {METHODS.map((_, i) => (
              <motion.div
                key={i}
                suppressHydrationWarning
                className="rounded-full"
                animate={{
                  width:           activeIndex === i ? 28 : 6,
                  height:          6,
                  backgroundColor: activeIndex === i ? "rgb(160 53 53)" : "rgb(64 64 64)",
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

export function ContactMethods() {
  const t = useTranslations("Contact.methods");
  const tContact = useTranslations("Contact");
  const reduceMotion = useReducedMotion();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  if (!isClient || reduceMotion) {
    return <MethodsFallback t={t} />;
  }

  return <ContactMethodsInner t={t} eyebrow={tContact("eyebrow")} />;
}
