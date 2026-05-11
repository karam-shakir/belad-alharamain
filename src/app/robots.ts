import type { MetadataRoute } from 'next';

/* ─────────────────────────────────────────────────────────────
 * robots.txt — يخبر محركات البحث أن كل الصفحات قابلة للأرشفة
 * Auto-served at: https://belad-alharamain.com/robots.txt
 * ───────────────────────────────────────────────────────────── */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: 'https://belad-alharamain.com/sitemap.xml',
    host: 'https://belad-alharamain.com',
  };
}
