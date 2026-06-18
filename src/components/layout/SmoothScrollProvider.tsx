"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

let _lenis: Lenis | null = null;

export function getLenis(): Lenis | null {
  return _lenis;
}

export function scrollToTop(): void {
  if (_lenis) {
    _lenis.scrollTo(0, { duration: 0.6, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const lenis = _lenis;
    if (lenis) {
      lenis.stop();
      window.scrollTo(0, 0);
      lenis.start();
      const rafId = requestAnimationFrame(() => lenis.resize());
      return () => cancelAnimationFrame(rafId);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    history.scrollRestoration = "manual";

    const lenis = new Lenis({
      duration: 0.7,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !prefersReducedMotion,
      touchMultiplier: 1.2,
    });

    _lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      _lenis = null;
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
