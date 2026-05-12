import { ImageResponse } from 'next/og';

/* Generates favicon.ico equivalent at build time.
 * Renders a small branded square with the gold "ب" of "بلاد".
 * 32×32 SVG-quality PNG.
 */
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';
export const runtime = 'edge';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #155E6B 0%, #1F7A8C 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#C4A55E',
          fontSize: 22,
          fontWeight: 900,
          borderRadius: 6,
        }}
      >
        ب
      </div>
    ),
    { ...size },
  );
}
