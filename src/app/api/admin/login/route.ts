import { NextResponse } from 'next/server';
import { setSessionCookie, safeEqual } from '@/lib/session';
import { rateLimit, getIp } from '@/lib/ratelimit';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  /* ── Brute-force protection: 5 attempts / 5 min / IP ─── */
  const ip = getIp(req);
  const rl = rateLimit(`login:${ip}`, { max: 5, windowMs: 5 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: 'محاولات كثيرة. حاول بعد دقائق.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    );
  }

  let body: { password?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 }); }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    console.error('[admin/login] ADMIN_PASSWORD not configured');
    return NextResponse.json({ ok: false, error: 'لم يتم إعداد كلمة السر.' }, { status: 500 });
  }

  const provided = String(body.password ?? '');
  if (!provided || !safeEqual(provided, expected)) {
    return NextResponse.json({ ok: false, error: 'كلمة السر غير صحيحة.' }, { status: 401 });
  }

  await setSessionCookie();
  return NextResponse.json({ ok: true });
}
