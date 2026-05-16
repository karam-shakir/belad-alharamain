import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { kv } from '@vercel/kv';
import { getPilgrim, isValidNationalId } from '@/lib/pilgrims';
import { rateLimit, getIp } from '@/lib/ratelimit';
import { STORY_ENABLED, STORY_HAJJ_YEAR } from '@/lib/features';
import { getSettings } from '@/lib/storySettings';
import { getOrCreateStory, getPhotos, getStory, savePdf } from '@/lib/story';
import { renderStoryPdf } from '@/lib/storyPdf';

export const runtime = 'nodejs';
export const maxDuration = 60;

/* POST /api/story/generate { nationalId } — builds the PDF and stores it */
export async function POST(req: Request) {
  if (!STORY_ENABLED) return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 404 });
  const settings = await getSettings();
  if (!settings.enabled) return NextResponse.json({ ok: false, error: 'المبادرة غير مُفعَّلة حالياً.' }, { status: 404 });

  const ip = getIp(req);
  const rl = rateLimit(`story-gen:${ip}`, { max: 5, windowMs: 60 * 60 * 1000 });
  if (!rl.allowed) return NextResponse.json({ ok: false, error: 'محاولات كثيرة. حاول بعد ساعة.' }, { status: 429 });

  let body: { nationalId?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 }); }

  const nid = String(body.nationalId ?? '').replace(/\D/g, '').slice(0, 10);
  if (!isValidNationalId(nid)) {
    return NextResponse.json({ ok: false, error: 'رقم الهوية غير صحيح.' }, { status: 400 });
  }
  const p = await getPilgrim(nid);
  if (!p || p.revokedAt || p.hajjYear !== STORY_HAJJ_YEAR) {
    return NextResponse.json({ ok: false, error: 'غير مصرّح.' }, { status: 403 });
  }

  const story = await getOrCreateStory(nid, p.hajjYear);

  /* Per-pilgrim cooldown between regenerations */
  if (story.pdfGeneratedAt) {
    const minutesSince = (Date.now() - story.pdfGeneratedAt) / 60_000;
    if (minutesSince < settings.generateCooldownMin) {
      const wait = Math.ceil(settings.generateCooldownMin - minutesSince);
      return NextResponse.json({ ok: false, error: `يمكن إعادة الإنشاء بعد ${wait} دقيقة.` }, { status: 429 });
    }
  }

  /* Per-pilgrim daily cap */
  const dayKey = `story:gen-count:${nid}:${new Date().toISOString().slice(0,10)}`;
  const dayCount = Number((await kv.get(dayKey)) ?? 0);
  if (dayCount >= settings.maxGenerationsPerDay) {
    return NextResponse.json({ ok: false, error: `وصلتَ للحدّ اليومي (${settings.maxGenerationsPerDay} إنشاءات). حاول غداً.` }, { status: 429 });
  }

  const photos = await getPhotos(nid);

  if (Object.keys(photos).length === 0) {
    return NextResponse.json({ ok: false, error: 'ارفع صورة واحدة على الأقل لإنشاء القصّة.' }, { status: 400 });
  }

  const origin   = new URL(req.url).origin;
  const shareUrl = `${origin}/story/s/${story.slug}`;

  // Generate QR for back cover
  let qrDataUrl: string | undefined;
  try {
    qrDataUrl = await QRCode.toDataURL(shareUrl, {
      margin: 1, width: 260, color: { dark: '#155E6B', light: '#FFFFFF' },
    });
  } catch { /* QR is optional */ }

  // Render PDF
  const pdfBytes = await renderStoryPdf({
    pilgrimName: p.name,
    hajjYear:    p.hajjYear,
    photos,
    qrDataUrl,
    shareUrl,
  });

  // Persist
  const pdfUrl = await savePdf(nid, pdfBytes);
  // Bump per-day counter (expires after 36h)
  await kv.set(dayKey, dayCount + 1, { ex: 36 * 3600 });

  // After successful generation, also re-fetch story to ensure latest data
  void getStory(nid).catch(() => null);

  return NextResponse.json({
    ok: true,
    pdfUrl,
    shareUrl,
    chapters: Object.keys(photos).length,
    printPartner: settings.printPartner.enabled ? settings.printPartner : null,
  });
}
