"use client";

import { useEffect } from "react";

/** Keep keyboard focus in a visible modal and return it to the opening control. */
export function useModalFocus(open: boolean, id: string) {
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    let dialog: HTMLElement | null = null;
    const focusable = () => dialog ? Array.from(dialog.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
    )).filter(element => element.getClientRects().length > 0 && !element.closest('[inert]')) : [];
    const frame = requestAnimationFrame(() => {
      dialog = document.getElementById(id);
      if (dialog) {
        dialog.tabIndex = -1;
        (focusable()[0] ?? dialog).focus({ preventScroll: true });
      }
    });
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !dialog) return;
      const controls = focusable();
      const first = controls[0], last = controls[controls.length - 1];
      if (!first) { event.preventDefault(); dialog.focus(); return; }
      if (!dialog.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) {
        event.preventDefault(); (event.shiftKey ? last : first).focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open, id]);
}
