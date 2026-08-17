"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { getLenis } from "@/components/layout/SmoothScrollProvider";

export function KVKKConsentField() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const t = useTranslations("KVKK");
  const tForm = useTranslations("Contact.form");

  const open = () => {
    dialogRef.current?.showModal();
    getLenis()?.stop();
  };
  const close = () => {
    dialogRef.current?.close();
    getLenis()?.start();
  };

  const handleWheel = (e: React.WheelEvent<HTMLDialogElement>) => {
    if (dialogRef.current) {
      dialogRef.current.scrollTop += e.deltaY;
    }
  };

  const sections = t.raw("sections") as Array<{ heading: string; body: string }>;

  return (
    <>
      {/* ── Checkbox + label ─────────────────────────────────────────────────── */}
      <label className="flex cursor-pointer items-start gap-3 text-sm text-mute-700">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-accent"
        />
        <span className="leading-relaxed">
          {tForm("consentPrefix")}{" "}
          <button
            type="button"
            onClick={open}
            className="font-medium text-accent underline underline-offset-2 transition-colors hover:text-accent/70"
          >
            {tForm("consentLinkText")}
          </button>{" "}
          {tForm("consentSuffix")}
        </span>
      </label>

      {/* ── Modal ────────────────────────────────────────────────────────────── */}
      <dialog
        ref={dialogRef}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto w-full max-w-2xl rounded-2xl bg-paper p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
        style={{ maxHeight: "85dvh", overflowY: "auto", overscrollBehavior: "contain" }}
        onWheel={handleWheel}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-mute-100 bg-paper px-8 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {t("eyebrow")}
            </p>
            <h2 className="mt-1 font-display text-xl font-bold leading-tight tracking-tight text-ink">
              {t("title")}
            </h2>
            <p className="mt-0.5 text-xs text-mute-400">{t("lastUpdated")}</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Kapat"
            className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-mute-400 transition-colors hover:bg-mute-100 hover:text-ink"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 text-sm leading-relaxed text-mute-700">
          <div className="space-y-5">
            {sections.map((sec, i) => (
              <div key={i}>
                {sec.heading && (
                  <h3 className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-ink">
                    {sec.heading}
                  </h3>
                )}
                <p className="whitespace-pre-line text-mute-600">{sec.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between border-t border-mute-100 bg-paper px-8 py-4">
          <a
            href="mailto:info@dousocial.com"
            className="text-xs text-mute-400 underline underline-offset-2 hover:text-accent"
          >
            info@dousocial.com
          </a>
          <button
            type="button"
            onClick={close}
            className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-mute-800"
          >
            {t("close")}
          </button>
        </div>
      </dialog>
    </>
  );
}
