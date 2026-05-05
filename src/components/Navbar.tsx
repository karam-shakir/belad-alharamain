'use client';

import { useState, useEffect, useCallback } from 'react';

const navLinks = [
  { href: '#about',    ar: 'من نحن',       en: 'About'    },
  { href: '#services', ar: 'خدماتنا',      en: 'Services' },
  { href: '#journey',  ar: 'رحلة الحاج',   en: 'Journey'  },
  { href: '#videos',   ar: 'معرض الفيديو', en: 'Gallery'  },
  { href: '#awards',   ar: 'جوائزنا',      en: 'Awards'   },
  { href: '#agencies', ar: 'للوكالات',     en: 'Agencies' },
  { href: '#contact',  ar: 'تواصل معنا',   en: 'Contact'  },
];

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [activeId,  setActiveId]  = useState('');
  const [lang,      setLang]      = useState<'ar'|'en'>('ar');

  /* ── scroll handler ─── */
  const onScroll = useCallback(() => {
    setScrolled(window.scrollY > 60);
    const ids = navLinks.map(l => l.href.slice(1));
    for (const id of [...ids].reverse()) {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 110) { setActiveId(id); break; }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const saved = localStorage.getItem('bh2-lang') as 'ar'|'en'|null;
    if (saved) applyLang(saved);
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  const applyLang = (l: 'ar'|'en') => {
    setLang(l);
    document.documentElement.lang = l;
    document.documentElement.dir  = l === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('bh2-lang', l);
    document.querySelectorAll<HTMLElement>('[data-ar][data-en]').forEach(el => {
      el.textContent = l === 'ar' ? (el.dataset.ar ?? '') : (el.dataset.en ?? '');
    });
  };

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (!el) return;
    const top = (el as HTMLElement).offsetTop - 72;
    window.scrollTo({ top, behavior: 'smooth' });
    setMenuOpen(false);
    document.body.style.overflow = '';
  };

  const toggleMenu = () => {
    setMenuOpen(o => {
      document.body.style.overflow = o ? '' : 'hidden';
      return !o;
    });
  };

  const t = (ar: string, en: string) => lang === 'ar' ? ar : en;

  return (
    <>
      {/* Backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={toggleMenu}
        />
      )}

      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 py-4
          ${scrolled ? 'navbar-scrolled py-3' : 'bg-transparent'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4">

          {/* ── Logo ─── */}
          <a
            href="#hero"
            onClick={e => { e.preventDefault(); scrollTo('#hero'); }}
            className="flex items-center gap-2.5 flex-shrink-0"
          >
            <div className="w-11 h-11 rounded-full bg-gold-gradient flex items-center justify-center
                            shadow-gold ring-2 ring-gold/30 flex-shrink-0">
              <i className="fas fa-kaaba text-white text-lg" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold text-sm">{t('بلاد الحرمين', 'Belad Alharamain')}</span>
              <span className="text-gold-light text-xs font-medium opacity-85">
                {t('للحج والعمرة', 'Hajj & Umrah')}
              </span>
            </div>
          </a>

          {/* ── Desktop Links ─── */}
          <ul className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(link => (
              <li key={link.href}>
                <button
                  onClick={() => scrollTo(link.href)}
                  className={`text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-200
                    relative after:absolute after:bottom-0 after:inset-x-3 after:h-0.5
                    after:rounded-full after:bg-gold after:scale-x-0 after:transition-transform
                    hover:text-gold-light hover:after:scale-x-100
                    ${activeId === link.href.slice(1)
                      ? 'text-gold-light after:scale-x-100'
                      : 'text-white/80'
                    }`}
                >
                  {t(link.ar, link.en)}
                </button>
              </li>
            ))}
          </ul>

          {/* ── Actions ─── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Language toggle */}
            <button
              onClick={() => applyLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 text-white/75 hover:text-gold-light
                         text-sm font-bold px-2.5 py-1.5 rounded-lg border border-white/25
                         hover:border-gold/50 transition-all duration-200"
            >
              <i className="fas fa-globe text-xs" />
              <span>{lang === 'ar' ? 'EN' : 'AR'}</span>
            </button>

            {/* CTA */}
            <button
              onClick={() => scrollTo('#contact')}
              className="hidden sm:flex items-center gap-1.5 bg-gold hover:bg-gold-light
                         text-white text-sm font-bold px-4 py-2 rounded-full
                         transition-all duration-200 hover:-translate-y-0.5 shadow-gold"
            >
              <i className="fas fa-pen-to-square text-xs" />
              {t('احجز الآن', 'Book Now')}
            </button>

            {/* Hamburger */}
            <button
              onClick={toggleMenu}
              className="md:hidden flex flex-col gap-1.5 p-1.5"
              aria-label="Menu"
            >
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300
                ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300
                ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300
                ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ─── */}
      <div className={`fixed top-0 bottom-0 end-0 w-72 bg-teal-dark z-50 transition-transform
                       duration-300 ease-in-out md:hidden flex flex-col pt-20 px-6 pb-8
                       ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
           style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        <ul className="flex flex-col gap-1">
          {navLinks.map(link => (
            <li key={link.href}>
              <button
                onClick={() => scrollTo(link.href)}
                className={`w-full text-start px-4 py-3 rounded-xl text-sm font-semibold
                  transition-all duration-200
                  ${activeId === link.href.slice(1)
                    ? 'bg-gold/20 text-gold-light'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {t(link.ar, link.en)}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-auto">
          <button
            onClick={() => scrollTo('#contact')}
            className="w-full bg-gold text-white font-bold py-3 rounded-xl
                       flex items-center justify-center gap-2"
          >
            <i className="fas fa-pen-to-square" />
            {t('احجز الآن', 'Book Now')}
          </button>
        </div>
      </div>
    </>
  );
}
