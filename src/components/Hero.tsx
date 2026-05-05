export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background:
          'linear-gradient(160deg, rgba(6,25,30,0.94) 0%, rgba(15,60,72,0.88) 50%, rgba(5,18,22,0.96) 100%), url("https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=1920&q=80") center/cover no-repeat',
      }}
    >
      {/* Islamic geometric overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cpath d='M50 6L57.1 32.6L80.9 19.1L67.4 42.9L94 50L67.4 57.1L80.9 80.9L57.1 67.4L50 94L42.9 67.4L19.1 80.9L32.6 57.1L6 50L32.6 42.9L19.1 19.1L42.9 32.6Z' fill='none' stroke='%23A88B4A' stroke-width='0.7'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px',
        }}
      />

      {/* Gold vignette top */}
      <div className="absolute top-0 inset-x-0 h-px bg-gold/30" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-28">

        {/* Bismillah */}
        <div className="bismillah-line mb-8 reveal" style={{ transitionDelay: '0ms' }}>
          <span className="text-gold-light/80 tracking-widest text-xs font-medium">
            ﷽
          </span>
        </div>

        {/* Logo placeholder */}
        <div className="flex justify-center mb-8 reveal" style={{ transitionDelay: '100ms' }}>
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-teal-gradient
                            flex items-center justify-center
                            ring-2 ring-gold/40 ring-offset-4 ring-offset-transparent
                            shadow-[0_0_60px_rgba(168,139,74,0.3)]
                            animate-[float_4s_ease-in-out_infinite]">
              {/* Replace the icon below with <Image> once you have the actual logo */}
              <i className="fas fa-kaaba text-gold-light text-5xl" />
            </div>
            {/* Orbiting ring */}
            <div className="absolute inset-[-8px] rounded-full border border-gold/20
                            animate-[spin_12s_linear_infinite]"
                 style={{ borderStyle: 'dashed' }} />
          </div>
        </div>

        {/* Company name */}
        <p className="text-gold-light/90 text-sm sm:text-base font-semibold tracking-[0.15em]
                      uppercase mb-3 reveal" style={{ transitionDelay: '150ms' }}>
          Belad Alharamain Co. Hajj &amp; Umrah L.L.C
        </p>

        {/* Arabic headline */}
        <h1 className="text-white font-black leading-tight mb-6 reveal"
            style={{ fontSize: 'clamp(2rem, 5.5vw, 3.6rem)', transitionDelay: '200ms' }}>
          نخدم ضيوف الرحمن
          <span className="block shimmer-text">بشغف واحترافية</span>
        </h1>

        {/* Subtitle */}
        <p className="text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed reveal"
           style={{ fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', transitionDelay: '250ms' }}
           data-ar="شركة سعودية رائدة متخصصة في خدمات الحج والعمرة الداخلية — نضمن تجربة روحانية فريدة بأعلى معايير الجودة والأمان والضيافة الفاخرة"
           data-en="A leading Saudi company specializing in domestic Hajj & Umrah services — guaranteeing a unique spiritual experience with the highest standards of quality, safety, and premium hospitality">
          شركة سعودية رائدة متخصصة في خدمات الحج والعمرة الداخلية — نضمن تجربة روحانية فريدة بأعلى معايير الجودة والأمان والضيافة الفاخرة
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-14 reveal"
             style={{ transitionDelay: '300ms' }}>
          <a href="#contact"
             onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
             className="flex items-center gap-2 bg-gold hover:bg-gold-light text-white
                        font-bold px-7 py-3.5 rounded-full transition-all duration-300
                        hover:-translate-y-1 shadow-gold hover:shadow-gold-lg"
             data-ar="احجز الآن" data-en="Book Now">
            <i className="fas fa-pen-to-square" />
            احجز الآن
          </a>
          <a href="#contact"
             className="flex items-center gap-2 border-2 border-white/40 hover:border-white
                        text-white font-bold px-7 py-3.5 rounded-full transition-all duration-300
                        hover:bg-white/10 hover:-translate-y-1 backdrop-blur-sm"
             data-ar="تواصل معنا" data-en="Contact Us">
            <i className="fas fa-phone" />
            تواصل معنا
          </a>
          <a href="#agencies"
             className="flex items-center gap-2 border-2 border-teal/60 hover:border-teal-light
                        text-teal-light hover:text-white font-bold px-7 py-3.5 rounded-full
                        transition-all duration-300 hover:bg-teal/30 hover:-translate-y-1 backdrop-blur-sm"
             data-ar="للوكالات الخارجية" data-en="External Agencies">
            <i className="fas fa-handshake" />
            للوكالات الخارجية
          </a>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-px reveal"
             style={{ transitionDelay: '350ms' }}>
          {[
            { num: 15,    suffix: '+', label_ar: 'سنة خبرة',      label_en: 'Years' },
            { num: 50000, suffix: '+', label_ar: 'حاج ومعتمر',    label_en: 'Pilgrims' },
            { num: 200,   suffix: '+', label_ar: 'وكالة شريكة',   label_en: 'Agencies' },
            { num: 30,    suffix: '+', label_ar: 'جائزة تميز',    label_en: 'Awards' },
          ].map((s, i) => (
            <div key={i}
                 className={`flex flex-col items-center px-6 py-4
                   ${i < 3 ? 'border-e border-white/15' : ''}`}>
              <div className="text-gold-light font-black text-2xl sm:text-3xl leading-none">
                <span data-counter={s.num}>0</span>
                <span className="text-gold text-lg">{s.suffix}</span>
              </div>
              <div className="text-white/60 text-xs mt-1 font-medium"
                   data-ar={s.label_ar} data-en={s.label_en}>
                {s.label_ar}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Scroll indicator */}
      <a href="#about"
         className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center
                    gap-1.5 text-white/40 hover:text-gold-light transition-colors duration-200
                    animate-[bounceSlow_2s_ease-in-out_infinite]">
        <span className="text-xs tracking-widest font-medium"
              data-ar="اكتشف المزيد" data-en="Discover">اكتشف المزيد</span>
        <i className="fas fa-chevron-down text-sm" />
      </a>
    </section>
  );
}
