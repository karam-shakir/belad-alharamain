import { services } from '@/content/site';

export default function Services() {
  return (
    <section id="services" className="py-24 bg-pattern-white relative overflow-hidden">

      {/* Decorative circle */}
      <div className="absolute -top-32 -start-32 w-96 h-96 rounded-full
                      bg-gold/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -end-32 w-96 h-96 rounded-full
                      bg-teal/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-14 reveal">
          <span className="inline-block bg-teal text-white text-xs font-bold tracking-widest
                           uppercase px-4 py-1.5 rounded-full mb-4"
                data-ar="خدماتنا" data-en="Services">خدماتنا</span>
          <h2 className="text-3xl sm:text-4xl font-black text-teal-dark mb-4"
              data-ar="باقاتنا وخدماتنا المتميزة" data-en="Our Premium Services">
            باقاتنا وخدماتنا المتميزة
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed"
             data-ar="نقدم مجموعة شاملة من الخدمات لضمان تجربة روحانية لا تُنسى"
             data-en="We offer a comprehensive range of services to ensure an unforgettable spiritual experience">
            نقدم مجموعة شاملة من الخدمات لضمان تجربة روحانية لا تُنسى
          </p>
          <div className="gold-divider"><span><i className="fas fa-star" /></span></div>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6" data-stagger>
          {services.map((svc, i) => (
            <div
              key={i}
              className={`relative bg-white rounded-3xl p-5 sm:p-7 border shadow-card
                          card-premium overflow-hidden group reveal-scale
                          ${svc.featured
                            ? 'border-gold/40 ring-1 ring-gold/20'
                            : 'border-gold/10'
                          }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* Featured badge */}
              {svc.featured && (
                <div className="absolute top-4 start-4 bg-gold text-white text-[10px]
                                font-bold tracking-wider px-2.5 py-1 rounded-full uppercase"
                     data-ar="الأكثر طلباً" data-en="Most Popular">
                  الأكثر طلباً
                </div>
              )}

              {/* Top accent line */}
              <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${svc.color}`} />

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${svc.color}
                               flex items-center justify-center mb-5 shadow-lg
                               group-hover:scale-110 transition-transform duration-300`}>
                <i className={`fas ${svc.icon} text-white text-2xl`} />
              </div>

              {/* Content */}
              <h3 className="text-lg font-black text-teal-dark mb-3"
                  data-ar={svc.title.ar} data-en={svc.title.en}>
                {svc.title.ar}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-5"
                 data-ar={svc.body.ar} data-en={svc.body.en}>
                {svc.body.ar}
              </p>

              {/* Link */}
              <a href="#contact"
                 className={`inline-flex items-center gap-1.5 text-sm font-bold
                   transition-all duration-200
                   ${svc.accent === 'gold'
                     ? 'text-gold hover:text-gold-dark'
                     : 'text-teal hover:text-teal-dark'
                   }`}
                 data-ar="اعرف المزيد" data-en="Learn More">
                اعرف المزيد
                <i className="fas fa-arrow-left text-xs
                               group-hover:-translate-x-1 transition-transform duration-200" />
              </a>

              {/* Hover corner accent */}
              <div className={`absolute bottom-0 end-0 w-20 h-20 rounded-tl-full
                               opacity-0 group-hover:opacity-100 transition-opacity duration-300
                               bg-gradient-to-tl ${svc.color} opacity-5`} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 reveal">
          <a href="#contact"
             className="inline-flex items-center gap-2 bg-teal hover:bg-teal-light
                        text-white font-bold px-8 py-3.5 rounded-full transition-all
                        duration-300 hover:-translate-y-1 shadow-teal hover:shadow-teal-lg"
             data-ar="استفسر عن الباقات" data-en="Inquire About Packages">
            <i className="fas fa-paper-plane" />
            استفسر عن الباقات
          </a>
        </div>

      </div>
    </section>
  );
}
