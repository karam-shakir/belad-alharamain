'use client';

import { useState } from 'react';
import { faq } from '@/content/site';

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);  // first question expanded by default

  return (
    <section id="faq" className="py-24 bg-pattern-white relative overflow-hidden">

      <div className="absolute -top-32 -end-32 w-96 h-96 rounded-full bg-gold/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -start-32 w-96 h-96 rounded-full bg-teal/5 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">

        {/* Header */}
        <div className="text-center mb-12 reveal">
          <span className="inline-block bg-teal text-white text-xs font-bold tracking-widest
                           uppercase px-4 py-1.5 rounded-full mb-4"
                data-ar="الأسئلة الشائعة" data-en="FAQ">الأسئلة الشائعة</span>
          <h2 className="text-3xl sm:text-4xl font-black text-teal-dark mb-4"
              data-ar="هل لديك سؤال؟ إجابتنا هنا" data-en="Got a Question? We've Got Answers">
            هل لديك سؤال؟ إجابتنا هنا
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed"
             data-ar="إجابات على أكثر الأسئلة شيوعاً حول خدمات الحج والعمرة لدينا"
             data-en="Answers to the most common questions about our Hajj & Umrah services">
            إجابات على أكثر الأسئلة شيوعاً حول خدمات الحج والعمرة لدينا
          </p>
          <div className="gold-divider"><span><i className="fas fa-circle-question" /></span></div>
        </div>

        {/* Accordion */}
        <div className="space-y-3 reveal">
          {faq.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i}
                   className={`bg-white rounded-2xl border shadow-card transition-all duration-300
                     ${isOpen ? 'border-gold/40 shadow-lg' : 'border-gold/10'}`}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center gap-3 px-5 py-4 sm:px-6 sm:py-5
                             text-start group"
                  aria-expanded={isOpen}>
                  <span className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center
                                   font-black text-sm transition-all duration-300
                                   ${isOpen
                                     ? 'bg-gold text-white shadow-gold'
                                     : 'bg-gold/15 text-gold group-hover:bg-gold/25'}`}>
                    {i + 1}
                  </span>
                  <h3 className={`flex-1 font-black text-sm sm:text-base leading-snug
                                 transition-colors duration-200
                                 ${isOpen ? 'text-gold-dark' : 'text-teal-dark group-hover:text-gold-dark'}`}
                      data-ar={item.q.ar} data-en={item.q.en}>
                    {item.q.ar}
                  </h3>
                  <i className={`fas fa-chevron-down text-gold transition-transform duration-300
                                 flex-shrink-0 text-sm
                                 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <div className={`grid transition-all duration-300 ease-in-out
                                 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 ps-[68px] sm:ps-[80px]
                                    text-sm sm:text-[15px] text-gray-700 leading-loose"
                         data-ar={item.a.ar} data-en={item.a.en}
                         dangerouslySetInnerHTML={{ __html: item.a.ar }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10 reveal">
          <p className="text-gray-500 text-sm mb-4"
             data-ar="لم تجد إجابتك؟ تواصل معنا مباشرة ونحن هنا للمساعدة."
             data-en="Didn't find your answer? Contact us directly — we're here to help.">
            لم تجد إجابتك؟ تواصل معنا مباشرة ونحن هنا للمساعدة.
          </p>
          <a href="#contact"
             className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light
                        text-white font-bold px-6 py-3 rounded-full transition-all
                        duration-300 hover:-translate-y-0.5 shadow-gold"
             data-ar="تواصل معنا" data-en="Contact Us">
            <i className="fas fa-envelope" />
            تواصل معنا
          </a>
        </div>

      </div>
    </section>
  );
}
