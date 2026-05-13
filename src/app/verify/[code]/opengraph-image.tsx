import { ImageResponse } from 'next/og';
import { getPilgrimByVerifyCode } from '@/lib/pilgrims';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'تذكار الحج المبارك — Hajj Memento';

const SITE = 'https://belad-alharamain.com';

function toArabicDigits(s: string | number): string {
  return String(s).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
}

/* ─────────────────────────────────────────────────────────────
 * Dynamic OG image for /verify/[code]
 * Renders an attractive social-card preview showing the pilgrim's
 * name and Hajj year. Used by WhatsApp, X, LinkedIn, Facebook,
 * Telegram, iMessage, Slack, Discord, etc.
 *
 * Uses static Amiri Bold (Arabic-capable) from jsDelivr.
 * Falls back gracefully if font fetch fails.
 * ───────────────────────────────────────────────────────────── */
export default async function Image({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();

  // Look up pilgrim (silently fall back to generic card if not found)
  let pilgrim: Awaited<ReturnType<typeof getPilgrimByVerifyCode>> = null;
  try { pilgrim = await getPilgrimByVerifyCode(code); }
  catch { /* ignore */ }

  const valid    = !!pilgrim && !pilgrim.revokedAt;
  const revoked  = !!pilgrim?.revokedAt;
  const name     = pilgrim?.name     ?? 'تذكار الحج المبارك';
  const hajjYear = pilgrim?.hajjYear ?? '';

  // Load Amiri Bold (static TTF with Arabic support) from jsDelivr CDN.
  // Pinned commit + jsDelivr's CDN = stable & fast from edge runtime.
  let arabicFont: ArrayBuffer | null = null;
  try {
    const res = await fetch(
      'https://cdn.jsdelivr.net/gh/aliftype/amiri@1.000/fonts/Amiri-Bold.ttf',
      { cache: 'force-cache' },
    );
    if (res.ok) arabicFont = await res.arrayBuffer();
  } catch { /* will render with default font */ }

  const fonts = arabicFont
    ? [{ name: 'Amiri', data: arabicFont, weight: 700 as const, style: 'normal' as const }]
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
          padding: '50px 70px',
          background:
            'linear-gradient(135deg, #FFFCF5 0%, #FAFAF7 50%, #F5EFE3 100%)',
          fontFamily: 'Amiri, serif',
          position: 'relative',
        }}
      >
        {/* Double gold frame */}
        <div
          style={{
            position: 'absolute',
            inset: '20px',
            border: '5px solid #A88B4A',
            borderRadius: '8px',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '32px',
            border: '1.5px solid #C4A55E',
            borderRadius: '4px',
            display: 'flex',
          }}
        />

        {/* TOP: logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            marginTop: '10px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${SITE}/images/logo.png`}
            alt=""
            width={280}
            height={108}
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* CENTER: title + name + year */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            zIndex: 1,
            gap: '14px',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {revoked && (
            <div
              style={{
                fontSize: 24,
                color: '#B45309',
                background: '#FEF3C7',
                padding: '6px 22px',
                borderRadius: 999,
                border: '2px solid #F59E0B',
                marginBottom: 8,
                display: 'flex',
              }}
            >
              ❌ تذكار ملغى · Revoked
            </div>
          )}

          <p
            style={{
              fontSize: 28,
              color: valid ? '#15803D' : '#7D6530',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              margin: 0,
              fontWeight: 700,
              display: 'flex',
            }}
          >
            {valid ? '✓ تذكار صحيح ومعتمد' : 'تذكار الحج المبارك'}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px 50px',
              borderTop:    '3px solid #A88B4A',
              borderBottom: '3px solid #A88B4A',
              background:
                'linear-gradient(to bottom, transparent, rgba(168,139,74,0.07), transparent)',
              maxWidth: 1050,
            }}
          >
            <h1
              style={{
                fontSize: 60,
                color: '#7D6530',
                margin: 0,
                fontWeight: 700,
                lineHeight: 1.15,
                textAlign: 'center',
              }}
            >
              {name}
            </h1>
          </div>

          {hajjYear && (
            <p
              style={{
                fontSize: 36,
                color: '#155E6B',
                margin: '6px 0 0',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'baseline',
                gap: '14px',
              }}
            >
              <span>في أداء فريضة الحج لعام</span>
              <span style={{ color: '#A88B4A', fontSize: 44 }}>
                {toArabicDigits(hajjYear)}
              </span>
              <span>هـ</span>
            </p>
          )}

          {hajjYear && (
            <p
              style={{
                fontSize: 22,
                color: '#7D6530',
                margin: 0,
                letterSpacing: '3px',
                display: 'flex',
              }}
            >
              HAJJ {hajjYear} AH · BELAD ALHARAMAIN
            </p>
          )}
        </div>

        {/* BOTTOM: company + code */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            zIndex: 1,
            marginBottom: '6px',
            fontSize: 20,
            color: '#7D6530',
          }}
        >
          <p style={{ margin: 0, fontWeight: 700, display: 'flex' }}>
            شركة بلاد الحرمين للحج والعمرة
          </p>
          <p style={{ margin: 0, letterSpacing: '3px', fontFamily: 'monospace', display: 'flex' }}>
            {code}
          </p>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
