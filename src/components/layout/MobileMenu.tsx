"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/Logo";
import { LangSwitcher } from "./LangSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { getLenis } from "./SmoothScrollProvider";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/hizmetler", key: "services" },
  { href: "/projeler", key: "projects" },
  { href: "/influencerlar", key: "influencers" },
  { href: "/hakkimizda", key: "about" },
  { href: "/blog", key: "blog" },
  { href: "/sss", key: "faq" },
  { href: "/iletisim", key: "contact" },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

const backdropVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2, delay: 0.05 } },
};

const panelVariants = {
  hidden: { x: "100%" },
  show: { x: 0, transition: { duration: 0.4, ease: EASE } },
  exit: {
    x: "100%",
    transition: { duration: 0.3, ease: [0.32, 0, 0.67, 0] as const },
  },
};

const navContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const navItemVariants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } },
};

const subscribeToClient = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function MobileMenu({ forceLight = false }: { forceLight?: boolean }) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeToClient,
    clientSnapshot,
    serverSnapshot
  );
  const t = useTranslations("Nav");
  const reduceMotion = useReducedMotion();

  // Lenis scroll kilidi — body.overflow çalışmaz, lenis.stop() gerekir
  useEffect(() => {
    const lenis = getLenis();
    if (open) {
      lenis?.stop();
      document.body.style.overflow = "hidden"; // Lenis olmayan tarayıcılar için
    } else {
      lenis?.start();
      document.body.style.overflow = "";
    }
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape tuşu
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      {/* ── Hamburger butonu (header içinde kalır) ────────────────────── */}
      <button
        type="button"
        aria-label={open ? t("closeMenu") : t("openMenu")}
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center transition-colors duration-300 lg:hidden",
          forceLight ? "text-white" : "text-ink"
        )}
      >
        {/* CSS bar animasyonu — SVG d-morph yerine, tarayıcı uyumlu */}
        <span className="relative flex h-5 w-5 flex-col items-center justify-center gap-[5px]">
          <span
            className={cn(
              "block h-px w-5 rounded-full bg-current transition-all duration-300",
              open ? "translate-y-[3px] rotate-45" : ""
            )}
          />
          <span
            className={cn(
              "block h-px w-5 rounded-full bg-current transition-all duration-300",
              open ? "-translate-y-[3px] -rotate-45" : ""
            )}
          />
        </span>
      </button>

      {/* ── Portal: body'ye mount — sticky header stacking context'inden çıkar ── */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                {/* Karartma */}
                <motion.div
                  key="mobile-backdrop"
                  variants={reduceMotion ? undefined : backdropVariants}
                  initial={reduceMotion ? { opacity: 0 } : "hidden"}
                  animate={reduceMotion ? { opacity: 1 } : "show"}
                  exit={reduceMotion ? { opacity: 0 } : "exit"}
                  onClick={close}
                  className="bg-ink/40 fixed inset-0 lg:hidden"
                  style={{ zIndex: 998 }}
                  aria-hidden
                />

                {/* Panel */}
                <motion.div
                  key="mobile-panel"
                  id="mobile-menu-panel"
                  role="dialog"
                  aria-modal="true"
                  aria-label={t("openMenu")}
                  variants={reduceMotion ? undefined : panelVariants}
                  initial={reduceMotion ? { x: "100%" } : "hidden"}
                  animate={reduceMotion ? { x: 0 } : "show"}
                  exit={reduceMotion ? { x: "100%" } : "exit"}
                  className="bg-paper fixed top-0 right-0 flex h-full w-[min(340px,88vw)] flex-col overflow-y-auto shadow-2xl lg:hidden"
                  style={{ zIndex: 999 }}
                >
                  {/* Panel üstü */}
                  <div className="border-mute-100 flex h-16 shrink-0 items-center justify-between border-b px-5">
                    <Link href="/" onClick={close} aria-label="DOU Social">
                      <Logo className="text-ink h-6 w-16" />
                    </Link>
                    <button
                      type="button"
                      aria-label={t("closeMenu")}
                      onClick={close}
                      className="bg-mute-100 text-ink hover:bg-mute-200 flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M4 4l8 8M4 12L12 4" />
                      </svg>
                    </button>
                  </div>

                  {/* Nav linkleri */}
                  <motion.nav
                    variants={navContainerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex flex-1 flex-col overflow-y-auto px-5 pt-4"
                  >
                    {NAV_ITEMS.map((item) => (
                      <motion.div key={item.key} variants={navItemVariants}>
                        <Link
                          href={item.href as never}
                          onClick={close}
                          className="border-mute-100 font-display text-ink hover:text-accent active:text-accent flex items-center justify-between border-b py-5 text-2xl tracking-tight transition-colors"
                        >
                          <span>{t(item.key)}</span>
                          <svg
                            viewBox="0 0 16 16"
                            className="text-mute-300 h-4 w-4 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          >
                            <path d="M3 8h10M9 4l4 4-4 4" />
                          </svg>
                        </Link>
                      </motion.div>
                    ))}

                    {/* CTA butonu */}
                    <motion.div variants={navItemVariants} className="pt-6">
                      <Link
                        href="/dijital-checkup"
                        onClick={close}
                        className="bg-accent text-paper hover:bg-accent-hover flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors"
                      >
                        {t("cta")}
                      </Link>
                    </motion.div>
                  </motion.nav>

                  {/* Alt footer */}
                  <div className="border-mute-100 flex shrink-0 items-center justify-between border-t px-5 py-5">
                    <span className="text-mute-400 text-xs">© DOU Social</span>
                    <div className="flex items-center gap-2">
                      <ThemeToggle />
                      <LangSwitcher />
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
