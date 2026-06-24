"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ICON_VARIANTS = {
  initial: { opacity: 0, scale: 0.6, rotate: -30 },
  animate: { opacity: 1, scale: 1, rotate: 0 },
  exit:    { opacity: 0, scale: 0.6, rotate: 30 },
};

const TRANSITION = { duration: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" aria-hidden>
      <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M10 2v1.5M10 16.5V18M18 10h-1.5M3.5 10H2M15.66 4.34l-1.06 1.06M5.4 14.6l-1.06 1.06M15.66 15.66l-1.06-1.06M5.4 5.4L4.34 4.34"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
      />
    </svg>
  );
}

export function ThemeToggle({
  className,
  forceLight,
  onThemeChange,
}: {
  className?: string;
  forceLight?: boolean;
  onThemeChange?: (isDark: boolean) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    onThemeChange?.(next);
    const value = next ? "dark" : "light";
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", value);
    // Cookie lets the server component know the theme on locale-switch navigation,
    // preventing React reconciliation from stripping the "dark" class.
    document.cookie = `theme=${value};path=/;max-age=31536000;SameSite=Lax`;
  };

  // Render a same-size placeholder until mounted to prevent layout shift
  if (!mounted) {
    return <div className="h-8 w-8" />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Açık moda geç" : "Koyu moda geç"}
      className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200 ${forceLight ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-mute-500 hover:bg-mute-100 hover:text-ink"} ${className ?? ""}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            variants={ICON_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={TRANSITION}
            className="absolute"
          >
            <SunIcon />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            variants={ICON_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={TRANSITION}
            className="absolute"
          >
            <MoonIcon />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
