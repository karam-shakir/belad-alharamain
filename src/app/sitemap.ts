import type { MetadataRoute } from 'next';
import { DUAA_ENABLED } from '@/lib/features';

/* ─────────────────────────────────────────────────────────────
 * sitemap.xml — قائمة الصفحات الرسمية لمحركات البحث
 *
 * هذا الموقع صفحة هبوط واحدة (Single-Page)، لذا يحتوي السايت ماب
 * على الصفحة الرئيسية فقط. أقسام الموقع (#about, #services...)
 * ليست صفحات مستقلة من منظور Google — هي مراسٍ داخل نفس الصفحة.
 *
 * عند إضافة صفحات حقيقية مستقبلاً (مثل /blog أو /umrah-packages)،
 * أضفها هنا.
 *
 * يُقدَّم تلقائياً على:
 *   https://belad-alharamain.com/sitemap.xml
 * ───────────────────────────────────────────────────────────── */

const BASE = 'https://belad-alharamain.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: BASE,                lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/agencies`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/sitemap`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/privacy`,   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/terms`,     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ];
  if (DUAA_ENABLED) {
    entries.push({ url: `${BASE}/duaa`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 });
  }
  return entries;
}
