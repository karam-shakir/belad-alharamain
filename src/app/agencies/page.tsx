import type { Metadata } from 'next';
import Navbar           from '@/components/Navbar';
import Agencies         from '@/components/Agencies';
import Footer           from '@/components/Footer';
import FloatingElements from '@/components/FloatingElements';
import ScrollInit       from '@/components/ScrollInit';

const TITLE_AR = 'التعاقد مع الوكالات الخارجية';
const DESC_AR  = 'انضم إلى شبكة شركاء بلاد الحرمين العالميين — باقات تنافسية، دعم على مدار الساعة، عمولات مميزة، ومواد تسويقية احترافية. سجّل وكالتك الآن.';

export const metadata: Metadata = {
  title: TITLE_AR,
  description: DESC_AR,
  alternates: {
    canonical: 'https://belad-alharamain.com/agencies',
  },
  openGraph: {
    title: `${TITLE_AR} | بلاد الحرمين`,
    description: DESC_AR,
    url: 'https://belad-alharamain.com/agencies',
    type: 'website',
    locale: 'ar_SA',
    images: [{ url: '/images/logo.png', width: 1200, height: 630, alt: 'بلاد الحرمين' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE_AR,
    description: DESC_AR,
    images: ['/images/logo.png'],
  },
};

export default function AgenciesPage() {
  return (
    <>
      <ScrollInit />
      <Navbar />
      <main className="pt-20">
        <Agencies />
      </main>
      <Footer />
      <FloatingElements />
    </>
  );
}
