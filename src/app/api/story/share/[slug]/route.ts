import { NextResponse } from 'next/server';
import { STORY_ENABLED } from '@/lib/features';
import { getStoryBySlug, getPhotos } from '@/lib/story';
import { getPilgrim } from '@/lib/pilgrims';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* GET /api/story/share/[slug] — public read for share page */
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  if (!STORY_ENABLED) return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 404 });

  const story = await getStoryBySlug(params.slug);
  if (!story) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });

  const pilgrim = await getPilgrim(story.nationalId);
  if (!pilgrim || pilgrim.revokedAt) {
    return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  }
  const photos = await getPhotos(story.nationalId);

  return NextResponse.json({
    ok: true,
    pilgrim: { name: pilgrim.name, hajjYear: pilgrim.hajjYear, country: pilgrim.country },
    story:   { slug: story.slug, pdfUrl: story.pdfUrl, pdfGeneratedAt: story.pdfGeneratedAt },
    photos,
  });
}
