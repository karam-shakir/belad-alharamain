import { NextResponse } from 'next/server';
import { rateLimit, getIp } from '@/lib/ratelimit';
import {
  createDuaa,
  listDuaa,
  getReactedSet,
  MAX_MESSAGE_LEN,
  MAX_NAME_LEN,
  MAX_COUNTRY_LEN,
  type DuaaSort,
} from '@/lib/duaa';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* ── GET: list duaas ─── */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sort   = (searchParams.get('sort') === 'popular' ? 'popular' : 'latest') as DuaaSort;
  const limit  = Math.min(Math.max(Number(searchParams.get('limit')  ?? '30'), 1), 100);
  const offset = Math.max(Number(searchParams.get('offset') ?? '0'), 0);

  try {
    const items = await listDuaa({ sort, limit, offset });
    // Determine which the requester has already reacted to (for "ادعُ لي" toggle state)
    const ip   = getIp(req);
    const reacted = await getReactedSet(items.map(i => i.id), ip);
    // Strip IP from response (privacy)
    const safe = items.map(({ ip: _ip, ...rest }) => ({
      ...rest,
      reactedByMe: reacted.has(rest.id),
    }));
    return NextResponse.json({ ok: true, items: safe });
  } catch (e) {
    console.error('[duaa] list error', e);
    return NextResponse.json({ ok: false, error: 'تعذّر قراءة الدعوات.' }, { status: 500 });
  }
}

/* ── POST: submit a new duaa ─── */
export async function POST(req: Request) {
  const ip = getIp(req);
  const rl = rateLimit(`duaa:${ip}`, { max: 3, windowMs: 60 * 60 * 1000 });   // 3/hour
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: 'لقد أرسلت عدّة دعوات. حاول بعد ساعة.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    );
  }

  let body: { name?: string; country?: string; message?: string; nationalId?: string; hp?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 }); }

  // Honeypot — silent success for bots
  if ((body.hp ?? '').trim() !== '') {
    return NextResponse.json({ ok: true, silent: true });
  }

  const message    = String(body.message    ?? '').trim();
  const name       = String(body.name       ?? '').trim().slice(0, MAX_NAME_LEN);
  const country    = String(body.country    ?? '').trim().slice(0, MAX_COUNTRY_LEN);
  const nationalId = body.nationalId ? String(body.nationalId).replace(/\D/g, '').slice(0, 10) : undefined;

  if (!message) {
    return NextResponse.json({ ok: false, error: 'الدعاء مطلوب.' }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LEN) {
    return NextResponse.json({ ok: false, error: `حد أقصى ${MAX_MESSAGE_LEN} حرف.` }, { status: 400 });
  }

  try {
    const duaa = await createDuaa({ name, country, message, nationalId, ip });
    // Strip private fields before returning
    const { ip: _ip, ...safe } = duaa;
    return NextResponse.json({ ok: true, duaa: safe });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'تعذّر إرسال الدعاء.' },
      { status: 400 },
    );
  }
}
