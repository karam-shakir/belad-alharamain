import { NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import { listStories, countStories } from '@/lib/story';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await readSession()))
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const [items, total] = await Promise.all([listStories({ limit: 200 }), countStories()]);
  const withPdf = items.filter(i => i.pdfUrl).length;
  return NextResponse.json({
    ok: true,
    items,
    stats: { total, withPdf, withoutPdf: total - withPdf },
  });
}
