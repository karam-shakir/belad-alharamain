import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StoryClient from './StoryClient';
import { STORY_ENABLED, STORY_HAJJ_YEAR } from '@/lib/features';

const TITLE = `قصّتي — رحلة حجّ ${STORY_HAJJ_YEAR}هـ مع بلاد الحرمين`;
const DESC  = 'هدية بلاد الحرمين لحجّاج موسم 1447هـ — ارفع صور رحلتك واصنع قصّة مصوّرة مؤثّرة بهوية الشركة الفاخرة، جاهزة للمشاركة والطباعة.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: 'https://belad-alharamain.com/story' },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: 'https://belad-alharamain.com/story',
    type: 'website',
    locale: 'ar_SA',
    siteName: 'بلاد الحرمين',
    images: [{ url: '/images/logo.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESC },
};

export default function Page() {
  if (!STORY_ENABLED) notFound();
  return <StoryClient />;
}
