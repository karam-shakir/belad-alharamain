import { ImageResponse } from 'next/og';
import { getPilgrimByVerifyCode } from '@/lib/pilgrims';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'تذكار الحج المبارك — Hajj Memento';

const SITE = 'https://belad-alharamain.com';

function toArabicDigits(s: string | number): string {
  return String(s).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
}

/* ─────────────────────────────────────────────────────────────
 * Dynamic Open Graph image for /verify/[code]
 * Renders a rich social-card preview showing the pilgrim's name
 * and Hajj year when the link is shared on WhatsApp, Twitter,
 * Facebook, LinkedIn, iMessage, Telegram, etc.
 * ───────────────────────────────────────────────────────────── */
export default async function Image({ params }: { params: { code: string } }) {
  const code    = params.code.toUpperCase();
  const pilgrim = await getPilgrimByVerifyCode(code);

  const valid    = !!pilgrim && !pilgrim.revokedAt;
  const revoked  = !!pilgrim?.revokedAt;
  const name     = pilgrim?.name     ?? 'تذكار الحج المبارك';
  const hajjYear = pilgrim?.hajjYear ?? '';

  // Load Arabic-capable font (Cairo bold from Google Fonts CDN)
  let cairoBold: ArrayBuffer | null = null;
  try {
    const res = await fetch(
      'https://github.com/google/fonts/raw/main/ofl/cairo/Cairo%5Bslnt%2Cwght%5D.ttf',
      { cache: 'force-cache' },
    );
    if (res.ok) cairoBold = await res.arrayBuffer();
  } catch { /* fall back to default font */ }

  const fonts = cairoBold
    ? [{ name: 'Cairo', data: cairoBold, weight: 700 as const, style: 'normal' as const }]
    : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width:  '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '60px 80px',
          background:
            'linear-gradient(135deg, #FFFCF5 0%, #FAFAF7 50%, #F5EFE3 100%)',
          fontFamily: 'Cairo, sans-serif',
          position: 'relative',
        }}
      >
        {/* Gold double frame */}
        <div
          style={{
            position: 'absolute',
            inset: '24px',
            border: '4px solid #A88B4A',
            borderRadius: '8px',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '34px',
            border: '1.5px solid #C4A55E',
            borderRadius: '4px',
            display: 'flex',
          }}
        />

        {/* Top brand band */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 1,
            marginTop: '20px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${SITE}/images/logo.png`}
            alt=""
            width={260}
            height={100}
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* Center content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            zIndex: 1,
            gap: '12px',
          }}
        >
          {revoked && (
            <div
              style={{
                fontSize: 24,
                color: '#B45309',
                background: '#FEF3C7',
                padding: '6px 18px',
                borderRadius: 999,
                border: '2px solid #F59E0B',
                marginBottom: 10,
                display: 'flex',
              }}
            >
              تذكار ملغى · Revoked
            </div>
          )}

          <p
            style={{
              fontSize: 26,
              color: valid ? '#15803D' : '#7D6530',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              margin: 0,
              fontWeight: 700,
            }}
          >
            {valid ? '✓ تذكار صحيح ومُعتمد' : 'تذكار الحج المبارك'}
          </p>

          <h1
            style={{
              fontSize: 64,
              color: '#7D6530',
              margin: '8px 0',
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: 1000,
              textAlign: 'center',
              direction: 'rtl',
              padding: '14px 40px',
              borderTop: '3px solid #A88B4A',
              borderBottom: '3px solid #A88B4A',
              background:
                'linear-gradient(to bottom, transparent, rgba(168,139,74,0.07), transparent)',
            }}
          >
            {name}
          </h1>

          {hajjYear && (
            <p
              style={{
                fontSize: 34,
                color: '#155E6B',
                margin: '8px 0 0',
                fontWeight: 700,
                direction: 'rtl',
              }}
            >
              في أداء فريضة الحج لعام
              <span style={{ color: '#A88B4A', margin: '0 12px' }}>
                {toArabicDigits(hajjYear)} هـ
              </span>
            </p>
          )}

          {hajjYear && (
            <p
              style={{
                fontSize: 22,
                color: '#7D6530',
                margin: 0,
                fontStyle: 'italic',
                letterSpacing: '2px',
              }}
            >
              HAJJ {hajjYear} AH · BELAD ALHARAMAIN
            </p>
          )}
        </div>

        {/* Bottom band */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            zIndex: 1,
            marginBottom: '10px',
            fontSize: 18,
            color: '#7D6530',
            direction: 'rtl',
          }}
        >
          <p style={{ margin: 0, fontWeight: 700 }}>
            شركة بلاد الحرمين للحج والعمرة
          </p>
          <p style={{ margin: 0, letterSpacing: '2px', fontFamily: 'monospace' }}>
            {code}
          </p>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
