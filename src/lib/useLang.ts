'use client';

import { useEffect, useState } from 'react';

/* ─────────────────────────────────────────────────────────────
 * React hook that reflects the current language ('ar' | 'en')
 * synced with the Navbar's localStorage-based language switcher.
 *
 * Navbar dispatches `window` CustomEvent('langchange') on switch;
 * this hook listens and re-renders consumers automatically — solves
 * the issue where dangerouslySetInnerHTML content is overwritten by
 * the global textContent-based switcher on re-render.
 * ───────────────────────────────────────────────────────────── */
export function useLang(): 'ar' | 'en' {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    // Initial value from storage
    try {
      const saved = localStorage.getItem('bh2-lang');
      if (saved === 'en' || saved === 'ar') setLang(saved);
    } catch { /* ignore */ }

    const onLangChange = (e: Event) => {
      const detail = (e as CustomEvent<'ar' | 'en'>).detail;
      if (detail === 'ar' || detail === 'en') setLang(detail);
    };
    window.addEventListener('langchange', onLangChange);
    return () => window.removeEventListener('langchange', onLangChange);
  }, []);

  return lang;
}
