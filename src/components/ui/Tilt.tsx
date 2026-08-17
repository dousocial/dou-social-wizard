"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TiltProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum tilt angle in degrees */
  maxTilt?: number;
  /** Scale factor on hover */
  scale?: number;
}

/**
 * 3D perspective tilt wrapper that reacts to mouse position.
 *
 * SSR-safe: uses `isClient` state so the server and the initial client render
 * both produce a plain `<div>`. After mount, the component upgrades to a
 * `motion.div` with spring-driven transforms. This prevents the
 * motion.div/div element-type hydration mismatch that occurs when the user
 * has `prefers-reduced-motion: reduce` set (useReducedMotion returns false on
 * SSR but true on client).
 */
export function Tilt({
  children,
  className,
  maxTilt = 7,
  scale = 1.015,
}: TiltProps) {
  const reduceMotion = useReducedMotion();

  // Gate to client-side: server always renders a plain div, client upgrades
  // after mount. This ensures SSR and initial client renders match exactly.
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const ref = useRef<HTMLDivElement>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springConfig = { stiffness: 280, damping: 28, mass: 0.4 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);
  const scaleSpring   = useSpring(1, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      rotateX.set(-dy * maxTilt);
      rotateY.set( dx * maxTilt);
      scaleSpring.set(scale);
    },
    [maxTilt, scale, rotateX, rotateY, scaleSpring]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    scaleSpring.set(1);
  }, [rotateX, rotateY, scaleSpring]);

  // Before client mount (or with reduced motion) → plain div, no transforms.
  // This ensures the server render always matches the initial client render.
  if (!isClient || reduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={cn("transform-gpu", className)}
      style={{
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        scale: scaleSpring,
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}
