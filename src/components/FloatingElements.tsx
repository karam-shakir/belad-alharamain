'use client';

import { useEffect, useState } from 'react';

export default function FloatingElements() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      {/* ── Floating WhatsApp ─── */}
      <a
        href="https://wa.me/966XXXXXXXXX"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="wa-pulse fixed bottom-4 end-4 sm:bottom-6 sm:end-6 z-50
                   w-12 h-12 sm:w-14 sm:h-14 rounded-full
                   bg-[#25D366] flex items-center justify-center text-white
                   shadow-[0_4px_20px_rgba(37,211,102,0.5)]
                   hover:scale-110 transition-transform duration-300 relative"
      >
        <i className="fab fa-whatsapp text-xl sm:text-2xl" />
        {/* Tooltip — desktop only */}
        <span className="hidden sm:inline-block absolute end-full me-3 whitespace-nowrap bg-black/80 text-white
                         text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0
                         hover:opacity-100 transition-opacity duration-200 pointer-events-none"
              data-ar="تواصل عبر واتساب" data-en="Chat on WhatsApp">
          تواصل عبر واتساب
        </span>
      </a>

      {/* ── Back to Top ─── */}
      <button
        onClick={scrollTop}
        aria-label="العودة للأعلى"
        className={`fixed bottom-20 end-4 sm:bottom-24 sm:end-6 z-50 w-10 h-10 sm:w-11 sm:h-11 rounded-xl
                    bg-teal text-white flex items-center justify-center
                    shadow-teal transition-all duration-300
                    hover:bg-teal-light hover:-translate-y-1
                    ${showTop
                      ? 'opacity-100 pointer-events-auto translate-y-0'
                      : 'opacity-0 pointer-events-none translate-y-3'
                    }`}
      >
        <i className="fas fa-chevron-up text-sm" />
      </button>
    </>
  );
}
