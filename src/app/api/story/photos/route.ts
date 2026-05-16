import { NextResponse } from 'next/server';
import { getPilgrim, isValidNationalId } from '@/lib/pilgrims';
import { rateLimit, getIp } from '@/lib/ratelimit';
import { STORY_ENABLED, STORY_HAJJ_YEAR, isStoryUploadOpen } from '@/lib/features';
import { getOrCreateStory, getPhotos, setChapterPhoto, removeChapterPhoto } from '@/lib/story';
import type { ChapterKey } from '@/lib/storyTemplate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_CHAPTERS: ChapterKey[] = ['ihram', 'tarwiyah', 'arafah', 'muzdalifah', 'jamarat', 'eid'];
const MAX_BYTES = 5 * 1024 * 1024;     // 5MB per photo
const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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
  if (!isStoryUploadOpen()) return NextResponse.json({ ok: false, error: 'فترة المبادرة منتهية.' }, { status: 403 });

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
  if (!VALID_TYPES.includes(file.type)) {
    return NextResponse.json({ ok: false, error: 'نوع الملف غير مدعوم (JPG/PNG/WEBP فقط).' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: 'الملف أكبر من ٥ ميغابايت.' }, { status: 400 });
  }

  const check = await validatePilgrim(nid);
  if ('error' in check) return NextResponse.json({ ok: false, error: check.error }, { status: check.status });

  // Ensure story envelope exists
  await getOrCreateStory(nid, check.pilgrim.hajjYear);

  const bytes = await file.arrayBuffer();
  const url = await setChapterPhoto(nid, chapter, bytes, file.type);
  return NextResponse.json({ ok: true, chapter, url });
}

/* DELETE /api/story/photos?nid=...&chapter=... */
export async function DELETE(req: Request) {
  if (!STORY_ENABLED) return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 404 });
  if (!isStoryUploadOpen()) return NextResponse.json({ ok: false, error: 'فترة المبادرة منتهية.' }, { status: 403 });

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
