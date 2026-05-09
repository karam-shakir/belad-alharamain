import { about } from '@/content/site';

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
               data-ar={about.description.ar} data-en={about.description.en}>
              {about.description.ar}
            </p>

            {/* MVV Cards */}
            <div className="space-y-4" data-stagger>
              {about.mvv.map((item, i) => (
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
                        data-ar={item.title.ar} data-en={item.title.en}>
                      {item.title.ar}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed"
                       data-ar={item.body.ar} data-en={item.body.en}>
                      {item.body.ar}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Image + Stats ─── */}
          <div className="reveal-left">
            {/* Image / Placeholder */}
            <div className="relative mb-6">
              <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-teal-gradient
                              flex flex-col items-center justify-center gap-3
                              border-2 border-dashed border-gold/30">
                {about.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={about.image} alt="عن الشركة"
                       className="w-full h-full object-cover" />
                ) : (
                  <>
                    <i className="fas fa-kaaba text-gold-light/50 text-7xl" />
                    <p className="text-white/40 text-sm font-medium"
                       data-ar="[ضع صورة الشركة هنا]" data-en="[Company Image Placeholder]">
                      [ضع صورة الشركة هنا]
                    </p>
                  </>
                )}
              </div>
              {/* Badge */}
              <div className="absolute -bottom-4 end-6 bg-gold-gradient text-white
                              px-5 py-2.5 rounded-full shadow-gold font-bold text-sm
                              flex items-center gap-2">
                <i className="fas fa-award text-xs" />
                <span data-ar={about.experienceBadge.ar} data-en={about.experienceBadge.en}>
                  {about.experienceBadge.ar}
                </span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mt-8" data-stagger>
              {about.stats.map((s, i) => (
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
                     data-ar={s.label.ar} data-en={s.label.en}>
                    {s.label.ar}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-3 mt-16 reveal">
          {about.badges.map((b, i) => (
            <div key={i}
                 className="flex items-center gap-2.5 bg-white border border-gold/20
                            rounded-full px-5 py-2.5 shadow-card text-sm font-semibold
                            text-teal-dark hover:border-gold/50 transition-colors duration-200">
              <i className={`fas ${b.icon} text-gold`} />
              <span data-ar={b.label.ar} data-en={b.label.en}>{b.label.ar}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
