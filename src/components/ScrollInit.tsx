'use client';

import { useEffect } from 'react';

export default function ScrollInit() {
  useEffect(() => {
    /* ── Scroll progress bar ─── */
    const progressBar = document.getElementById('scroll-progress');
    const onScroll = () => {
      const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (progressBar) progressBar.style.width = `${pct}%`;
    };

    /* ── Reveal on scroll ─── */
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    const revealObs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(el => revealObs.observe(el));

    /* ── Counter animation ─── */
    const counters = document.querySelectorAll<HTMLElement>('[data-counter]');
    const counterObs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el     = entry.target as HTMLElement;
          const target = parseInt(el.dataset.counter || '0', 10);
          const dur    = 1600;
          const start  = performance.now();
          const tick   = (now: number) => {
            const p = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            const cur  = Math.floor(ease * target);
            el.textContent = cur >= 1000
              ? (cur / 1000).toFixed(cur >= 10000 ? 0 : 1) + 'K'
              : cur.toString();
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = target >= 1000
              ? (target / 1000).toFixed(target >= 10000 ? 0 : 1) + 'K'
              : target.toString();
          };
          requestAnimationFrame(tick);
          counterObs.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(el => counterObs.observe(el));

    /* ── Stagger children ─── */
    document.querySelectorAll('[data-stagger]').forEach(parent => {
      const children = parent.children;
      Array.from(children).forEach((child, i) => {
        (child as HTMLElement).style.transitionDelay = `${i * 80}ms`;
      });
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      revealObs.disconnect();
      counterObs.disconnect();
    };
  }, []);

  return null;
}
