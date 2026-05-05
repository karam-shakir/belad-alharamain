import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'بلاد الحرمين للحج والعمرة | Belad Alharamain Hajj & Umrah',
  description:
    'شركة بلاد الحرمين للحج والعمرة — نخدم ضيوف الرحمن بشغف واحترافية. خدمات الحج الداخلي، العمرة، والباقات الفاخرة.',
  keywords: 'حج, عمرة, بلاد الحرمين, خدمات الحج, خدمات العمرة, باقات حج وعمرة, حج داخلي',
  authors: [{ name: 'Belad Alharamain Co.' }],
  openGraph: {
    title: 'بلاد الحرمين للحج والعمرة',
    description: 'نخدم ضيوف الرحمن بشغف واحترافية',
    type: 'website',
    locale: 'ar_SA',
  },
  robots: { index: true, follow: true },
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Font Awesome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        {/* Google Fonts preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {/* Scroll progress bar */}
        <div id="scroll-progress" />
        {children}
      </body>
    </html>
  );
}
