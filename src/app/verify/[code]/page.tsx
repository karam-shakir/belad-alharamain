import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getPilgrimByVerifyCode } from '@/lib/pilgrims';

export const dynamic = 'force-dynamic';

/* Dynamic per-pilgrim metadata so social shares (WhatsApp, Twitter, FB, etc.)
 * show a rich preview with the pilgrim's name and Hajj year. */
export async function generateMetadata(
  { params }: { params: { code: string } },
): Promise<Metadata> {
  const code    = params.code.toUpperCase();
  const pilgrim = await getPilgrimByVerifyCode(code).catch(() => null);

  const SITE = 'https://belad-alharamain.com';
  const baseTitle = 'تذكار الحج المبارك — بلاد الحرمين';
  const baseDesc  = 'تذكار رسمي معتمد من شركة بلاد الحرمين للحج والعمرة.';

  if (!pilgrim) {
    return {
      title: `التحقق من تذكار الحج | Verify Hajj Memento`,
      description: baseDesc,
      robots: { index: false, follow: false },
      openGraph: {
        title: baseTitle,
        description: baseDesc,
        url: `${SITE}/verify/${code}`,
        type: 'article',
        locale: 'ar_SA',
        siteName: 'بلاد الحرمين',
      },
      twitter: {
        card: 'summary_large_image',
        title: baseTitle,
        description: baseDesc,
      },
    };
  }

  const revoked = !!pilgrim.revokedAt;
  const title = revoked
    ? `تذكار ملغى — ${pilgrim.name}`
    : `تذكار الحج المبارك — ${pilgrim.name}`;
  const description = revoked
    ? `هذا التذكار تمّ إلغاؤه من قِبل إدارة شركة بلاد الحرمين.`
    : `تشرّفت شركة بلاد الحرمين بخدمة ${pilgrim.name} في أداء فريضة الحج لعام ${pilgrim.hajjYear} هـ — تقبّل الله منا ومنه.`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: `${SITE}/verify/${code}`,
      type: 'article',
      locale: 'ar_SA',
      siteName: 'بلاد الحرمين',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

function toArabicDigits(s: string | number): string {
  return String(s).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
}

interface PageProps { params: { code: string } }

export default async function VerifyPage({ params }: PageProps) {
  const code = params.code.toUpperCase();
  const pilgrim = await getPilgrimByVerifyCode(code);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10
                    bg-gradient-to-br from-teal-dark via-teal to-teal-dark">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="bg-white/95 rounded-2xl px-5 py-3 shadow-2xl inline-block">
            <Image src="/images/logo.png" alt="بلاد الحرمين"
                   width={220} height={80} priority
                   className="h-14 w-auto object-contain" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-gold/20 p-7 sm:p-9">
          {!pilgrim ? (
            <div className="text-center">
              <div className="inline-flex w-20 h-20 rounded-full bg-red-50 items-center justify-center mb-5">
                <i className="fas fa-circle-xmark text-red-500 text-4xl" />
              </div>
              <h1 className="text-xl font-black text-red-700 mb-2">تذكار غير صحيح</h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-1">
                لا يوجد تذكار بهذا الرمز في سجلّاتنا.
              </p>
              <p className="text-gray-400 text-xs mb-6">Invalid memento code.</p>
              <p className="font-mono text-xs text-gray-400 bg-gray-50 inline-block px-3 py-1 rounded">
                {code}
              </p>
            </div>
          ) : pilgrim.revokedAt ? (
            <div className="text-center">
              <div className="inline-flex w-20 h-20 rounded-full bg-amber-50 items-center justify-center mb-5">
                <i className="fas fa-ban text-amber-500 text-4xl" />
              </div>
              <h1 className="text-xl font-black text-amber-700 mb-2">تذكار ملغى</h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-1">
                هذا التذكار كان مُصدراً بالاسم التالي ثم تمّ إلغاؤه.
              </p>
              <p className="text-gray-400 text-xs mb-5">Revoked memento.</p>
              <div className="bg-gray-50 rounded-xl p-4 mb-3 text-start">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">الاسم</p>
                <p className="font-black text-teal-dark mb-3">{pilgrim.name}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">سنة الحج</p>
                <p className="font-black text-teal-dark">{toArabicDigits(pilgrim.hajjYear)} هـ</p>
              </div>
              {pilgrim.revokeReason && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 text-start">
                  <i className="fas fa-circle-info me-1" />السبب: {pilgrim.revokeReason}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="inline-flex w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600
                              items-center justify-center mb-5 shadow-lg">
                <i className="fas fa-circle-check text-white text-4xl" />
              </div>
              <h1 className="text-xl font-black text-green-700 mb-1">تذكار صحيح ومُعتمد</h1>
              <p className="text-gray-400 text-xs mb-6">Certified by Belad Alharamain</p>

              <div className="bg-gradient-to-br from-cream to-cream-dark rounded-2xl
                              border border-gold/30 p-5 mb-4 text-start">
                <div className="mb-4 pb-4 border-b border-gold/15">
                  <p className="text-[10px] text-gold-dark font-bold uppercase tracking-wider mb-1">
                    اسم الحاج · Pilgrim
                  </p>
                  <p className="font-black text-teal-dark text-lg leading-tight">
                    {pilgrim.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gold-dark font-bold uppercase tracking-wider mb-1">
                      سنة الحج · Year
                    </p>
                    <p className="font-black text-teal-dark">{toArabicDigits(pilgrim.hajjYear)} هـ</p>
                    <p className="text-xs text-gray-400 font-mono">{pilgrim.hajjYear} AH</p>
                  </div>
                  {pilgrim.country && (
                    <div>
                      <p className="text-[10px] text-gold-dark font-bold uppercase tracking-wider mb-1">
                        الجنسية · Country
                      </p>
                      <p className="font-black text-teal-dark">{pilgrim.country}</p>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                <i className="fas fa-shield-halved text-gold me-1" />
                هذا التذكار صادر رسمياً من شركة بلاد الحرمين للحج والعمرة.
              </p>
              <p className="text-[10px] text-gray-400 mt-1 font-mono" dir="ltr">
                Verification code: {code}
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-white/50 text-xs mt-5">
          <Link href="/" className="hover:text-gold-light">
            <i className="fas fa-house me-1" />العودة للموقع
          </Link>
        </p>
      </div>
    </div>
  );
}
