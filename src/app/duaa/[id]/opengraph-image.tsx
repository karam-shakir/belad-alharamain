import { ImageResponse } from 'next/og';
import { getDuaa } from '@/lib/duaa';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'A Prayer Request — Belad Alharamain';

const SITE = 'https://belad-alharamain.com';

/* Dynamic OG image for /duaa/[id] — pure ASCII for Satori reliability.
 * The Arabic duaa text is delivered via og:description and social
 * platforms render it as text where Arabic shaping works correctly. */
export default async function Image({ params }: { params: { id: string } }) {
  let duaa: Awaited<ReturnType<typeof getDuaa>> = null;
  try { duaa = await getDuaa(params.id); } catch { /* ignore */ }

  const reactCount = duaa?.reactionCount ?? 0;

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
            width={280}
            height={108}
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
          gap: 22,
        }}>
          {/* Big hands emoji */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 130, height: 130,
            borderRadius: 999,
            background: 'linear-gradient(135deg, #A88B4A 0%, #7D6530 100%)',
            color: '#FFF',
            fontSize: 80,
            boxShadow: '0 8px 24px rgba(168,139,74,0.35)',
          }}>
            🤲
          </div>

          {/* Big title */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px 60px',
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
              letterSpacing: 4,
              display: 'flex',
              lineHeight: 1.05,
            }}>
              PRAYER REQUEST
            </p>
            <p style={{
              margin: '6px 0 0',
              fontSize: 20,
              color: '#A88B4A',
              letterSpacing: 6,
              display: 'flex',
            }}>
              JOIN US IN DUAA
            </p>
          </div>

          {/* Reaction count badge */}
          {reactCount > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 28px',
              background: '#D1FAE5',
              border: '2px solid #10B981',
              borderRadius: 999,
              fontSize: 24,
              fontWeight: 700,
              color: '#065F46',
            }}>
              <span>🤲</span>
              <span>{reactCount} {reactCount === 1 ? 'PERSON PRAYED' : 'PEOPLE PRAYED'}</span>
            </div>
          )}

          <p style={{
            margin: 0,
            fontSize: 22,
            color: '#7D6530',
            letterSpacing: 4,
            display: 'flex',
          }}>
            BELAD ALHARAMAIN · PRAYER WALL
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
            belad-alharamain.com
          </p>
        </div>
      </div>
    ),
    size,
  );
}
