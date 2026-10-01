"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Analytics } from "./Analytics";
import { cn } from "@/lib/utils";

const CONSENT_KEY = "dou_consent_v1";
type ConsentValue = "granted" | "denied" | "unknown";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("dou:consent-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("dou:consent-change", callback);
  };
}
function getConsent(): ConsentValue {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : "unknown";
  } catch {
    return "unknown";
  }
}
const subscribeHydration = () => () => {};
export function ConsentManager() {
  const consent = useSyncExternalStore(
    subscribe,
    getConsent,
    () => "unknown" as ConsentValue
  );
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false
  );
  const [open, setOpen] = useState(false);
  const t = useTranslations("Consent");
  useEffect(() => {
    const reopen = () => setOpen(true);
    window.addEventListener("dou:consent-preferences", reopen);
    return () => window.removeEventListener("dou:consent-preferences", reopen);
  }, []);

  const handleConsent = (value: "granted" | "denied") => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      return;
    }
    window.dispatchEvent(new Event("dou:consent-change"));
    setOpen(false);
    const analyticsWindow = window as unknown as {
      gtag?: (...args: unknown[]) => void;
      fbq?: (...args: unknown[]) => void;
    };
    analyticsWindow.gtag?.("consent", "update", {
      analytics_storage: value,
      ad_storage: value,
      ad_user_data: value,
      ad_personalization: value,
    });
    analyticsWindow.fbq?.("consent", value === "granted" ? "grant" : "revoke");
    if (value === "denied") {
      const domains = [
        "",
        location.hostname,
        `.${location.hostname}`,
        ".dousocial.com",
      ];
      for (const cookie of document.cookie.split(";")) {
        const name = cookie.split("=")[0].trim();
        if (/^(_ga|_gid|_gat|_gcl|_fbp|_fbc)/.test(name))
          for (const domain of domains)
            document.cookie = `${name}=; Max-Age=0; path=/;${domain ? ` domain=${domain};` : ""}`;
      }
    }
  };

  if (!hydrated) return null;

  return (
    <>
      {consent === "granted" && <Analytics />}

      {(consent === "unknown" || open) && (
        <div
          role="dialog"
          aria-labelledby="consent-title"
          aria-describedby="consent-body"
          className={cn(
            "border-mute-200 bg-paper fixed right-4 bottom-4 left-4 z-50 max-w-2xl rounded-2xl border p-6 shadow-2xl",
            "md:right-6 md:bottom-6 md:left-auto md:p-8"
          )}
        >
          <h3
            id="consent-title"
            className="font-display text-ink text-lg tracking-tight"
          >
            {t("title")}
          </h3>
          <p id="consent-body" className="text-mute-600 mt-2 text-sm">
            {t("body")}{" "}
            <Link
              href="/cerez-politikasi"
              className="text-accent underline-offset-4 hover:underline"
            >
              {t("policyLink")}
            </Link>
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              onClick={() => handleConsent("denied")}
              className="border-mute-300 text-ink hover:bg-mute-100 rounded-full border px-5 py-2.5 text-sm font-medium transition"
            >
              {t("reject")}
            </button>
            <button
              onClick={() => handleConsent("granted")}
              className="bg-accent text-paper hover:bg-accent-hover rounded-full px-5 py-2.5 text-sm font-medium transition"
            >
              {t("accept")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
