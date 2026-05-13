import { ImageResponse } from 'next/og';
import { getPilgrimByVerifyCode } from '@/lib/pilgrims';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Belad Alharamain — Hajj Memento';

const SITE = 'https://belad-alharamain.com';

/* ─────────────────────────────────────────────────────────────
 * Dynamic OG image for /verify/[code]
 *
 * NOTE on Arabic: Satori (the engine behind ImageResponse) does NOT
 * fully apply Arabic glyph shaping — Arabic letters render disconnected.
 * Therefore the IMAGE itself uses English + decorative branding only.
 * The Arabic pilgrim name + Hajj year are exposed via the page's
 * `og:title` and `og:description` metadata (rendered as TEXT by social
 * platforms — WhatsApp, X, LinkedIn, Facebook — and display correctly).
 * ───────────────────────────────────────────────────────────── */
export default async function Image({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();

  let pilgrim: Awaited<ReturnType<typeof getPilgrimByVerifyCode>> = null;
  try { pilgrim = await getPilgrimByVerifyCode(code); } catch { /* ignore */ }

  const valid    = !!pilgrim && !pilgrim.revokedAt;
  const revoked  = !!pilgrim?.revokedAt;
  const hajjYear = pilgrim?.hajjYear ?? '';

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
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Double gold frame */}
        <div style={{ position: 'absolute', inset: '22px', border: '5px solid #A88B4A',  borderRadius: '8px', display: 'flex' }} />
        <div style={{ position: 'absolute', inset: '34px', border: '1.5px solid #C4A55E', borderRadius: '4px', display: 'flex' }} />

        {/* Decorative corner stars */}
        {[
          { top: 36, left: 36 }, { top: 36, right: 36 },
          { bottom: 36, left: 36 }, { bottom: 36, right: 36 },
        ].map((pos, i) => (
          <div key={i} style={{
            position: 'absolute', ...pos, width: 30, height: 30, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#C4A55E', fontSize: 28,
          }}>✦</div>
        ))}

        {/* TOP: logo */}
        <div style={{ display: 'flex', alignItems: 'center', zIndex: 1, marginTop: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${SITE}/images/logo.png`}
            alt=""
            width={320}
            height={120}
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* CENTER */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          zIndex: 1,
          flex: 1,
          justifyContent: 'center',
          gap: 14,
        }}>
          {revoked ? (
            <div style={{
              display: 'flex',
              padding: '8px 26px',
              background: '#FEF3C7',
              border: '2px solid #F59E0B',
              color: '#B45309',
              borderRadius: 999,
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 2,
              marginBottom: 12,
            }}>
              REVOKED
            </div>
          ) : valid && (
            <div style={{
              display: 'flex',
              padding: '8px 28px',
              background: '#D1FAE5',
              border: '2px solid #10B981',
              color: '#065F46',
              borderRadius: 999,
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 3,
              marginBottom: 12,
            }}>
              ✓ VERIFIED
            </div>
          )}

          {/* Big bilingual title — uses serif font (works for Latin) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px 60px',
            borderTop:    '4px solid #A88B4A',
            borderBottom: '4px solid #A88B4A',
            background:
              'linear-gradient(to bottom, transparent, rgba(168,139,74,0.08), transparent)',
          }}>
            <p style={{
              margin: 0,
              fontSize: 64,
              fontWeight: 700,
              color: '#7D6530',
              letterSpacing: 1,
              display: 'flex',
              lineHeight: 1.1,
            }}>
              HAJJ MEMENTO
            </p>
            <p style={{
              margin: '6px 0 0',
              fontSize: 22,
              color: '#A88B4A',
              letterSpacing: 6,
              display: 'flex',
            }}>
              A BLESSED PILGRIMAGE
            </p>
          </div>

          {hajjYear && (
            <p style={{
              margin: 0,
              fontSize: 38,
              color: '#155E6B',
              fontWeight: 700,
              letterSpacing: 4,
              display: 'flex',
            }}>
              HAJJ {hajjYear} AH
            </p>
          )}

          <p style={{
            margin: 0,
            fontSize: 22,
            color: '#7D6530',
            letterSpacing: 3,
            display: 'flex',
          }}>
            BELAD ALHARAMAIN · belad-alharamain.com
          </p>
        </div>

        {/* BOTTOM: code */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          zIndex: 1,
          marginBottom: 8,
          fontSize: 18,
          color: '#7D6530',
        }}>
          <p style={{ margin: 0, fontWeight: 700, letterSpacing: 2, display: 'flex' }}>
            HAJJ &amp; UMRAH SERVICES
          </p>
          <p style={{
            margin: 0,
            letterSpacing: 4,
            fontFamily: 'monospace',
            display: 'flex',
            padding: '6px 14px',
            background: 'rgba(168,139,74,0.1)',
            borderRadius: 6,
            border: '1px solid rgba(168,139,74,0.3)',
          }}>
            {code}
          </p>
        </div>
      </div>
    ),
    size,
  );
}
