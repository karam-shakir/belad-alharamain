import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'خريطة الموقع',
  description: 'خريطة شاملة لكل صفحات موقع شركة بلاد الحرمين للحج والعمرة.',
  alternates: { canonical: 'https://belad-alharamain.com/sitemap' },
};

const sections = [
  {
    title: 'الصفحة الرئيسية',
    icon: 'fa-house',
    links: [
      { href: '/#hero',         label: 'الواجهة الرئيسية' },
      { href: '/#about',        label: 'من نحن' },
      { href: '/#services',     label: 'خدماتنا' },
      { href: '/#journey',      label: 'رحلة الحاج' },
      { href: '/#videos',       label: 'معرض الفيديو' },
      { href: '/#testimonials', label: 'آراء العملاء' },
      { href: '/#awards',       label: 'جوائزنا' },
      { href: '/#agencies',     label: 'للوكالات الخارجية' },
      { href: '/#contact',      label: 'تواصل معنا' },
    ],
  },
  {
    title: 'صفحات مستقلة',
    icon: 'fa-file-lines',
    links: [
      { href: '/agencies', label: 'صفحة تسجيل الوكالات' },
    ],
  },
  {
    title: 'صفحات قانونية',
    icon: 'fa-scale-balanced',
    links: [
      { href: '/privacy', label: 'سياسة الخصوصية' },
      { href: '/terms',   label: 'الشروط والأحكام' },
      { href: '/sitemap', label: 'خريطة الموقع' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <LegalPage
      title="خريطة الموقع"
      subtitle="دليل شامل لجميع صفحات وأقسام موقع شركة بلاد الحرمين للحج والعمرة."
    >
      {sections.map((s, i) => (
        <div key={i} className={i < sections.length - 1 ? 'mb-8' : ''}>
          <h2>
            <i className={`fas ${s.icon} text-gold`} />
            {s.title}
          </h2>
          <ul className="!list-none !ps-0 !space-y-2">
            {s.links.map(l => (
              <li key={l.href} className="!leading-none">
                <a href={l.href}
                   className="inline-flex items-center gap-2 py-2 px-3 rounded-lg
                              bg-cream/60 hover:bg-gold/10 transition-colors duration-200
                              text-teal-dark hover:text-gold-dark font-semibold !text-current">
                  <i className="fas fa-chevron-left text-xs text-gold" />
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <p className="text-sm text-gray-500 mt-8 pt-6 border-t border-gold/15">
        <i className="fas fa-circle-info text-gold me-2" />
        نسخة XML لمحركات البحث متوفّرة على
        <a href="/sitemap.xml" className="mx-1">/sitemap.xml</a>.
      </p>
    </LegalPage>
  );
}
