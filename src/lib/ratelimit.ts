/* ── Simple in-memory per-IP rate limiter ──────────────────────
 * Note: Vercel serverless functions are stateless across cold starts,
 * so this is best-effort spam protection (not bulletproof). For
 * stronger limits, integrate Upstash Redis later.
 * ───────────────────────────────────────────────────────────── */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(
  ip: string,
  opts: { max: number; windowMs: number } = { max: 3, windowMs: 60_000 },
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const b = buckets.get(ip);

  if (!b || now > b.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (b.count >= opts.max) {
    return { allowed: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }

  b.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

export function getIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}
