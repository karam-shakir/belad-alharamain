import { NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import { getSettings, saveSettings, type StorySettings } from '@/lib/storySettings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await readSession()))
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const settings = await getSettings();
  return NextResponse.json({ ok: true, settings });
}

export async function PUT(req: Request) {
  if (!(await readSession()))
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  let body: Partial<StorySettings>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 }); }

  const updated = await saveSettings(body);
  return NextResponse.json({ ok: true, settings: updated });
}
