"use client";

import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
  /** Hedef sayı */
  to: number;
  /** Animasyon süresi (ms) */
  duration?: number;
  /** Ondalık basamak sayısı */
  decimals?: number;
  /** Viewport'a girince başlat */
  triggerOnView?: boolean;
}

/**
 * useCountUp
 *
 * Sayı sayacı hook'u. IntersectionObserver ile viewport'a girince başlar.
 * easeOutExpo eğrisi — son değere yaklaştıkça yavaşlar.
 */
export function useCountUp({
  to,
  duration = 1800,
  decimals = 0,
  triggerOnView = true,
}: UseCountUpOptions) {
  const [value, setValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(!triggerOnView);
  const ref = useRef<HTMLElement>(null);
  const rafRef = useRef<number>(0);

  // IntersectionObserver ile tetikleme
  useEffect(() => {
    if (!triggerOnView) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [triggerOnView]);

  // Sayaç animasyonu
  useEffect(() => {
    if (!hasStarted) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setValue(to);
      return;
    }

    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo
      const eased =
        progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setValue(parseFloat((eased * to).toFixed(decimals)));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [hasStarted, to, duration, decimals]);

  return { value, ref };
}
