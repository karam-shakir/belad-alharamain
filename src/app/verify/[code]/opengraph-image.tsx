import { ImageResponse } from 'next/og';
import { getPilgrimByVerifyCode } from '@/lib/pilgrims';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Belad Alharamain — Hajj Memento';

const SITE = 'https://belad-alharamain.com';

/* Dynamic OG image — ASCII/Latin only for maximum Satori compatibility.
 * Arabic content (pilgrim name, descriptions) is delivered via
 * og:title and og:description metadata which social platforms render
 * as native text — Arabic shaping works correctly there. */
export default async function Image({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();

  let pilgrim: Awaited<ReturnType<typeof getPilgrimByVerifyCode>> = null;
  try { pilgrim = await getPilgrimByVerifyCode(code); } catch { /* ignore */ }

  const valid    = !!pilgrim && !pilgrim.revokedAt;
  const revoked  = !!pilgrim?.revokedAt;
  const hajjYear = pilgrim?.hajjYear ?? '';

  const statusLabel = revoked ? 'REVOKED' : valid ? 'VERIFIED' : 'HAJJ MEMENTO';
  const statusColor = revoked
    ? { bg: '#FEF3C7', border: '#F59E0B', fg: '#B45309' }
    : valid
      ? { bg: '#D1FAE5', border: '#10B981', fg: '#065F46' }
      : { bg: '#FAFAF7', border: '#A88B4A', fg: '#7D6530' };

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
          boxSizing: 'border-box',
          border: '8px solid #A88B4A',
          outline: '2px solid #C4A55E',
          outlineOffset: '-14px',
        }}
      >

        {/* TOP: logo */}
        <div style={{ display: 'flex', alignItems: 'center', zIndex: 1, marginTop: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${SITE}/images/logo.png`}
            alt=""
            width={300}
            height={114}
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* CENTER */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 1,
          flex: 1,
          justifyContent: 'center',
          gap: 20,
        }}>
          {/* Status pill */}
          <div style={{
            display: 'flex',
            padding: '10px 30px',
            background: statusColor.bg,
            border: `2px solid ${statusColor.border}`,
            color: statusColor.fg,
            borderRadius: 999,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 3,
          }}>
            {statusLabel}
          </div>

          {/* Big title */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px 70px',
            borderTop:    '4px solid #A88B4A',
            borderBottom: '4px solid #A88B4A',
            background:
              'linear-gradient(to bottom, transparent, rgba(168,139,74,0.08), transparent)',
          }}>
            <p style={{
              margin: 0,
              fontSize: 68,
              fontWeight: 700,
              color: '#7D6530',
              letterSpacing: 2,
              display: 'flex',
              lineHeight: 1.1,
            }}>
              HAJJ MEMENTO
            </p>
            <p style={{
              margin: '8px 0 0',
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
              fontSize: 40,
              color: '#155E6B',
              fontWeight: 700,
              letterSpacing: 5,
              display: 'flex',
            }}>
              HAJJ {hajjYear} AH
            </p>
          )}

          <p style={{
            margin: 0,
            fontSize: 22,
            color: '#7D6530',
            letterSpacing: 4,
            display: 'flex',
          }}>
            BELAD ALHARAMAIN
          </p>
        </div>

        {/* BOTTOM */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          zIndex: 1,
          marginBottom: 6,
          fontSize: 18,
          color: '#7D6530',
        }}>
          <p style={{ margin: 0, fontWeight: 700, letterSpacing: 2, display: 'flex' }}>
            HAJJ AND UMRAH SERVICES
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
