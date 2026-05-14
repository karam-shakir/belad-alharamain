import { NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import { listDuaa, getDuaaStats } from '@/lib/duaa';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await readSession()))
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  try {
    const [items, stats] = await Promise.all([
      listDuaa({ limit: 500, includeHidden: true }),
      getDuaaStats(),
    ]);
    return NextResponse.json({ ok: true, items, stats });
  } catch (e) {
    console.error('[admin/duaa] list', e);
    return NextResponse.json({ ok: false, error: 'خطأ في القراءة' }, { status: 500 });
  }
}
