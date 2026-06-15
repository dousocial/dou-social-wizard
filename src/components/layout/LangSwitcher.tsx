"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LangSwitcher({ className, forceLight }: { className?: string; forceLight?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-xs font-medium uppercase tracking-wider",
        className
      )}
    >
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className={forceLight ? "text-white/30" : "text-mute-300"}>/</span>}
          <button
            onClick={() => router.replace(pathname, { locale: l })}
            className={cn(
              "transition hover:text-accent",
              forceLight
                ? (l === locale ? "text-white" : "text-white/50")
                : (l === locale ? "text-ink" : "text-mute-400")
            )}
            aria-label={`Switch to ${l.toUpperCase()}`}
          >
            {l.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
