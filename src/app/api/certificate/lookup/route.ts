import { NextResponse } from 'next/server';
import { getPilgrim, isValidNationalId, markViewed } from '@/lib/pilgrims';
import { rateLimit, getIp } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = getIp(req);
  const rl = rateLimit(`cert-lookup:${ip}`, { max: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: 'محاولات كثيرة. حاول بعد دقيقة.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    );
  }

  let body: { nationalId?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 }); }

  const nationalId = String(body.nationalId ?? '').replace(/\D/g, '');

  if (!isValidNationalId(nationalId)) {
    return NextResponse.json(
      { ok: false, error: 'يجب إدخال رقم هوية صحيح (10 أرقام).' },
      { status: 400 },
    );
  }

  const p = await getPilgrim(nationalId);
  if (!p) {
    return NextResponse.json(
      { ok: false, notFound: true, error: 'لم نجد رقم الهوية في قائمة الحجاج.' },
      { status: 404 },
    );
  }

  if (p.revokedAt) {
    return NextResponse.json(
      { ok: false, revoked: true, error: 'هذه الشهادة ملغاة.', reason: p.revokeReason ?? '' },
      { status: 410 },
    );
  }

  // Track view (fire-and-forget)
  markViewed(nationalId).catch(() => {});

  return NextResponse.json({
    ok: true,
    pilgrim: {
      name:       p.name,
      hajjYear:   p.hajjYear,
      country:    p.country,
      verifyCode: p.verifyCode,
    },
  });
}
