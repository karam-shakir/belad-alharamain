import Image from 'next/image';
import { testimonials, testimonialsConfig } from '@/content/site';

/* Generate initials from an Arabic/English name (first letter of first 2 words) */
function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map(w => w[0] ?? '').join('');
}

/* Deterministic color from name (so each avatar keeps a stable hue) */
function avatarColor(name: string): string {
  const colors = [
    'bg-gradient-to-br from-gold-dark to-gold',
    'bg-gradient-to-br from-teal-dark to-teal',
    'bg-gradient-to-br from-gold to-gold-light',
    'bg-gradient-to-br from-teal to-teal-light',
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return colors[Math.abs(h) % colors.length];
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-pattern-white relative overflow-hidden">

      {/* Decorative blobs */}
      <div className="absolute -top-32 -start-32 w-96 h-96 rounded-full
                      bg-gold/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -end-32 w-96 h-96 rounded-full
                      bg-teal/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">

        {/* Header */}
        <div className="text-center mb-14 reveal">
          <span className="inline-block bg-gold text-white text-xs font-bold tracking-widest
                           uppercase px-4 py-1.5 rounded-full mb-4"
                data-ar="آراء عملائنا" data-en="Pilgrim Testimonials">آراء عملائنا</span>
          <h2 className="text-3xl sm:text-4xl font-black text-teal-dark mb-4"
              data-ar="ماذا قال ضيوف الرحمن عنّا؟" data-en="What Pilgrims Say About Us">
            ماذا قال ضيوف الرحمن عنّا؟
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto"
             data-ar="شهادات صادقة من حجاج ومعتمرين خدمناهم في رحلاتهم المباركة"
             data-en="Honest testimonials from pilgrims we have served on their blessed journeys">
            شهادات صادقة من حجاج ومعتمرين خدمناهم في رحلاتهم المباركة
          </p>
          <div className="gold-divider"><span><i className="fas fa-quote-right" /></span></div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6 max-w-5xl mx-auto" data-stagger>
          {testimonials.map((t, i) => (
            <div key={i}
                 className="relative bg-white rounded-3xl p-6 sm:p-7 border border-gold/15
                            shadow-card card-premium reveal-scale group overflow-hidden"
                 style={{ transitionDelay: `${i * 80}ms` }}>

              {/* Gold accent corner */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gold-gradient" />

              {/* Large quote icon (decorative) */}
              <i className="fas fa-quote-right absolute top-5 end-5 text-gold/10 text-5xl
                            group-hover:text-gold/15 transition-colors duration-300" />

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <i key={idx}
                     className={`fas fa-star text-sm
                       ${idx < t.rating ? 'text-gold' : 'text-gold/20'}`} />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 leading-loose text-sm sm:text-[15px] mb-6 relative z-10"
                 data-ar={t.quote.ar} data-en={t.quote.en}>
                «{t.quote.ar}»
              </p>

              {/* Person */}
              <div className="flex items-center gap-3 pt-4 border-t border-gold/15">
                {t.image ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0
                                  ring-2 ring-gold/30 ring-offset-2 ring-offset-white">
                    <Image
                      src={t.image}
                      alt={t.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className={`w-12 h-12 rounded-full ${avatarColor(t.name)}
                                   flex items-center justify-center flex-shrink-0
                                   text-white font-black text-base
                                   ring-2 ring-gold/30 ring-offset-2 ring-offset-white`}>
                    {initials(t.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-black text-teal-dark text-sm leading-tight truncate">
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1.5"
                     data-ar={t.country.ar} data-en={t.country.en}>
                    <span className="text-base leading-none">{t.flag}</span>
                    <span>{t.country.ar}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Watch full video CTA */}
        {testimonialsConfig.videoUrl && (
          <div className="text-center mt-12 reveal">
            <a href={testimonialsConfig.videoUrl}
               target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 bg-teal hover:bg-teal-light
                          text-white font-bold px-7 py-3.5 rounded-full transition-all
                          duration-300 hover:-translate-y-1 shadow-teal hover:shadow-teal-lg"
               data-ar="شاهد الفيديو الكامل" data-en="Watch the Full Video">
              <i className="fab fa-youtube text-lg" />
              شاهد الفيديو الكامل
            </a>
          </div>
        )}

      </div>
    </section>
  );
}
