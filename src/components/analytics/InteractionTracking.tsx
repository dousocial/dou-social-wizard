"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { classifyAnalyticsLink } from "@/lib/analytics-link";
import { trackEvent } from "@/lib/analytics";

/** Mounted only after analytics consent; no form input or URL query is collected. */
export function InteractionTracking() {
  const pathname = usePathname();
  useEffect(() => {
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest("a[href]");
      const href = link?.getAttribute("href");
      if (!href) return;
      const result = classifyAnalyticsLink(href, location.origin);
      if (result)
        trackEvent(result.name, { ...result.params, page_path: pathname });
    };
    const seen = new Set<number>();
    let frame = 0;
    const scroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const height = document.documentElement.scrollHeight - innerHeight;
        if (height < innerHeight) return;
        const percent = (scrollY / height) * 100;
        for (const depth of [25, 50, 75, 90]) {
          if (percent >= depth && !seen.has(depth)) {
            seen.add(depth);
            trackEvent("content_scroll", {
              percent_scrolled: depth,
              page_path: pathname,
            });
          }
        }
      });
    };
    document.addEventListener("click", click);
    window.addEventListener("scroll", scroll, { passive: true });
    if (document.querySelector('[data-page-type="not-found"]')) {
      trackEvent("page_not_found", { page_path: pathname });
    }
    return () => {
      document.removeEventListener("click", click);
      window.removeEventListener("scroll", scroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);
  return null;
}
