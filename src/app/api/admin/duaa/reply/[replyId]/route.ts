import { NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import { deleteReply, setReplyHidden } from '@/lib/duaa';

export const runtime = 'nodejs';

/* PATCH — toggle hidden on a reply */
export async function PATCH(req: Request, { params }: { params: { replyId: string } }) {
  if (!(await readSession()))
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  let body: { hidden?: boolean };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 }); }

  const updated = await setReplyHidden(params.replyId, Boolean(body.hidden));
  if (!updated) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true, reply: updated });
}

/* DELETE — permanently remove a reply */
export async function DELETE(_req: Request, { params }: { params: { replyId: string } }) {
  if (!(await readSession()))
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const ok = await deleteReply(params.replyId);
  if (!ok) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
