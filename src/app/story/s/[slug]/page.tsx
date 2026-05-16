import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { STORY_ENABLED } from '@/lib/features';
import { getStoryBySlug, getPhotos } from '@/lib/story';
import { getPilgrim } from '@/lib/pilgrims';
import { STORY_CHAPTERS } from '@/lib/storyTemplate';

const SITE = 'https://belad-alharamain.com';

export async function generateMetadata(
  { params }: { params: { slug: string } },
): Promise<Metadata> {
  if (!STORY_ENABLED) return { title: 'قصّتي' };
  const story = await getStoryBySlug(params.slug).catch(() => null);
  if (!story) return { title: 'قصّتي — بلاد الحرمين' };
  const pilgrim = await getPilgrim(story.nationalId).catch(() => null);
  if (!pilgrim) return { title: 'قصّتي — بلاد الحرمين' };

  const title = `قصّة حجّ ${pilgrim.name} — موسم ${pilgrim.hajjYear}هـ`;
  const desc  = `الحمد لله، هذه قصّة رحلة حجّ ${pilgrim.name} لعام ${pilgrim.hajjYear}هـ مع شركة بلاد الحرمين 🤍🕋`;
  return {
    title, description: desc,
    alternates: { canonical: `${SITE}/story/s/${params.slug}` },
    openGraph: {
      title, description: desc,
      url: `${SITE}/story/s/${params.slug}`,
      type: 'article', locale: 'ar_SA', siteName: 'بلاد الحرمين',
      images: [{ url: '/images/logo.png', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description: desc },
  };
}

export default async function StorySharePage({ params }: { params: { slug: string } }) {
  if (!STORY_ENABLED) notFound();
  const story = await getStoryBySlug(params.slug).catch(() => null);
  if (!story) notFound();
  const pilgrim = await getPilgrim(story.nationalId).catch(() => null);
  if (!pilgrim || pilgrim.revokedAt) notFound();
  const photos = await getPhotos(story.nationalId);

  const chapters = STORY_CHAPTERS.filter(c => photos[c.key]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-cream-dark to-cream py-8 sm:py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Top brand */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-block bg-white rounded-2xl px-5 py-3 shadow-card">
            <Image src="/images/logo.png" alt="بلاد الحرمين" width={220} height={80}
                   className="h-14 w-auto object-contain" />
          </Link>
        </div>

        {/* Hero */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gold/20 p-6 sm:p-10 mb-6 text-center">
          <div className="inline-flex w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark items-center justify-center mb-4 shadow-gold">
            <i className="fas fa-book-open text-white text-2xl" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-teal-dark mb-2">قصّتي</h1>
          <p className="text-gold-dark font-bold text-xs sm:text-sm tracking-widest mb-5">MY HAJJ STORY</p>
          <div className="w-16 h-px bg-gold mx-auto mb-5" />
          <p className="text-lg sm:text-2xl font-black text-teal-dark mb-1">{pilgrim.name}</p>
          <p className="text-sm text-gray-500 mb-1">رحلة الحجّ المباركة</p>
          <p className="text-sm text-gold-dark font-bold">موسم {pilgrim.hajjYear}هـ</p>
          {pilgrim.country && <p className="text-xs text-gray-400 mt-2">— {pilgrim.country}</p>}

          {story.pdfUrl && (
            <a href={story.pdfUrl} target="_blank" rel="noopener noreferrer" download
               className="inline-flex items-center gap-2 mt-6 bg-gold hover:bg-gold-light text-white font-bold px-5 py-3 rounded-full transition shadow-gold">
              <i className="fas fa-file-pdf" />
              تنزيل النسخة الكاملة PDF
            </a>
          )}
        </div>

        {/* Chapters preview */}
        {chapters.length > 0 && (
          <div className="space-y-4 mb-6">
            {chapters.map(ch => (
              <article key={ch.key} className="bg-white rounded-2xl border border-gold/15 shadow-card overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photos[ch.key]!} alt="" className="w-full h-56 sm:h-72 object-cover" />
                <div className="p-5 sm:p-6 text-center">
                  <p className="text-[11px] text-gold-dark tracking-widest font-bold mb-1">الفصل {ch.numberAr}</p>
                  <h2 className="text-xl sm:text-2xl font-black text-teal-dark mb-1">{ch.titleAr}</h2>
                  <p className="text-xs text-gray-500 italic mb-3">{ch.titleEn}</p>
                  <div className="flex items-center justify-center gap-2 my-3">
                    <span className="block w-12 h-px bg-gold/40" />
                    <span className="text-gold">✦</span>
                    <span className="block w-12 h-px bg-gold/40" />
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 leading-loose whitespace-pre-line">
                    {ch.proseAr}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* CTA back to home */}
        <div className="bg-white rounded-2xl border border-gold/15 p-6 text-center mt-8">
          <p className="text-sm text-gray-600 mb-3">
            هذه القصّة من إنتاج <strong>شركة بلاد الحرمين للحجّ والعمرة</strong>
          </p>
          <Link href="/" className="inline-flex items-center gap-2 bg-teal-dark hover:bg-teal text-white font-bold px-5 py-2.5 rounded-full text-sm transition">
            <i className="fas fa-house" />زورنا
          </Link>
        </div>
      </div>
    </div>
  );
}
