import type { Metadata } from 'next';
import CertificateClient from './CertificateClient';

export const metadata: Metadata = {
  title: 'شهادة إتمام الحج | Hajj Certificate',
  description: 'احصل على شهادة إتمام مناسك الحج من شركة بلاد الحرمين بإدخال رقم الهوية.',
  alternates: { canonical: 'https://belad-alharamain.com/certificate' },
  openGraph: {
    title: 'شهادة إتمام الحج — بلاد الحرمين',
    description: 'احصل على شهادتك الإلكترونية باسمك واستخرجها كملف PDF.',
    url: 'https://belad-alharamain.com/certificate',
    type: 'website',
    locale: 'ar_SA',
    images: [{ url: '/images/logo.png', width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <CertificateClient />;
}
