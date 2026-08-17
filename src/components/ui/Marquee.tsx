"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  items: React.ReactNode[];
  direction?: "left" | "right";
  speed?: number;
  gapClass?: string;
  className?: string;
  itemClassName?: string;
  pauseOnHover?: boolean;
}

export function Marquee({
  items,
  direction = "left",
  speed = 30,
  gapClass = "gap-10",
  className,
  itemClassName,
  pauseOnHover = true,
}: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const doubled = [...items, ...items];
  const keyframe = direction === "left" ? "marquee-left" : "marquee-right";

  return (
    <div
        className={cn("overflow-hidden", className)}
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <div
          ref={trackRef}
          className={cn("flex w-max items-center dou-marquee-track", gapClass)}
          style={{
            "--dou-speed": `${speed}s`,
            animation: `${keyframe} ${speed}s linear infinite`,
          } as React.CSSProperties}
          onMouseEnter={() => {
            if (pauseOnHover && trackRef.current)
              trackRef.current.style.animationPlayState = "paused";
          }}
          onMouseLeave={() => {
            if (pauseOnHover && trackRef.current)
              trackRef.current.style.animationPlayState = "running";
          }}
          aria-hidden
        >
          {doubled.map((item, i) => (
            <div key={i} className={cn("shrink-0", itemClassName)}>
              {item}
            </div>
          ))}
        </div>
      </div>
  );
}
