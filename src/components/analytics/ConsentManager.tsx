"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Analytics } from "./Analytics";
import { cn } from "@/lib/utils";

const CONSENT_KEY = "dou_consent_v1";
type ConsentValue = "granted" | "denied" | "unknown";

export function ConsentManager() {
  const [consent, setConsent] = useState<ConsentValue>("unknown");
  const [hydrated, setHydrated] = useState(false);
  const t = useTranslations("Consent");

  useEffect(() => {
    setHydrated(true);
    const stored = localStorage.getItem(CONSENT_KEY) as ConsentValue | null;
    if (stored === "granted" || stored === "denied") {
      setConsent(stored);
    }
  }, []);

  const handleConsent = (value: "granted" | "denied") => {
    localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
  };

  if (!hydrated) return null;

  return (
    <>
      {consent === "granted" && <Analytics />}

      {consent === "unknown" && (
        <div
          role="dialog"
          aria-labelledby="consent-title"
          aria-describedby="consent-body"
          className={cn(
            "fixed bottom-4 left-4 right-4 z-50 max-w-2xl rounded-2xl border border-mute-200 bg-paper p-6 shadow-2xl",
            "md:left-auto md:right-6 md:bottom-6 md:p-8"
          )}
        >
          <h3
            id="consent-title"
            className="font-display text-lg tracking-tight text-ink"
          >
            {t("title")}
          </h3>
          <p id="consent-body" className="mt-2 text-sm text-mute-600">
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
              className="rounded-full border border-mute-300 px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-mute-100"
            >
              {t("reject")}
            </button>
            <button
              onClick={() => handleConsent("granted")}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-accent-hover"
            >
              {t("accept")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
