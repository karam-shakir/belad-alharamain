import { NextResponse } from 'next/server';
import { rateLimit, getIp } from '@/lib/ratelimit';
import { reactToDuaa } from '@/lib/duaa';
import { DUAA_ENABLED } from '@/lib/features';

export const runtime = 'nodejs';

/* POST /api/duaa/[id]/react — register a "ادعُ له" tap for this duaa.
 * Body: { nationalId?: string }  — optional, for pilgrim badge tagging.
 * Idempotent per IP (one count per IP per duaa, valid 30 days). */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!DUAA_ENABLED) return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 404 });
  const ip = getIp(req);
  const rl = rateLimit(`duaa-react:${ip}`, { max: 60, windowMs: 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, error: 'تباطأ قليلاً.' }, { status: 429 });
  }

  let body: { nationalId?: string } = {};
  try { body = await req.json(); }
  catch { /* allow empty body */ }

  const nationalId = body.nationalId
    ? String(body.nationalId).replace(/\D/g, '').slice(0, 10) || undefined
    : undefined;

  const result = await reactToDuaa(params.id, ip, nationalId);
  if (!result.ok) {
    if (result.reason === 'not_found') {
      return NextResponse.json({ ok: false, error: 'الدعاء غير موجود.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, alreadyReacted: true });
  }

  return NextResponse.json({ ok: true, ...result.result });
}
