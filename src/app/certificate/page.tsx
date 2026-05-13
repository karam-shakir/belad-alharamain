import type { Metadata } from 'next';
import CertificateClient from './CertificateClient';

export const metadata: Metadata = {
  title: 'تذكار الحج المبارك | Hajj Memento',
  description: 'احصل على تذكار الحج المبارك من شركة بلاد الحرمين بإدخال رقم الهوية.',
  alternates: { canonical: 'https://belad-alharamain.com/certificate' },
  openGraph: {
    title: 'تذكار الحج المبارك — بلاد الحرمين',
    description: 'احصل على تذكاركم الإلكتروني باسمكم واستخرجوه كملف PDF.',
    url: 'https://belad-alharamain.com/certificate',
    type: 'website',
    locale: 'ar_SA',
    images: [{ url: '/images/logo.png', width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <CertificateClient />;
}
