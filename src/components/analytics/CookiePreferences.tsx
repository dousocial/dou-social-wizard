"use client";
import { useLocale } from "next-intl";
export function CookiePreferences() {
  const en = useLocale() === "en";
  return (
    <button
      type="button"
      className="hover:text-ink text-left transition"
      onClick={() => window.dispatchEvent(new Event("dou:consent-preferences"))}
    >
      {en ? "Cookie preferences" : "Çerez tercihleri"}
    </button>
  );
}
