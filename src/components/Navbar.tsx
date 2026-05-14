'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

const navLinks = [
  { href: '#about',        ar: 'من نحن',          en: 'About'        },
  { href: '#services',     ar: 'خدماتنا',         en: 'Services'     },
  { href: '#journey',      ar: 'رحلة الحاج',      en: 'Journey'      },
  { href: '#faq',          ar: 'الأسئلة الشائعة',  en: 'FAQ'          },
  { href: '/duaa',         ar: 'اذكروني بدعوة',   en: 'Remember Me in Prayer', highlight: true },
  { href: '#agencies',     ar: 'للوكالات',        en: 'Agencies'     },
  { href: '#contact',      ar: 'تواصل معنا',      en: 'Contact'      },
];

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [activeId,  setActiveId]  = useState('');
  const [lang,      setLang]      = useState<'ar'|'en'>('ar');

  /* ── scroll handler ─── */
  const onScroll = useCallback(() => {
    setScrolled(window.scrollY > 60);
    const ids = navLinks.filter(l => l.href.startsWith('#')).map(l => l.href.slice(1));
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
    // Notify React components that opt into language via the useLang() hook
    window.dispatchEvent(new CustomEvent('langchange', { detail: l }));
  };

  const scrollTo = (href: string) => {
    // Cross-page links (any href starting with "/")
    if (href.startsWith('/') && !href.startsWith('/#')) {
      window.location.href = href;
      return;
    }
    // Hash links — only valid on home page; if not home, navigate to /<href>
    const hash = href.startsWith('#') ? href : href.replace(/^\/+/, '');
    if (window.location.pathname !== '/') {
      window.location.href = '/' + hash;
      return;
    }
    const el = document.querySelector(hash);
    if (!el) return;
    const top = (el as HTMLElement).offsetTop - 72;
    window.scrollTo({ top, behavior: 'smooth' });
    setMenuOpen(false);
    document.body.classList.remove('menu-open');
  };

  const toggleMenu = () => {
    setMenuOpen(o => {
      document.body.classList.toggle('menu-open', !o);
      return !o;
    });
  };

  const t = (ar: string, en: string) => lang === 'ar' ? ar : en;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={toggleMenu}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm
                    transition-opacity duration-300
                    ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 py-4
          ${scrolled ? 'navbar-scrolled py-3' : 'bg-transparent'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4">

          {/* ── Logo ─── */}
          <a
            href="#hero"
            onClick={e => { e.preventDefault(); scrollTo('#hero'); }}
            className="flex items-center flex-shrink-0 group"
            aria-label="بلاد الحرمين"
          >
            <div className="bg-white/95 rounded-xl px-2.5 py-1.5 shadow-gold
                            ring-1 ring-gold/30 transition-transform duration-300
                            group-hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="شركة بلاد الحرمين للحج والعمرة"
                width={180}
                height={60}
                priority
                className="h-9 sm:h-10 w-auto object-contain"
              />
            </div>
          </a>

          {/* ── Desktop Links ─── */}
          <ul className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(link => (
              <li key={link.href}>
                <button
                  onClick={() => scrollTo(link.href)}
                  className={`text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-200
                    ${link.highlight
                      ? 'bg-gold/15 text-gold-light hover:bg-gold/25 border border-gold/30'
                      : `relative after:absolute after:bottom-0 after:inset-x-3 after:h-0.5
                         after:rounded-full after:bg-gold after:scale-x-0 after:transition-transform
                         hover:text-gold-light hover:after:scale-x-100
                         ${activeId === link.href.slice(1)
                           ? 'text-gold-light after:scale-x-100'
                           : 'text-white/80'}`
                    }`}
                >
                  {link.highlight && <span className="me-1">🤲</span>}
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
      <aside
        aria-hidden={!menuOpen}
        className={`fixed top-0 bottom-0 right-0 left-auto h-screen
                    w-[280px] max-w-[85vw] bg-teal-dark z-[60] shadow-2xl
                    transition-transform duration-300 ease-in-out md:hidden
                    flex flex-col pt-20 px-5 pb-6 overflow-y-auto
                    ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
      >
        <ul className="flex flex-col gap-1 w-full">
          {navLinks.map(link => (
            <li key={link.href} className="w-full">
              <button
                onClick={() => scrollTo(link.href)}
                className={`block w-full text-start px-4 py-3 rounded-xl text-sm font-semibold
                  transition-colors duration-200
                  ${activeId === link.href.slice(1)
                    ? 'bg-gold/20 text-gold-light'
                    : 'text-white/85 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {t(link.ar, link.en)}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-6">
          <button
            onClick={() => scrollTo('#contact')}
            className="w-full bg-gold hover:bg-gold-light text-white font-bold py-3 rounded-xl
                       flex items-center justify-center gap-2 shadow-gold transition-colors"
          >
            <i className="fas fa-pen-to-square" />
            {t('احجز الآن', 'Book Now')}
          </button>
        </div>
      </aside>
    </>
  );
}
