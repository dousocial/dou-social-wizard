"use client";

import { useRef, useEffect } from "react";

interface UseGsapRevealOptions {
  from?: Record<string, unknown>;
  to?: Record<string, unknown>;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
  pin?: boolean;
  toggleClass?: string;
}

/** @deprecated Use Framer Motion's Reveal component instead. */
export function useGsapReveal<T extends HTMLElement = HTMLDivElement>(
  _options: UseGsapRevealOptions = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "1";
    el.style.transform = "none";
  }, []);

  return ref;
}
