import { NextResponse } from 'next/server';
import { getPilgrim, isValidNationalId } from '@/lib/pilgrims';
import { rateLimit, getIp } from '@/lib/ratelimit';
import { STORY_ENABLED, STORY_HAJJ_YEAR } from '@/lib/features';
import { getSettings, isUploadWindowOpen } from '@/lib/storySettings';
import { getOrCreateStory } from '@/lib/story';

export const runtime = 'nodejs';

/* POST /api/story/identify
 *   Body: { nationalId }
 *   Returns pilgrim summary + story slug (creates the record if first time). */
export async function POST(req: Request) {
  if (!STORY_ENABLED) return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 404 });
  const settings = await getSettings();
  if (!settings.enabled) return NextResponse.json({ ok: false, error: 'المبادرة غير مُفعَّلة حالياً.' }, { status: 404 });

  const ip = getIp(req);
  const rl = rateLimit(`story-id:${ip}`, { max: 10, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ ok: false, error: 'محاولات كثيرة. حاول بعد دقيقة.' }, { status: 429 });

  let body: { nationalId?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 }); }

  const nid = String(body.nationalId ?? '').replace(/\D/g, '').slice(0, 10);
  if (!isValidNationalId(nid)) {
    return NextResponse.json({ ok: false, error: 'رقم الهوية غير صحيح.' }, { status: 400 });
  }

  const p = await getPilgrim(nid);
  if (!p) {
    return NextResponse.json({ ok: false, error: 'الرقم غير مسجّل في قائمتنا. لا تتاح المبادرة إلا لحجاج بلاد الحرمين.' }, { status: 404 });
  }
  if (p.revokedAt) {
    return NextResponse.json({ ok: false, error: 'السجلّ ملغى. تواصلوا معنا.' }, { status: 410 });
  }
  if (p.hajjYear !== STORY_HAJJ_YEAR) {
    return NextResponse.json({ ok: false, error: `المبادرة مخصّصة لموسم ${STORY_HAJJ_YEAR}هـ فقط.` }, { status: 403 });
  }

  const story = await getOrCreateStory(nid, p.hajjYear);
  return NextResponse.json({
    ok: true,
    pilgrim: { nationalId: p.nationalId, name: p.name, hajjYear: p.hajjYear, country: p.country },
    story:   { slug: story.slug, pdfUrl: story.pdfUrl, pdfGeneratedAt: story.pdfGeneratedAt, updatedAt: story.updatedAt },
    uploadOpen: isUploadWindowOpen(settings),
    settings: {
      maxPhotos:    settings.maxPhotosPerStory,
      maxFileMB:    settings.maxFileSizeMB,
      startAt:      settings.startAt,
      endAt:        settings.endAt,
      printPartner: settings.printPartner.enabled ? settings.printPartner : null,
    },
  });
}
