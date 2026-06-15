"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Modül düzeyinde Lenis erişimi ───────────────────────────────────────────
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

  // Route değişiminde en üste kaydır + Lenis/ScrollTrigger'ı yenile
  useEffect(() => {
    const lenis = _lenis;

    if (lenis) {
      lenis.stop();
      window.scrollTo(0, 0);
      lenis.start();

      // Yeni sayfanın DOM'u tamamen render olduktan sonra resize + GSAP refresh
      const rafId = requestAnimationFrame(() => {
        lenis.resize();
        ScrollTrigger.refresh();
      });
      return () => cancelAnimationFrame(rafId);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname]);

  // Lenis başlatma
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

    // Lenis scroll olaylarını GSAP ScrollTrigger'a ilet
    lenis.on("scroll", ScrollTrigger.update);

    const ticker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    // İlk yüklenmede ScrollTrigger bounds'larını hesapla
    const initRaf = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(initRaf);
      _lenis = null;
      lenis.destroy();
      gsap.ticker.remove(ticker);
    };
  }, []);

  return <>{children}</>;
}
