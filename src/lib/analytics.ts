const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
};

/** Queue consented events even if the remote tag has not finished loading. */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try { if (localStorage.getItem("dou_consent_v1") !== "granted") return; }
  catch { return; }
  const target = window as AnalyticsWindow;
  if (GTM_ID) {
    (target.dataLayer ??= []).push({ event: name, ...params });
  } else if (target.gtag) {
    target.gtag("event", name, params);
  } else {
    (target.dataLayer ??= []).push(["event", name, params]);
  }
  target.fbq?.("trackCustom", name, params);
}
