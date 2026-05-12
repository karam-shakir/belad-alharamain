import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الصفحة غير موجودة',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12
                    bg-gradient-to-br from-teal-dark via-teal to-teal-dark">
      <div className="max-w-md w-full text-center">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/95 rounded-2xl px-5 py-3 shadow-2xl">
            <Image src="/images/logo.png" alt="بلاد الحرمين"
                   width={220} height={80}
                   className="h-16 w-auto object-contain" priority />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gold/15 p-7 sm:p-10">
          <div className="inline-flex w-20 h-20 rounded-full bg-gold/15
                          items-center justify-center mb-5">
            <span className="text-4xl font-black text-gold">404</span>
          </div>

          <h1 className="text-2xl font-black text-teal-dark mb-3">الصفحة غير موجودة</h1>
          <p className="text-gray-500 leading-relaxed mb-7">
            عذراً، الصفحة التي تبحث عنها غير متاحة. ربما حُذِفت أو تغيّر رابطها.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/"
                  className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light
                             text-white font-bold px-6 py-3 rounded-full transition-all
                             duration-300 hover:-translate-y-0.5 shadow-gold">
              <i className="fas fa-house" />
              الصفحة الرئيسية
            </Link>
            <Link href="/#contact"
                  className="inline-flex items-center justify-center gap-2 bg-teal hover:bg-teal-light
                             text-white font-bold px-6 py-3 rounded-full transition-all
                             duration-300 hover:-translate-y-0.5 shadow-teal">
              <i className="fas fa-envelope" />
              تواصل معنا
            </Link>
          </div>

          <div className="mt-6 pt-5 border-t border-gold/15">
            <p className="text-xs text-gray-400">روابط سريعة:</p>
            <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs">
              <Link href="/#about"     className="text-teal hover:text-gold transition">من نحن</Link>
              <span className="text-gray-300">•</span>
              <Link href="/#services"  className="text-teal hover:text-gold transition">الخدمات</Link>
              <span className="text-gray-300">•</span>
              <Link href="/agencies"   className="text-teal hover:text-gold transition">الوكالات</Link>
              <span className="text-gray-300">•</span>
              <Link href="/sitemap"    className="text-teal hover:text-gold transition">خريطة الموقع</Link>
            </div>
          </div>
        </div>

        <p className="text-white/40 text-xs mt-5">© 2026 بلاد الحرمين للحج والعمرة</p>
      </div>
    </div>
  );
}
