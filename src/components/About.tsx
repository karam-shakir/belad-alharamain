const stats = [
  { icon: 'fa-calendar-check', num: 15,    label_ar: 'سنة خبرة',         label_en: 'Years Experience' },
  { icon: 'fa-users',          num: 50000, label_ar: 'حاج ومعتمر',       label_en: 'Pilgrims Served'  },
  { icon: 'fa-building',       num: 200,   label_ar: 'وكالة شريكة',      label_en: 'Partner Agencies' },
  { icon: 'fa-trophy',         num: 30,    label_ar: 'جائزة تميز',       label_en: 'Excellence Awards'},
];

const mvv = [
  {
    icon: 'fa-eye',
    title_ar: 'رؤيتنا', title_en: 'Vision',
    body_ar:  'أن نكون الشركة الأولى والأكثر ثقةً في خدمات الحج والعمرة الداخلية على مستوى المملكة.',
    body_en:  'To be the leading and most trusted company in domestic Hajj & Umrah services across Saudi Arabia.',
  },
  {
    icon: 'fa-bullseye',
    title_ar: 'رسالتنا', title_en: 'Mission',
    body_ar:  'تقديم تجربة روحانية استثنائية بأعلى معايير الجودة والاحترافية والالتزام بالقيم الإسلامية.',
    body_en:  'Delivering an exceptional spiritual experience with the highest standards of quality, professionalism, and Islamic values.',
  },
  {
    icon: 'fa-gem',
    title_ar: 'قيمنا', title_en: 'Values',
    body_ar:  'الأمانة، الاحترافية، الجودة، الابتكار، والخدمة المتميزة لكل ضيف من ضيوف الرحمن.',
    body_en:  'Integrity, professionalism, quality, innovation, and distinguished service for every pilgrim.',
  },
];

const badges = [
  { icon: 'fa-shield-halved', ar: 'شركة معتمدة', en: 'Certified Company' },
  { icon: 'fa-award',         ar: 'ISO 9001',     en: 'ISO 9001'          },
  { icon: 'fa-star',          ar: 'أفضل شركة',   en: 'Best Company'      },
  { icon: 'fa-check-circle',  ar: 'ضمان الجودة', en: 'Quality Guarantee' },
];

export default function About() {
  return (
    <section id="about" className="section relative bg-pattern py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-16 reveal">
          <span className="inline-block bg-gold text-white text-xs font-bold tracking-widest
                           uppercase px-4 py-1.5 rounded-full mb-4"
                data-ar="من نحن" data-en="About Us">من نحن</span>
          <h2 className="text-3xl sm:text-4xl font-black text-teal-dark mb-4 leading-tight"
              data-ar="شركة بلاد الحرمين للحج والعمرة" data-en="Belad Alharamain Co. Hajj & Umrah">
            شركة بلاد الحرمين<br className="hidden sm:block" /> للحج والعمرة
          </h2>
          <div className="gold-divider"><span><i className="fas fa-mosque" /></span></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* ── Left: Text + MVV ─── */}
          <div className="reveal-right">
            <p className="text-gray-600 leading-relaxed text-base sm:text-lg mb-8 pb-6
                          border-b border-gold/20"
               data-ar="شركة سعودية رائدة متخصصة في خدمات الحج والعمرة الداخلية، تأسست بهدف تقديم تجربة روحانية متكاملة لضيوف الرحمن من مختلف أنحاء العالم، مع الحفاظ على أعلى معايير الجودة والاحترافية."
               data-en="A leading Saudi company specializing in domestic Hajj & Umrah services, established to deliver a comprehensive spiritual experience for pilgrims worldwide while maintaining the highest standards of quality and professionalism.">
              شركة سعودية رائدة متخصصة في خدمات الحج والعمرة الداخلية، تأسست بهدف تقديم تجربة روحانية متكاملة لضيوف الرحمن من مختلف أنحاء العالم، مع الحفاظ على أعلى معايير الجودة والاحترافية.
            </p>

            {/* MVV Cards */}
            <div className="space-y-4" data-stagger>
              {mvv.map((item, i) => (
                <div key={i}
                     className="flex gap-4 p-5 rounded-2xl bg-white border border-gold/15
                                card-premium shadow-card reveal"
                     style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="w-12 h-12 rounded-xl bg-teal-gradient flex items-center
                                  justify-center flex-shrink-0 shadow-teal">
                    <i className={`fas ${item.icon} text-white text-lg`} />
                  </div>
                  <div>
                    <h3 className="font-black text-teal-dark mb-1"
                        data-ar={item.title_ar} data-en={item.title_en}>
                      {item.title_ar}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed"
                       data-ar={item.body_ar} data-en={item.body_en}>
                      {item.body_ar}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Image + Stats ─── */}
          <div className="reveal-left">
            {/* Image placeholder */}
            <div className="relative mb-6">
              <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-teal-gradient
                              flex flex-col items-center justify-center gap-3
                              border-2 border-dashed border-gold/30">
                <i className="fas fa-kaaba text-gold-light/50 text-7xl" />
                <p className="text-white/40 text-sm font-medium"
                   data-ar="[ضع صورة الشركة هنا]" data-en="[Company Image Placeholder]">
                  [ضع صورة الشركة هنا]
                </p>
              </div>
              {/* Badge */}
              <div className="absolute -bottom-4 end-6 bg-gold-gradient text-white
                              px-5 py-2.5 rounded-full shadow-gold font-bold text-sm
                              flex items-center gap-2">
                <i className="fas fa-award text-xs" />
                <span data-ar="+15 سنة خبرة" data-en="+15 Years">+15 سنة خبرة</span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mt-8" data-stagger>
              {stats.map((s, i) => (
                <div key={i}
                     className="bg-white rounded-2xl p-4 text-center border border-gold/15
                                card-premium shadow-card relative overflow-hidden reveal-scale"
                     style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-gold-gradient" />
                  <i className={`fas ${s.icon} text-gold text-xl mb-2 block`} />
                  <div className="flex items-end justify-center gap-0.5">
                    <span data-counter={s.num} className="text-2xl font-black text-teal-dark">0</span>
                    <span className="text-gold font-bold text-base mb-0.5">+</span>
                  </div>
                  <p className="text-xs text-gray-500 font-semibold mt-1"
                     data-ar={s.label_ar} data-en={s.label_en}>
                    {s.label_ar}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-3 mt-16 reveal">
          {badges.map((b, i) => (
            <div key={i}
                 className="flex items-center gap-2.5 bg-white border border-gold/20
                            rounded-full px-5 py-2.5 shadow-card text-sm font-semibold
                            text-teal-dark hover:border-gold/50 transition-colors duration-200">
              <i className={`fas ${b.icon} text-gold`} />
              <span data-ar={b.ar} data-en={b.en}>{b.ar}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
