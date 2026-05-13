import { NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import {
  listPilgrims,
  upsertPilgrim,
  bulkUpsertPilgrims,
  getPilgrimsStats,
} from '@/lib/pilgrims';

export const runtime = 'nodejs';

/* ── GET: list + stats ─── */
export async function GET() {
  if (!(await readSession()))
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  try {
    const [items, stats] = await Promise.all([listPilgrims(2000), getPilgrimsStats()]);
    return NextResponse.json({ ok: true, items, stats });
  } catch (e) {
    console.error('[admin/pilgrims] list', e);
    return NextResponse.json({ ok: false, error: 'خطأ في القراءة' }, { status: 500 });
  }
}

/* ── POST: add one (or bulk via { bulk: [...] }) ─── */
export async function POST(req: Request) {
  if (!(await readSession()))
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  let body: { nationalId?: string; name?: string; hajjYear?: string; country?: string;
              bulk?: { nationalId: string; name: string; hajjYear: string; country?: string }[];
              skipExisting?: boolean };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 }); }

  try {
    if (Array.isArray(body.bulk)) {
      if (body.bulk.length > 5000) {
        return NextResponse.json({ ok: false, error: 'الحد الأقصى 5000 صف في المرّة' }, { status: 400 });
      }
      const result = await bulkUpsertPilgrims(body.bulk, { skipExisting: body.skipExisting });
      return NextResponse.json({ ok: true, result });
    }

    if (!body.nationalId || !body.name || !body.hajjYear) {
      return NextResponse.json({ ok: false, error: 'الحقول مطلوبة' }, { status: 400 });
    }

    const p = await upsertPilgrim({
      nationalId: body.nationalId,
      name:       body.name,
      hajjYear:   body.hajjYear,
      country:    body.country,
    });
    return NextResponse.json({ ok: true, pilgrim: p });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'خطأ' },
      { status: 400 },
    );
  }
}
