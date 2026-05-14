import { NextResponse } from 'next/server';
import { getDuaa, hasReacted } from '@/lib/duaa';
import { getIp } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* GET /api/duaa/[id] — fetch a single duaa (used by the permalink page) */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const duaa = await getDuaa(params.id);
  if (!duaa || duaa.hidden) {
    return NextResponse.json({ ok: false, error: 'الدعاء غير موجود.' }, { status: 404 });
  }
  const reacted = await hasReacted(params.id, getIp(req));
  const { ip: _ip, ...safe } = duaa;
  return NextResponse.json({ ok: true, duaa: { ...safe, reactedByMe: reacted } });
}
