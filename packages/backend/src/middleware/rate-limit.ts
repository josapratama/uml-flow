import type { MiddlewareHandler } from "hono";

/**
 * Tiny in-memory fixed-window rate limiter keyed by client IP.
 * Good enough for a single-instance deployment behind a reverse proxy.
 */
export function rateLimit(opts: {
  windowMs: number;
  max: number;
}): MiddlewareHandler {
  const hits = new Map<string, { count: number; resetAt: number }>();

  // Drop expired buckets so the map cannot grow without bound
  setInterval(() => {
    const now = Date.now();
    for (const [key, v] of hits) if (v.resetAt <= now) hits.delete(key);
  }, opts.windowMs).unref?.();

  return async (c, next) => {
    const fwd = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
    const key = fwd || c.req.header("x-real-ip") || "local";
    const now = Date.now();
    let bucket = hits.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + opts.windowMs };
      hits.set(key, bucket);
    }
    bucket.count++;
    c.header("X-RateLimit-Limit", String(opts.max));
    c.header("X-RateLimit-Remaining", String(Math.max(0, opts.max - bucket.count)));
    if (bucket.count > opts.max) {
      c.header("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));
      return c.json({ error: "Too many requests, please slow down" }, 429);
    }
    await next();
  };
}

