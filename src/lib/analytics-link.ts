/** Classify public clicks without transmitting contact values or URL queries. */
export function classifyAnalyticsLink(href: string, origin: string) {
  if (href.startsWith("tel:"))
    return { name: "contact_click", params: { contact_type: "phone" } };
  if (href.startsWith("mailto:"))
    return { name: "contact_click", params: { contact_type: "email" } };
  let url: URL;
  try {
    url = new URL(href, origin);
  } catch {
    return null;
  }
  if (!["https:", "http:"].includes(url.protocol)) return null;
  if (
    url.hostname === "wa.me" ||
    url.hostname === "api.whatsapp.com" ||
    url.hostname === "www.whatsapp.com"
  ) {
    return { name: "contact_click", params: { contact_type: "whatsapp" } };
  }
  if (url.origin !== origin)
    return {
      name: "outbound_link_click",
      params: { link_domain: url.hostname },
    };
  const path = url.pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  if (["/teklif-al", "/dijital-checkup", "/iletisim"].includes(path)) {
    return { name: "cta_click", params: { destination: path } };
  }
  return null;
}
