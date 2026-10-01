/** Static public pages retain caching; admin pages use a per-request script nonce. */
export function contentSecurityPolicy(nonce?: string) {
  const scripts = nonce
    ? `'self' 'nonce-${nonce}' 'strict-dynamic'`
    : "'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google.com https://www.gstatic.com https://connect.facebook.net";
  return [
    "default-src 'self'",
    `script-src ${scripts}${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    "connect-src 'self' https://*.supabase.co https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://www.google.com https://www.facebook.com https://*.facebook.net",
    "frame-src https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}
