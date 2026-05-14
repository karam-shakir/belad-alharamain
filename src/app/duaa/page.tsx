import type { Metadata } from 'next';
import DuaaWallClient from './DuaaWallClient';

const TITLE = 'اذكروني بدعوة — مبادرة بلاد الحرمين';
const DESC  = 'حائط مفتوح للأمّة: شاركوا دعواتكم، وادعوا لإخوانكم. كلّ قلب يحمل حاجة، وكلّ دعاء يحمل بركة.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: 'https://belad-alharamain.com/duaa' },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: 'https://belad-alharamain.com/duaa',
    type: 'website',
    locale: 'ar_SA',
    siteName: 'بلاد الحرمين',
    images: [{ url: '/images/logo.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
  },
};

export default function Page() {
  return <DuaaWallClient highlightId={null} />;
}
