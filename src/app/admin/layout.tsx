import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'لوحة التحكم — بلاد الحرمين',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-cream">{children}</div>;
}
