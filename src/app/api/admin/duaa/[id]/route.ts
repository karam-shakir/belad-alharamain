import { NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import { deleteDuaa, setDuaaHidden } from '@/lib/duaa';

export const runtime = 'nodejs';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await readSession()))
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  let body: { hidden?: boolean };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 }); }

  const updated = await setDuaaHidden(params.id, Boolean(body.hidden));
  if (!updated) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true, duaa: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await readSession()))
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const ok = await deleteDuaa(params.id);
  if (!ok) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
