"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface NoiseProps {
  /** Opacity of the noise layer (0–1) */
  opacity?: number;
  className?: string;
}

/**
 * SVG fractal noise texture overlay.
 * Add as a direct child of a `relative` positioned container.
 *
 * Uses `useId()` to ensure unique filter IDs when multiple instances
 * are rendered on the same page — avoids SVG filter ID collisions.
 *
 * Performance: static SVG rendered once, no JS animation.
 */
export function Noise({ opacity = 0.04, className }: NoiseProps) {
  const id = useId();
  // Strip colons — SVG id cannot contain ":"
  const filterId = `noise-${id.replace(/:/g, "")}`;

  return (
    <svg
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <filter
          id={filterId}
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="linearRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="saturate"
            values="0"
          />
        </filter>
      </defs>
      <rect
        width="100%"
        height="100%"
        filter={`url(#${filterId})`}
        opacity={opacity}
      />
    </svg>
  );
}
