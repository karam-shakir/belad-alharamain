import { NextResponse } from 'next/server';
import { rateLimit, getIp } from '@/lib/ratelimit';
import { reactToDuaa } from '@/lib/duaa';

export const runtime = 'nodejs';

/* POST /api/duaa/[id]/react — register a "ادعُ لي" tap for this duaa.
 * Idempotent per IP. Each IP can only count once per duaa (per 30 days). */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ip = getIp(req);
  const rl = rateLimit(`duaa-react:${ip}`, { max: 60, windowMs: 60 * 1000 });   // 60/min — generous
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, error: 'تباطأ قليلاً.' }, { status: 429 });
  }

  const result = await reactToDuaa(params.id, ip);
  if (!result.ok) {
    if (result.reason === 'not_found') {
      return NextResponse.json({ ok: false, error: 'الدعاء غير موجود.' }, { status: 404 });
    }
    // 'already' — return current state without error so UI feels graceful
    return NextResponse.json({ ok: true, alreadyReacted: true });
  }

  return NextResponse.json({ ok: true, count: result.count });
}
