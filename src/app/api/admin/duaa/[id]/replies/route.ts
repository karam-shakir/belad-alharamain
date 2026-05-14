import { NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import { listReplies } from '@/lib/duaa';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* GET /api/admin/duaa/[id]/replies — list ALL replies (including hidden) for admin */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!(await readSession()))
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  try {
    const replies = await listReplies(params.id, { limit: 200, includeHidden: true });
    return NextResponse.json({ ok: true, items: replies });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'خطأ' },
      { status: 500 },
    );
  }
}
