import { NextResponse } from 'next/server';
import { getPilgrim, isValidNationalId } from '@/lib/pilgrims';
import { rateLimit, getIp } from '@/lib/ratelimit';
import { DUAA_ENABLED } from '@/lib/features';

export const runtime = 'nodejs';

/* POST /api/duaa/identify
 * Verifies a national ID against the pilgrim list and returns the hajj year
 * if valid. Used by the prayer wall to grant a pilgrim badge persistently. */
export async function POST(req: Request) {
  if (!DUAA_ENABLED) return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 404 });
  const ip = getIp(req);
  const rl = rateLimit(`duaa-identify:${ip}`, { max: 8, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, error: 'محاولات كثيرة. حاول بعد دقيقة.' }, { status: 429 });
  }

  let body: { nationalId?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 }); }

  const nationalId = String(body.nationalId ?? '').replace(/\D/g, '');
  if (!isValidNationalId(nationalId)) {
    return NextResponse.json({ ok: false, error: 'يجب إدخال رقم هوية صحيح (10 أرقام).' }, { status: 400 });
  }

  const p = await getPilgrim(nationalId);
  if (!p || p.revokedAt) {
    return NextResponse.json({ ok: false, error: 'لم نجدك في قائمة الحجاج. تأكد من الرقم أو تواصل معنا.' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    hajjYear:   p.hajjYear,
    nameMasked: p.name.split(/\s+/).slice(0, 2).join(' '),   // first two parts of name only
  });
}
