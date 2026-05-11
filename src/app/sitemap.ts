import type { MetadataRoute } from 'next';

/* ─────────────────────────────────────────────────────────────
 * sitemap.xml — قائمة بكل الأقسام لمحركات البحث
 * Auto-served at: https://belad-alharamain.com/sitemap.xml
 * ───────────────────────────────────────────────────────────── */

const BASE = 'https://belad-alharamain.com';

// Sections rendered as anchors on the single landing page
const sections = ['', 'about', 'services', 'journey', 'videos', 'awards', 'agencies', 'contact'];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return sections.map((s) => ({
    url: s ? `${BASE}/#${s}` : BASE,
    lastModified,
    changeFrequency: 'monthly',
    priority: s === '' ? 1.0 : 0.8,
  }));
}
