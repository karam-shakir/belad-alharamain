import { NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import {
  updatePilgrim,
  deletePilgrim,
  revokePilgrim,
  unrevokePilgrim,
  getPilgrim,
} from '@/lib/pilgrims';

export const runtime = 'nodejs';

/* ── GET: read one (admin view) ─── */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!(await readSession()))
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const p = await getPilgrim(params.id);
  if (!p) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true, pilgrim: p });
}

/* ── PATCH: edit fields or revoke/unrevoke ─── */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await readSession()))
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  let body: { name?: string; hajjYear?: string; country?: string;
              action?: 'revoke' | 'unrevoke'; reason?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 }); }

  try {
    if (body.action === 'revoke') {
      const reason = String(body.reason ?? '').trim();
      if (!reason) return NextResponse.json({ ok: false, error: 'سبب الإلغاء مطلوب' }, { status: 400 });
      const p = await revokePilgrim(params.id, reason);
      if (!p) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
      return NextResponse.json({ ok: true, pilgrim: p });
    }
    if (body.action === 'unrevoke') {
      const p = await unrevokePilgrim(params.id);
      if (!p) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
      return NextResponse.json({ ok: true, pilgrim: p });
    }

    const p = await updatePilgrim(params.id, {
      name:     body.name,
      hajjYear: body.hajjYear,
      country:  body.country,
    });
    if (!p) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
    return NextResponse.json({ ok: true, pilgrim: p });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'خطأ' },
      { status: 400 },
    );
  }
}

/* ── DELETE ─── */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await readSession()))
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const ok = await deletePilgrim(params.id);
  if (!ok) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
