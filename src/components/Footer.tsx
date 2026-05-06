import Image from 'next/image';

const quickLinks = [
  { href: '#about',    ar: 'من نحن',           en: 'About Us'        },
  { href: '#services', ar: 'خدماتنا',          en: 'Services'        },
  { href: '#journey',  ar: 'رحلة الحاج',       en: 'Pilgrim Journey' },
  { href: '#videos',   ar: 'معرض الفيديو',     en: 'Video Gallery'   },
  { href: '#awards',   ar: 'جوائزنا',          en: 'Our Awards'      },
  { href: '#agencies', ar: 'للوكالات الخارجية', en: 'External Agencies'},
];

const services = [
  { ar: 'باقات الحج الداخلية',  en: 'Domestic Hajj'   },
  { ar: 'خدمات العمرة',         en: 'Umrah Services'  },
  { ar: 'الخدمات الفاخرة VIP',  en: 'VIP Services'    },
  { ar: 'النقل والتفويج',        en: 'Transportation'  },
  { ar: 'خدمات الضيافة',        en: 'Hospitality'     },
  { ar: 'الدعم الميداني',        en: 'Field Support'   },
];

const socials = [
  { icon: 'fa-x-twitter',  label: 'X (Twitter)'  },
  { icon: 'fa-instagram',  label: 'Instagram'     },
  { icon: 'fa-facebook-f', label: 'Facebook'      },
  { icon: 'fa-youtube',    label: 'YouTube'       },
  { icon: 'fa-linkedin-in',label: 'LinkedIn'      },
  { icon: 'fa-tiktok',     label: 'TikTok'        },
];

export default function Footer() {
  return (
    <footer className="bg-teal-dark text-white/75">

      {/* Gold accent bar */}
      <div className="h-1 bg-gold-gradient" />

      {/* Top */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="inline-block bg-white/95 rounded-xl px-3 py-2 mb-5 shadow-gold">
              <Image
                src="/images/logo.png"
                alt="شركة بلاد الحرمين للحج والعمرة"
                width={220}
                height={80}
                className="h-14 w-auto object-contain"
              />
            </div>
            <p className="text-sm leading-relaxed mb-5 text-white/55"
               data-ar="نخدم ضيوف الرحمن بشغف واحترافية منذ أكثر من 15 عاماً."
               data-en="Serving pilgrims with passion and professionalism for over 15 years.">
              نخدم ضيوف الرحمن بشغف واحترافية منذ أكثر من 15 عاماً.
            </p>
            <div className="flex gap-2">
              {socials.map(s => (
                <a key={s.icon}
                   href="#"
                   aria-label={s.label}
                   className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center
                              text-white/60 hover:bg-gold hover:text-white
                              transition-all duration-200 hover:-translate-y-0.5 text-sm">
                  <i className={`fab ${s.icon}`} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-gold-light font-bold text-sm mb-4 pb-2
                           border-b border-white/10"
                data-ar="روابط سريعة" data-en="Quick Links">روابط سريعة</h4>
            <ul className="space-y-2">
              {quickLinks.map(l => (
                <li key={l.href}>
                  <a href={l.href}
                     className="text-sm text-white/55 hover:text-gold-light
                                transition-colors duration-200 flex items-center gap-1.5
                                hover:gap-2.5"
                     data-ar={l.ar} data-en={l.en}>
                    <i className="fas fa-chevron-left text-xs text-gold/50" />
                    {l.ar}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-gold-light font-bold text-sm mb-4 pb-2
                           border-b border-white/10"
                data-ar="خدماتنا" data-en="Services">خدماتنا</h4>
            <ul className="space-y-2">
              {services.map(s => (
                <li key={s.ar}>
                  <a href="#services"
                     className="text-sm text-white/55 hover:text-gold-light
                                transition-colors duration-200 flex items-center gap-1.5
                                hover:gap-2.5"
                     data-ar={s.ar} data-en={s.en}>
                    <i className="fas fa-chevron-left text-xs text-gold/50" />
                    {s.ar}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gold-light font-bold text-sm mb-4 pb-2
                           border-b border-white/10"
                data-ar="تواصل معنا" data-en="Contact">تواصل معنا</h4>
            <ul className="space-y-3 text-sm">
              {[
                { icon: 'fa-location-dot', text_ar: 'مكة المكرمة، المملكة العربية السعودية', text_en: 'Makkah, Saudi Arabia' },
                { icon: 'fa-phone',        text_ar: '+966 5X XXX XXXX',                       text_en: '+966 5X XXX XXXX',    ltr: true },
                { icon: 'fa-envelope',     text_ar: 'info@belad-haramain.com',                text_en: 'info@belad-haramain.com', ltr: true },
              ].map((c, i) => (
                <li key={i} className="flex items-start gap-2.5 text-white/55">
                  <i className={`fas ${c.icon} text-gold mt-0.5 flex-shrink-0`} />
                  <span dir={c.ltr ? 'ltr' : undefined}
                        data-ar={c.text_ar} data-en={c.text_en}>
                    {c.text_ar}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { ar: 'معتمد', en: 'Certified', icon: 'fa-shield-halved' },
                { ar: 'ISO 9001', en: 'ISO 9001', icon: 'fa-award' },
              ].map(b => (
                <span key={b.ar}
                      className="inline-flex items-center gap-1.5 bg-gold/15 border border-gold/25
                                 text-gold-light text-xs font-semibold px-2.5 py-1 rounded-full">
                  <i className={`fas ${b.icon} text-[10px]`} />
                  <span data-ar={b.ar} data-en={b.en}>{b.ar}</span>
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/8 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row
                        items-center justify-between gap-3 text-xs text-white/40">
          <p data-ar="© 2025 بلاد الحرمين للحج والعمرة. جميع الحقوق محفوظة."
             data-en="© 2025 Belad Alharamain Hajj & Umrah. All rights reserved.">
            © 2025 بلاد الحرمين للحج والعمرة. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-3">
            {[
              { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
              { ar: 'الشروط والأحكام', en: 'Terms & Conditions' },
              { ar: 'خريطة الموقع',   en: 'Sitemap' },
            ].map((l, i) => (
              <span key={i} className="flex items-center gap-3">
                {i > 0 && <span className="text-white/20">|</span>}
                <a href="#" className="hover:text-gold-light transition-colors duration-200"
                   data-ar={l.ar} data-en={l.en}>{l.ar}</a>
              </span>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}
