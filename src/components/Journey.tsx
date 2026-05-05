const steps = [
  { num: '١', icon: 'fa-laptop',          ar: 'التسجيل عبر نسك',  en: 'Register via Nusuk',  desc_ar: 'التسجيل في منصة نسك الرسمية والحصول على تصريح الحج أو العمرة.', desc_en: 'Register on the official Nusuk platform and obtain your permit.' },
  { num: '٢', icon: 'fa-list-check',      ar: 'اختيار الباقة',     en: 'Choose Package',      desc_ar: 'اختيار الباقة المناسبة من قائمة باقاتنا المتنوعة.',              desc_en: 'Select the ideal package from our diverse offerings.' },
  { num: '٣', icon: 'fa-location-pin',    ar: 'التجمع',            en: 'Assembly',            desc_ar: 'التوجه إلى نقطة التجمع المحددة مع فريقنا المتخصص.',              desc_en: 'Head to the designated assembly point with our team.' },
  { num: '٤', icon: 'fa-bus',             ar: 'النقل',             en: 'Transport',           desc_ar: 'نقل آمن ومريح إلى مكة المكرمة والمشاعر المقدسة.',               desc_en: 'Safe and comfortable transport to Makkah and holy sites.' },
  { num: '٥', icon: 'fa-hotel',           ar: 'السكن',             en: 'Accommodation',       desc_ar: 'إقامة مريحة في أفضل الفنادق القريبة من الحرمين.',               desc_en: 'Comfortable stay at the finest hotels near the Two Mosques.' },
  { num: '٦', icon: 'fa-hands-praying',   ar: 'أداء المناسك',      en: 'Performing Rituals',  desc_ar: 'مرافقة مرشدين دينيين لأداء جميع المناسك بشكل صحيح.',            desc_en: 'Accompanied by religious guides for correct ritual performance.' },
  { num: '٧', icon: 'fa-plane-departure', ar: 'العودة',            en: 'Return',              desc_ar: 'توديع مريح مع تيسير جميع إجراءات العودة إلى الوطن.',           desc_en: 'Comfortable farewell with full assistance for the return journey.' },
];

export default function Journey() {
  return (
    <section
      id="journey"
      className="py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0D3D4A 0%, #1F7A8C 50%, #155E6B 100%)' }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M40 5L45.7 26.1L64.7 15.3L53.9 34.3L75 40L53.9 45.7L64.7 64.7L45.7 53.9L40 75L34.3 53.9L15.3 64.7L26.1 45.7L5 40L26.1 34.3L15.3 15.3L34.3 26.1Z' fill='none' stroke='%23A88B4A' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-16 reveal">
          <span className="inline-block bg-white/10 text-gold-light text-xs font-bold
                           tracking-widest uppercase px-4 py-1.5 rounded-full mb-4
                           border border-gold/30"
                data-ar="رحلة الحاج" data-en="Pilgrim Journey">رحلة الحاج</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4"
              data-ar="خطوات رحلتكم المباركة" data-en="Steps of Your Blessed Journey">
            خطوات رحلتكم المباركة
          </h2>
          <p className="text-white/65 max-w-xl mx-auto"
             data-ar="نرافقكم في كل خطوة من رحلتكم الروحانية المباركة"
             data-en="We accompany you at every step of your blessed spiritual journey">
            نرافقكم في كل خطوة من رحلتكم الروحانية المباركة
          </p>
          <div className="gold-divider mt-4"><span className="text-white/40"><i className="fas fa-route" /></span></div>
        </div>

        {/* Desktop: horizontal timeline */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connector line */}
            <div className="timeline-connector" />

            <div className="grid grid-cols-7 gap-4" data-stagger>
              {steps.map((step, i) => (
                <div key={i}
                     className="flex flex-col items-center text-center reveal-scale"
                     style={{ transitionDelay: `${i * 80}ms` }}>
                  {/* Circle */}
                  <div className="relative z-10 w-14 h-14 rounded-full bg-gold-gradient
                                  flex items-center justify-center mb-4 flex-shrink-0
                                  shadow-gold ring-4 ring-gold/20">
                    <span className="text-white font-black text-lg leading-none">{step.num}</span>
                  </div>
                  {/* Card */}
                  <div className="bg-white/8 backdrop-blur-sm border border-white/15
                                  rounded-2xl p-4 w-full hover:bg-white/15 hover:border-gold/40
                                  transition-all duration-300 hover:-translate-y-1 group">
                    <i className={`fas ${step.icon} text-gold text-xl mb-2 block`} />
                    <h4 className="text-white font-bold text-sm mb-1.5"
                        data-ar={step.ar} data-en={step.en}>{step.ar}</h4>
                    <p className="text-white/55 text-xs leading-relaxed"
                       data-ar={step.desc_ar} data-en={step.desc_en}>
                      {step.desc_ar}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="lg:hidden space-y-4">
          {steps.map((step, i) => (
            <div key={i}
                 className="flex gap-4 reveal"
                 style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gold-gradient flex items-center
                                justify-center shadow-gold ring-4 ring-gold/20 flex-shrink-0">
                  <span className="text-white font-black leading-none">{step.num}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gradient-to-b from-gold/50 to-transparent mt-2 min-h-8" />
                )}
              </div>
              <div className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-2xl p-4
                              flex-1 hover:bg-white/15 transition-all duration-200 mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <i className={`fas ${step.icon} text-gold text-lg`} />
                  <h4 className="text-white font-bold" data-ar={step.ar} data-en={step.en}>
                    {step.ar}
                  </h4>
                </div>
                <p className="text-white/55 text-sm leading-relaxed"
                   data-ar={step.desc_ar} data-en={step.desc_en}>
                  {step.desc_ar}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
