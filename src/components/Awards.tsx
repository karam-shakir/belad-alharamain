const awards = [
  { icon: 'fa-trophy',        year: '2024', title_ar: 'جائزة أفضل شركة خدمات حج',      title_en: 'Best Hajj Services Company',      org_ar: 'وزارة الحج والعمرة',            org_en: 'Ministry of Hajj & Umrah',            color: 'from-gold-dark to-gold' },
  { icon: 'fa-medal',         year: '2023', title_ar: 'جائزة التميز في خدمة العملاء',  title_en: 'Customer Service Excellence',     org_ar: 'الهيئة السعودية للجودة',         org_en: 'Saudi Quality Authority',             color: 'from-teal-dark to-teal' },
  { icon: 'fa-star',          year: '2023', title_ar: 'شركة العام — السياحة الدينية',  title_en: 'Company of the Year',             org_ar: 'مجلس الغرف السعودية',            org_en: 'Council of Saudi Chambers',           color: 'from-gold-dark to-gold' },
  { icon: 'fa-certificate',   year: '2022', title_ar: 'جائزة الابتكار في قطاع الحج',  title_en: 'Innovation in Hajj Sector',       org_ar: 'الرابطة العالمية لشركات الحج',   org_en: 'Global Hajj Companies Association',   color: 'from-teal-dark to-teal' },
  { icon: 'fa-award',         year: '2022', title_ar: 'شهادة الجودة ISO 9001',         title_en: 'ISO 9001 Quality Certificate',    org_ar: 'المنظمة الدولية للمعايير',       org_en: 'International Organization for Standardization', color: 'from-gold-dark to-gold' },
  { icon: 'fa-shield-halved', year: '2021', title_ar: 'جائزة الشركة الأكثر ثقة',      title_en: 'Most Trusted Company Award',      org_ar: 'اتحاد وكالات السفر العربية',     org_en: 'Arab Travel Agencies Union',          color: 'from-teal-dark to-teal' },
];

export default function Awards() {
  return (
    <section
      id="awards"
      className="py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0D3D4A 0%, #1F7A8C 60%, #0D3D4A 100%)' }}
    >
      {/* Radial glows */}
      <div className="absolute top-1/4 start-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 end-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-14 reveal">
          <span className="inline-block bg-gold/20 text-gold-light text-xs font-bold
                           tracking-widest uppercase px-4 py-1.5 rounded-full mb-4
                           border border-gold/30"
                data-ar="جوائزنا" data-en="Awards">جوائزنا</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4"
              data-ar="التميز والاعتراف الدولي" data-en="Excellence & Recognition">
            التميز والاعتراف الدولي
          </h2>
          <p className="text-white/60 max-w-xl mx-auto"
             data-ar="جوائز وشهادات تقدير تعكس التزامنا بالتميز في خدمة ضيوف الرحمن"
             data-en="Awards and certificates reflecting our commitment to excellence in serving pilgrims">
            جوائز وشهادات تقدير تعكس التزامنا بالتميز في خدمة ضيوف الرحمن
          </p>
          <div className="gold-divider mt-4"><span><i className="fas fa-trophy text-gold" /></span></div>
        </div>

        {/* Awards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" data-stagger>
          {awards.map((award, i) => (
            <div key={i}
                 className="award-card relative bg-white/8 backdrop-blur-sm border border-white/15
                            rounded-3xl p-7 text-center hover:border-gold/50
                            hover:bg-white/15 transition-all duration-300 hover:-translate-y-2
                            overflow-hidden reveal-scale group"
                 style={{ transitionDelay: `${i * 80}ms` }}>

              {/* Top bar */}
              <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${award.color}`} />

              {/* Icon */}
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${award.color}
                               flex items-center justify-center mx-auto mb-4
                               shadow-[0_0_20px_rgba(168,139,74,0.4)]
                               group-hover:scale-110 transition-transform duration-300`}>
                <i className={`fas ${award.icon} text-white text-2xl`} />
              </div>

              {/* Year badge */}
              <span className="inline-block bg-gold/20 text-gold-light text-xs font-bold
                               px-3 py-0.5 rounded-full mb-3 border border-gold/30">
                {award.year}
              </span>

              {/* Title */}
              <h3 className="text-white font-black text-base leading-snug mb-2"
                  data-ar={award.title_ar} data-en={award.title_en}>
                {award.title_ar}
              </h3>

              {/* Org */}
              <p className="text-white/50 text-sm italic"
                 data-ar={award.org_ar} data-en={award.org_en}>
                {award.org_ar}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
