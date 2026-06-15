"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface UseGsapRevealOptions {
  /** GSAP from() değerleri */
  from?: gsap.TweenVars;
  /** GSAP to() değerleri (animasyon hedefi) */
  to?: gsap.TweenVars;
  /** ScrollTrigger başlangıç pozisyonu */
  start?: string;
  /** ScrollTrigger bitiş pozisyonu */
  end?: string;
  /** scrub modu — scroll ile senkronize */
  scrub?: boolean | number;
  /** markers — geliştirme için */
  markers?: boolean;
  /** Pin — scroll sırasında sabit tut */
  pin?: boolean;
  /** toggle class */
  toggleClass?: string;
}

/**
 * useGsapReveal
 *
 * GSAP ScrollTrigger animasyonları için yeniden kullanılabilir hook.
 * Lenis + GSAP ScrollTrigger kombinasyonuyla çalışır.
 *
 * @example
 * const ref = useGsapReveal<HTMLDivElement>({
 *   from: { opacity: 0, y: 60 },
 *   to: { opacity: 1, y: 0, duration: 1 },
 * });
 * return <div ref={ref}>...</div>;
 */
export function useGsapReveal<T extends HTMLElement = HTMLDivElement>({
  from = { opacity: 0, y: 50 },
  to = { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
  start = "top 85%",
  end = "bottom top",
  scrub = false,
  markers = false,
  pin = false,
  toggleClass,
}: UseGsapRevealOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(el, from, {
        ...to,
        scrollTrigger: {
          trigger: el,
          start,
          end,
          scrub,
          markers,
          pin,
          toggleClass,
          once: !scrub,
        },
      });
    });

    return () => ctx.revert();
  }, [from, to, start, end, scrub, markers, pin, toggleClass]);

  return ref;
}
