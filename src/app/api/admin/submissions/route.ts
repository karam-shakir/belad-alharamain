import { NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import { listSubmissions, getStats } from '@/lib/submissions';

export const runtime = 'nodejs';

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  try {
    const [items, stats] = await Promise.all([listSubmissions(200), getStats()]);
    return NextResponse.json({ ok: true, items, stats });
  } catch (e) {
    console.error('[admin/submissions] list error', e);
    return NextResponse.json({ ok: false, error: 'خطأ في قراءة البيانات.' }, { status: 500 });
  }
}
