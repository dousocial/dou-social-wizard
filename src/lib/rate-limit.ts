/**
 * Simple in-memory rate limiter — suitable for single-instance dev/SSR.
 * For production multi-instance: swap to Vercel KV / Upstash Redis.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetIn: number; // seconds
}

interface RateLimitOptions {
  /** Max requests per window */
  max: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const bucket = buckets.get(identifier);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(identifier, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: options.max - 1, resetIn: options.windowSeconds };
  }

  if (bucket.count >= options.max) {
    return {
      ok: false,
      remaining: 0,
      resetIn: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return {
    ok: true,
    remaining: options.max - bucket.count,
    resetIn: Math.ceil((bucket.resetAt - now) / 1000),
  };
}

/**
 * Get an identifier for the current request — IP from headers fallbacks to UA hash.
 */
export async function getClientId(): Promise<string> {
  const { headers } = await import("next/headers");
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  const real = h.get("x-real-ip");
  if (real) return real;
  return h.get("user-agent") ?? "unknown";
}
