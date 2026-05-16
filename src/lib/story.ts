import { kv } from '@vercel/kv';
import { put, del } from '@vercel/blob';
import type { ChapterKey } from './storyTemplate';

/* ─────────────────────────────────────────────────────────────
 *  Story (قصّتي) — storage layer.
 *
 *  KV schema:
 *   story:{nid}                    → hash { hajjYear, slug, pdfUrl,
 *                                          pdfGeneratedAt, createdAt,
 *                                          updatedAt }
 *   story:{nid}:photos             → hash { ihram, tarwiyah, arafah,
 *                                          jamarat, eid }
 *                                          (each value = blob URL)
 *   story:slug:{slug}              → nid (reverse lookup for share)
 *   story:index                    → sorted set, score=createdAt
 *
 *  Blob layout:
 *   story/{nid}/{chapter}.jpg
 *   story/{nid}/album.pdf
 * ───────────────────────────────────────────────────────────── */

export interface StoryRecord {
  nationalId:      string;
  hajjYear:        string;
  slug:            string;
  pdfUrl?:         string;
  pdfGeneratedAt?: number;
  createdAt:       number;
  updatedAt:       number;
}

export type ChapterPhotos = Partial<Record<ChapterKey, string>>;   // chapter -> blobUrl

const itemKey   = (nid: string) => `story:${nid}`;
const photosKey = (nid: string) => `story:${nid}:photos`;
const slugKey   = (slug: string) => `story:slug:${slug}`;
const INDEX     = 'story:index';

const CHAPTERS: ChapterKey[] = ['ihram', 'tarwiyah', 'arafah', 'jamarat', 'eid'];

/* ── Slug ─── */
function makeSlug(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += alphabet[bytes[i] % alphabet.length];
  return s;
}

/* ── Get / create the story envelope ─── */
export async function getOrCreateStory(nid: string, hajjYear: string): Promise<StoryRecord> {
  const existing = await getStory(nid);
  if (existing) return existing;

  const now  = Date.now();
  const slug = makeSlug();
  const rec: StoryRecord = {
    nationalId: nid,
    hajjYear,
    slug,
    createdAt:  now,
    updatedAt:  now,
  };
  await kv.hset(itemKey(nid), rec as unknown as Record<string, unknown>);
  await kv.set(slugKey(slug), nid);
  await kv.zadd(INDEX, { score: now, member: nid });
  return rec;
}

export async function getStory(nid: string): Promise<StoryRecord | null> {
  const data = await kv.hgetall<Record<string, unknown>>(itemKey(nid));
  if (!data || !data.nationalId) return null;
  return {
    nationalId:     String(data.nationalId),
    hajjYear:       String(data.hajjYear ?? ''),
    slug:           String(data.slug ?? ''),
    pdfUrl:         data.pdfUrl ? String(data.pdfUrl) : undefined,
    pdfGeneratedAt: data.pdfGeneratedAt ? Number(data.pdfGeneratedAt) : undefined,
    createdAt:      Number(data.createdAt ?? 0),
    updatedAt:      Number(data.updatedAt ?? 0),
  };
}

export async function getStoryBySlug(slug: string): Promise<StoryRecord | null> {
  const nid = await kv.get<string>(slugKey(slug));
  if (!nid) return null;
  return getStory(nid);
}

export async function getPhotos(nid: string): Promise<ChapterPhotos> {
  const data = await kv.hgetall<Record<string, unknown>>(photosKey(nid));
  if (!data) return {};
  const out: ChapterPhotos = {};
  for (const ch of CHAPTERS) {
    if (data[ch]) out[ch] = String(data[ch]);
  }
  return out;
}

/* ── Upload one chapter photo ── */
export async function setChapterPhoto(
  nid: string,
  chapter: ChapterKey,
  bytes: ArrayBuffer,
  contentType: string,
): Promise<string> {
  if (!CHAPTERS.includes(chapter)) throw new Error('Invalid chapter');

  // Normalize contentType (some HEIC files report empty string)
  const ct = contentType && contentType.includes('/')
    ? contentType
    : 'image/jpeg';

  const ext =
    ct.includes('png')  ? 'png'  :
    ct.includes('webp') ? 'webp' :
    ct.includes('heic') ? 'heic' :
    ct.includes('heif') ? 'heif' :
    'jpg';

  // Always delete previous file first (silent if not found), then put.
  // This is more compatible across @vercel/blob versions than allowOverwrite.
  const existing = (await getPhotos(nid))[chapter];
  if (existing) {
    try { await del(existing); } catch { /* best effort */ }
  }

  // Use addRandomSuffix: true so we never collide with stale CDN entries,
  // which removes the need for overwrite semantics entirely.
  const path = `story/${nid}/${chapter}.${ext}`;
  const blob = await put(path, new Uint8Array(bytes), {
    access:          'public',
    contentType:     ct,
    addRandomSuffix: true,
  });

  await kv.hset(photosKey(nid), { [chapter]: blob.url });
  await kv.hset(itemKey(nid),   { updatedAt: Date.now() });
  return blob.url;
}

/* ── Remove one chapter photo ── */
export async function removeChapterPhoto(nid: string, chapter: ChapterKey): Promise<void> {
  const existing = (await getPhotos(nid))[chapter];
  if (existing) { try { await del(existing); } catch {} }
  await kv.hdel(photosKey(nid), chapter);
  await kv.hset(itemKey(nid), { updatedAt: Date.now() });
}

/* ── Save the generated PDF URL ── */
export async function savePdf(nid: string, pdfBytes: ArrayBuffer): Promise<string> {
  const path = `story/${nid}/album.pdf`;
  const blob = await put(path, Buffer.from(pdfBytes), {
    access:           'public',
    contentType:      'application/pdf',
    addRandomSuffix:  false,
    allowOverwrite:   true,
  });
  await kv.hset(itemKey(nid), { pdfUrl: blob.url, pdfGeneratedAt: Date.now() });
  return blob.url;
}

/* ── Admin: list / delete ── */
export async function listStories(opts: { limit?: number; offset?: number } = {}): Promise<StoryRecord[]> {
  const limit  = Math.min(opts.limit  ?? 100, 500);
  const offset = Math.max(opts.offset ?? 0, 0);
  const ids = await kv.zrange<string[]>(INDEX, offset, offset + limit - 1, { rev: true });
  if (!ids?.length) return [];
  const pipe = kv.pipeline();
  ids.forEach(id => pipe.hgetall(itemKey(id)));
  const rows = await pipe.exec<Record<string, unknown>[]>();
  return rows
    .map((r): StoryRecord | null => {
      if (!r || !r.nationalId) return null;
      return {
        nationalId:     String(r.nationalId),
        hajjYear:       String(r.hajjYear ?? ''),
        slug:           String(r.slug ?? ''),
        pdfUrl:         r.pdfUrl ? String(r.pdfUrl) : undefined,
        pdfGeneratedAt: r.pdfGeneratedAt ? Number(r.pdfGeneratedAt) : undefined,
        createdAt:      Number(r.createdAt ?? 0),
        updatedAt:      Number(r.updatedAt ?? 0),
      };
    })
    .filter((r): r is StoryRecord => r !== null);
}

export async function deleteStory(nid: string): Promise<boolean> {
  const story = await getStory(nid);
  if (!story) return false;

  // Delete photos
  const photos = await getPhotos(nid);
  for (const url of Object.values(photos)) {
    if (url) { try { await del(url); } catch {} }
  }
  // Delete PDF
  if (story.pdfUrl) { try { await del(story.pdfUrl); } catch {} }
  // Delete KV records
  await kv.del(itemKey(nid));
  await kv.del(photosKey(nid));
  if (story.slug) await kv.del(slugKey(story.slug));
  await kv.zrem(INDEX, nid);
  return true;
}

export async function countStories(): Promise<number> {
  return (await kv.zcard(INDEX)) ?? 0;
}
