import { NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import { deleteStory } from '@/lib/story';

export const runtime = 'nodejs';

export async function DELETE(_req: Request, { params }: { params: { nid: string } }) {
  if (!(await readSession()))
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const ok = await deleteStory(params.nid);
  return NextResponse.json({ ok });
}
