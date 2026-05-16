import { NextResponse } from 'next/server';
import { getPilgrim, isValidNationalId } from '@/lib/pilgrims';
import { rateLimit, getIp } from '@/lib/ratelimit';
import { STORY_ENABLED, STORY_HAJJ_YEAR } from '@/lib/features';
import { getSettings, isUploadWindowOpen } from '@/lib/storySettings';
import { getOrCreateStory, getPhotos, setChapterPhoto, removeChapterPhoto } from '@/lib/story';
import type { ChapterKey } from '@/lib/storyTemplate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_CHAPTERS: ChapterKey[] = ['ihram', 'tarwiyah', 'arafah', 'jamarat', 'eid'];
/* Accept the common image mimes + iOS HEIC/HEIF (we store as-is and the user
 * gets a working blob URL — react-pdf will rasterize whatever the browser
 * already decoded for the preview). */
const VALID_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'image/heic', 'image/heif',
];

async function validatePilgrim(nid: string) {
  if (!isValidNationalId(nid)) return { error: 'رقم الهوية غير صحيح.', status: 400 };
  const p = await getPilgrim(nid);
  if (!p || p.revokedAt) return { error: 'غير مصرّح.', status: 403 };
  if (p.hajjYear !== STORY_HAJJ_YEAR) return { error: 'موسم غير مطابق.', status: 403 };
  return { pilgrim: p };
}

/* GET /api/story/photos?nid=... — list current chapter photos */
export async function GET(req: Request) {
  if (!STORY_ENABLED) return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 404 });
  const { searchParams } = new URL(req.url);
  const nid = String(searchParams.get('nid') ?? '').replace(/\D/g, '').slice(0, 10);
  const check = await validatePilgrim(nid);
  if ('error' in check) return NextResponse.json({ ok: false, error: check.error }, { status: check.status });
  const photos = await getPhotos(nid);
  return NextResponse.json({ ok: true, photos });
}

/* POST /api/story/photos
 *   multipart/form-data:
 *     nid       — national id
 *     chapter   — one of VALID_CHAPTERS
 *     photo     — File */
export async function POST(req: Request) {
  if (!STORY_ENABLED) return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 404 });
  const settings = await getSettings();
  if (!isUploadWindowOpen(settings)) {
    return NextResponse.json({ ok: false, error: 'فترة المبادرة منتهية أو غير مفتوحة بعد.' }, { status: 403 });
  }
  const MAX_BYTES = settings.maxFileSizeMB * 1024 * 1024;

  const ip = getIp(req);
  const rl = rateLimit(`story-up:${ip}`, { max: 30, windowMs: 60 * 60 * 1000 });
  if (!rl.allowed) return NextResponse.json({ ok: false, error: 'محاولات كثيرة. حاول لاحقاً.' }, { status: 429 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ ok: false, error: 'بيانات غير صحيحة.' }, { status: 400 });

  const nid = String(form.get('nid') ?? '').replace(/\D/g, '').slice(0, 10);
  const chapter = String(form.get('chapter') ?? '') as ChapterKey;
  const file = form.get('photo') as File | null;

  if (!VALID_CHAPTERS.includes(chapter)) {
    return NextResponse.json({ ok: false, error: 'فصل غير معروف.' }, { status: 400 });
  }
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ ok: false, error: 'لم يُرفع ملف.' }, { status: 400 });
  }
  // Some browsers report empty type for HEIC — allow if name extension hints at image
  const fileType = file.type || '';
  const isAcceptedByType = VALID_TYPES.includes(fileType);
  const isAcceptedByName = !fileType && /\.(jpe?g|png|webp|heic|heif)$/i.test((file as File).name ?? '');
  if (!isAcceptedByType && !isAcceptedByName) {
    return NextResponse.json({ ok: false, error: 'نوع الملف غير مدعوم. اختر صورة JPG/PNG/WEBP/HEIC.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: `الملف أكبر من ${settings.maxFileSizeMB} ميغابايت.` }, { status: 400 });
  }

  const check = await validatePilgrim(nid);
  if ('error' in check) return NextResponse.json({ ok: false, error: check.error }, { status: check.status });

  try {
    // Ensure story envelope exists
    await getOrCreateStory(nid, check.pilgrim.hajjYear);

    const bytes = await file.arrayBuffer();
    const url = await setChapterPhoto(nid, chapter, bytes, file.type);
    return NextResponse.json({ ok: true, chapter, url });
  } catch (e) {
    console.error('[story/photos] upload failed:', e);
    const msg = e instanceof Error ? e.message : 'فشل غير معروف';
    // Map common infra errors to friendly Arabic
    let userMsg = 'تعذّر رفع الصورة. حاول مرة أخرى.';
    if (/BLOB_READ_WRITE_TOKEN|missing.*token/i.test(msg)) {
      userMsg = 'إعداد التخزين غير مكتمل. تواصلوا مع الدعم.';
    } else if (/too large|payload/i.test(msg)) {
      userMsg = 'الصورة كبيرة جداً. اختر صورة أصغر.';
    }
    return NextResponse.json({ ok: false, error: userMsg, debug: msg }, { status: 500 });
  }
}

/* DELETE /api/story/photos?nid=...&chapter=... */
export async function DELETE(req: Request) {
  if (!STORY_ENABLED) return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 404 });
  const settings = await getSettings();
  if (!isUploadWindowOpen(settings)) {
    return NextResponse.json({ ok: false, error: 'فترة المبادرة منتهية أو غير مفتوحة بعد.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const nid = String(searchParams.get('nid') ?? '').replace(/\D/g, '').slice(0, 10);
  const chapter = String(searchParams.get('chapter') ?? '') as ChapterKey;
  if (!VALID_CHAPTERS.includes(chapter)) {
    return NextResponse.json({ ok: false, error: 'فصل غير معروف.' }, { status: 400 });
  }
  const check = await validatePilgrim(nid);
  if ('error' in check) return NextResponse.json({ ok: false, error: check.error }, { status: check.status });

  await removeChapterPhoto(nid, chapter);
  return NextResponse.json({ ok: true });
}
