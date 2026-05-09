'use client';

import Image from 'next/image';
import { hero } from '@/content/site';

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background:
          'linear-gradient(160deg, rgba(6,25,30,0.92) 0%, rgba(15,60,72,0.85) 50%, rgba(5,18,22,0.95) 100%), url("https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=1920&q=80") center/cover no-repeat',
      }}
    >
      {/* Hajj calligraphy pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: `url("/images/hajj-pattern.png")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '180px auto',
        }}
      />

      {/* Gold vignette top */}
      <div className="absolute top-0 inset-x-0 h-px bg-gold/30" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-24 pb-20 sm:py-28">

        {/* Bismillah */}
        <div className="bismillah-line mb-8 reveal" style={{ transitionDelay: '0ms' }}>
          <span className="text-gold-light/80 tracking-widest text-xs font-medium">
            ﷽
          </span>
        </div>

        {/* Company Logo */}
        <div className="flex justify-center mb-10 reveal" style={{ transitionDelay: '100ms' }}>
          <div className="relative inline-flex items-center justify-center
                          animate-[float_5s_ease-in-out_infinite]">
            {/* Soft radial glow */}
            <div className="absolute inset-[-30px] rounded-full pointer-events-none"
                 style={{
                   background:
                     'radial-gradient(circle, rgba(168,139,74,0.32) 0%, rgba(168,139,74,0.10) 40%, transparent 70%)',
                   filter: 'blur(8px)',
                 }} />
            <Image
              src="/images/logo.png"
              alt="شركة بلاد الحرمين للحج والعمرة"
              width={420}
              height={320}
              priority
              className="relative w-auto h-32 sm:h-44 md:h-56 object-contain drop-shadow-[0_8px_30px_rgba(0,0,0,0.45)]"
            />
          </div>
        </div>

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
                        font-bold px-5 sm:px-7 py-3 sm:py-3.5 rounded-full transition-all duration-300 text-sm sm:text-base
                        hover:-translate-y-1 shadow-gold hover:shadow-gold-lg"
             data-ar="احجز الآن" data-en="Book Now">
            <i className="fas fa-pen-to-square" />
            احجز الآن
          </a>
          <a href="#contact"
             className="flex items-center gap-2 border-2 border-white/40 hover:border-white
                        text-white font-bold px-5 sm:px-7 py-3 sm:py-3.5 rounded-full transition-all duration-300 text-sm sm:text-base
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
          {hero.stats.map((s, i) => (
            <div key={i}
                 className={`flex flex-col items-center px-3 sm:px-6 py-3 sm:py-4
                   ${i < hero.stats.length - 1 ? 'border-e border-white/15' : ''}`}>
              <div className="text-gold-light font-black text-xl sm:text-3xl leading-none">
                <span data-counter={s.num}>0</span>
                <span className="text-gold text-base sm:text-lg">{s.suffix}</span>
              </div>
              <div className="text-white/60 text-[10px] sm:text-xs mt-1 font-medium whitespace-nowrap"
                   data-ar={s.label.ar} data-en={s.label.en}>
                {s.label.ar}
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
