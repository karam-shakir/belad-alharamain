import { NextResponse } from 'next/server';
import { rateLimit, getIp } from '@/lib/ratelimit';
import { createReply, listReplies, MAX_REPLY_LEN, MAX_NAME_LEN, MAX_COUNTRY_LEN } from '@/lib/duaa';
import { DUAA_ENABLED } from '@/lib/features';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const disabled = () =>
  NextResponse.json({ ok: false, error: 'unavailable' }, { status: 404 });

/* GET /api/duaa/[id]/reply — list replies for a duaa */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!DUAA_ENABLED) return disabled();
  try {
    const replies = await listReplies(params.id, { limit: 100 });
    // Strip private IP before sending to client
    const safe = replies.map(({ ip: _ip, ...rest }) => rest);
    return NextResponse.json({ ok: true, items: safe });
  } catch (e) {
    console.error('[duaa/reply] list', e);
    return NextResponse.json({ ok: false, error: 'تعذّر القراءة.' }, { status: 500 });
  }
}

/* POST /api/duaa/[id]/reply — add a free-text prayer in response to a duaa */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!DUAA_ENABLED) return disabled();
  const ip = getIp(req);
  const rl = rateLimit(`duaa-reply:${ip}`, { max: 10, windowMs: 60 * 60 * 1000 });  // 10/hour
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: 'محاولات كثيرة. حاول بعد قليل.' },
      { status: 429 },
    );
  }

  let body: { name?: string; country?: string; message?: string; nationalId?: string; hp?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 }); }

  if ((body.hp ?? '').trim() !== '') return NextResponse.json({ ok: true, silent: true });

  const message    = String(body.message    ?? '').trim();
  const name       = String(body.name       ?? '').trim().slice(0, MAX_NAME_LEN);
  const country    = String(body.country    ?? '').trim().slice(0, MAX_COUNTRY_LEN);
  const nationalId = body.nationalId ? String(body.nationalId).replace(/\D/g, '').slice(0, 10) : undefined;

  if (!message) {
    return NextResponse.json({ ok: false, error: 'الدعاء مطلوب.' }, { status: 400 });
  }
  if (message.length > MAX_REPLY_LEN) {
    return NextResponse.json({ ok: false, error: `حد أقصى ${MAX_REPLY_LEN} حرف.` }, { status: 400 });
  }

  try {
    const reply = await createReply({
      duaaId: params.id, name, country, message, nationalId, ip,
    });
    const { ip: _ip, ...safe } = reply;
    return NextResponse.json({ ok: true, reply: safe });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'تعذّر الإرسال.' },
      { status: 400 },
    );
  }
}
