"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LangSwitcher } from "./LangSwitcher";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";
import { scrollToTop } from "./SmoothScrollProvider";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/hizmetler", key: "services" },
  { href: "/projeler", key: "projects" },
  { href: "/hakkimizda", key: "about" },
  { href: "/blog", key: "blog" },
  { href: "/sss", key: "faq" },
  { href: "/iletisim", key: "contact" },
] as const;

const SCROLL_THRESHOLD = 24;

export function Header() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    // İlk render'da kontrol et
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-mute-100/80 bg-paper/85 shadow-sm backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <Container size="wide">
        <div className="flex h-[70px] items-center justify-between gap-6 md:h-20">

          {/* Logo */}
          <Link
            href="/"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                scrollToTop();
              }
            }}
            className="flex shrink-0 items-center text-ink transition-opacity duration-200 hover:opacity-70"
            aria-label="DOU Social — Ana sayfa"
          >
            <Logo className="h-10 w-[100px]" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex" role="navigation">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href as never}
                  onClick={(e) => {
                    if (active) {
                      e.preventDefault();
                      scrollToTop();
                    }
                  }}
                  className={cn(
                    "relative px-2 py-2 text-sm font-medium transition-colors duration-200",
                    active ? "text-ink" : "text-mute-500 hover:text-ink"
                  )}
                >
                  {t(item.key)}

                  {/* Aktif gösterge çizgisi */}
                  <AnimatePresence>
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute bottom-0.5 left-2 right-2 h-px bg-ink"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0, scaleX: 0 }}
                        transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Hover arka planı */}
                  <motion.span
                    className="absolute inset-0 rounded-md bg-mute-100"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    style={{ zIndex: -1 }}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Sağ taraf aksiyonları */}
          <div className="flex items-center gap-3">
            <LangSwitcher className="hidden sm:flex" />
            <ThemeToggle />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="hidden md:block"
            >
              <ButtonLink href="/audit" size="sm">
                {t("cta")}
              </ButtonLink>
            </motion.div>

            <MobileMenu />
          </div>
        </div>
      </Container>
    </header>
  );
}
