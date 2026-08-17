import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  ariaLabel?: string;
}

/**
 * DOU logo via CSS mask — inherits text color via `bg-current`.
 * Use `text-ink` for black, `text-paper` for white.
 */
export function Logo({ className, ariaLabel = "DOU Social" }: LogoProps) {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn(
        "bg-current",
        "[mask:url(/brand/dou-logo.svg)_center/contain_no-repeat]",
        "[-webkit-mask:url(/brand/dou-logo.svg)_center/contain_no-repeat]",
        className
      )}
    />
  );
}
