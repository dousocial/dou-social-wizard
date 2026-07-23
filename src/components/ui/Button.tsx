"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-paper hover:bg-accent-hover focus-visible:outline-accent",
  secondary:
    "border border-mute-400 text-ink hover:bg-ink hover:text-paper hover:border-ink focus-visible:outline-ink",
  ghost: "text-ink hover:bg-mute-100 focus-visible:outline-ink",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-5 text-sm",
  md: "h-12 px-8 text-sm",
  lg: "h-14 px-10 text-base",
};

const baseClasses =
  "relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";

// ─── Shimmer overlay — sadece primary varyant için ───────────────────────────
function Shimmer() {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-full"
      style={{
        background:
          "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%)",
        backgroundSize: "200% 100%",
      }}
      initial={{ backgroundPosition: "200% 0" }}
      whileHover={{
        backgroundPosition: "-200% 0",
        transition: { duration: 0.6, ease: "easeInOut" },
      }}
    />
  );
}

// ─── Button ──────────────────────────────────────────────────────────────────

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonBaseProps {}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.1 }}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {variant === "primary" && <Shimmer />}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

// ─── ButtonLink ──────────────────────────────────────────────────────────────

interface ButtonLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    ButtonBaseProps {}

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  children,
  href,
  ...props
}: ButtonLinkProps) {
  return (
    <motion.a
      href={href}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.1 }}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...(props as React.ComponentProps<typeof motion.a>)}
    >
      {variant === "primary" && <Shimmer />}
      <span className="relative z-10">{children}</span>
    </motion.a>
  );
}
