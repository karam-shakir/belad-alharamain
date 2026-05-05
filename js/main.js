/* ================================================================
   BELAD AL-HARAMAIN — Main JavaScript
================================================================ */

'use strict';

/* ── AOS Init ────────────────────────────────────────────────── */
AOS.init({
  duration: 750,
  easing: 'ease-out-cubic',
  once: true,
  offset: 60,
});

/* ── Navbar: scroll & mobile toggle ─────────────────────────── */
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  updateActiveLink();
  toggleBackToTop();
}, { passive: true });

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Close mobile nav on outside click
document.addEventListener('click', e => {
  if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    document.body.style.overflow = '';
  }
});

/* ── Active nav link on scroll ───────────────────────────────── */
const sections = document.querySelectorAll('section[id]');

function updateActiveLink() {
  const scrollY = window.scrollY + 100;
  sections.forEach(sec => {
    const top  = sec.offsetTop;
    const h    = sec.offsetHeight;
    const link = navLinks.querySelector(`a[href="#${sec.id}"]`);
    if (link) link.classList.toggle('active', scrollY >= top && scrollY < top + h);
  });
}

/* ── Back to Top ─────────────────────────────────────────────── */
const backToTop = document.getElementById('backToTop');

function toggleBackToTop() {
  backToTop.classList.toggle('visible', window.scrollY > 500);
}

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── Smooth Scroll for anchor links ─────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight + 8;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── Counter Animation ───────────────────────────────────────── */
const counters = document.querySelectorAll('.counter');
let countersTriggered = false;

function animateCounters() {
  counters.forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;

    const tick = () => {
      current = Math.min(current + step, target);
      el.textContent = current >= 1000
        ? (current / 1000).toFixed(current >= 10000 ? 0 : 1) + 'K'
        : Math.floor(current).toString();
      if (current < target) requestAnimationFrame(tick);
      else el.textContent = target >= 1000
        ? (target / 1000).toFixed(target >= 10000 ? 0 : 1) + 'K'
        : target.toString();
    };
    requestAnimationFrame(tick);
  });
}

const aboutSection = document.getElementById('about');
const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !countersTriggered) {
    countersTriggered = true;
    animateCounters();
    observer.disconnect();
  }
}, { threshold: 0.3 });

if (aboutSection) observer.observe(aboutSection);

/* ── Language Toggle ─────────────────────────────────────────── */
const langToggleBtn = document.getElementById('langToggle');
const langLabel     = document.getElementById('langLabel');
let currentLang = 'ar';

function applyLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
  document.body.classList.toggle('lang-en', lang === 'en');
  langLabel.textContent = lang === 'ar' ? 'EN' : 'AR';

  document.querySelectorAll('[data-ar][data-en]').forEach(el => {
    el.textContent = lang === 'ar' ? el.dataset.ar : el.dataset.en;
  });

  // Swap select option text
  document.querySelectorAll('option[data-ar][data-en]').forEach(opt => {
    opt.textContent = lang === 'ar' ? opt.dataset.ar : opt.dataset.en;
  });

  localStorage.setItem('bh-lang', lang);
}

langToggleBtn.addEventListener('click', () => {
  applyLanguage(currentLang === 'ar' ? 'en' : 'ar');
});

// Restore saved language
const savedLang = localStorage.getItem('bh-lang');
if (savedLang && savedLang !== 'ar') applyLanguage(savedLang);

/* ── File Upload UI ──────────────────────────────────────────── */
const fileDropZone = document.getElementById('fileDropZone');
const contractFile = document.getElementById('contractFile');
const fileChosen   = document.getElementById('fileChosen');
const fileName     = document.getElementById('fileName');
const clearFileBtn = document.getElementById('clearFile');

if (contractFile) {
  contractFile.addEventListener('change', handleFileSelect);

  ['dragover', 'dragenter'].forEach(ev => {
    fileDropZone.addEventListener(ev, e => {
      e.preventDefault();
      fileDropZone.classList.add('drag-over');
    });
  });
  ['dragleave', 'drop'].forEach(ev => {
    fileDropZone.addEventListener(ev, e => {
      e.preventDefault();
      fileDropZone.classList.remove('drag-over');
      if (ev === 'drop') {
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
          showFileName(file.name);
        } else {
          alert(currentLang === 'ar' ? 'يُسمح برفع ملفات PDF فقط' : 'Only PDF files are allowed');
        }
      }
    });
  });

  clearFileBtn.addEventListener('click', e => {
    e.stopPropagation();
    contractFile.value = '';
    fileChosen.style.display = 'none';
    fileDropZone.querySelector('.file-drop-ui').style.display = '';
  });
}

function handleFileSelect() {
  const file = contractFile.files[0];
  if (file) showFileName(file.name);
}

function showFileName(name) {
  fileName.textContent = name;
  fileChosen.style.display = 'flex';
  fileDropZone.querySelector('.file-drop-ui').style.display = 'none';
}

/* ── Form Validation Helper ──────────────────────────────────── */
function validateForm(form) {
  let valid = true;

  form.querySelectorAll('[required]').forEach(field => {
    const group = field.closest('.form-group');
    let ok = field.value.trim() !== '';

    if (field.type === 'email' && ok) {
      ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
    }
    if (field.type === 'file' && ok) {
      ok = field.files.length > 0;
    }

    group.classList.toggle('invalid', !ok);
    if (!ok) valid = false;
  });

  // Live clear
  form.querySelectorAll('.form-group').forEach(group => {
    const field = group.querySelector('input, select, textarea');
    if (field) {
      field.addEventListener('input', () => group.classList.remove('invalid'), { once: true });
    }
  });

  return valid;
}

/* ── Agency Form Submit ──────────────────────────────────────── */
const agencyForm    = document.getElementById('agencyForm');
const agencySuccess = document.getElementById('agencySuccess');

if (agencyForm) {
  agencyForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm(agencyForm)) return;

    const btn = agencyForm.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${currentLang === 'ar' ? 'جاري الإرسال...' : 'Sending...'}`;

    // Simulate API call (replace with real fetch/FormData upload)
    await new Promise(r => setTimeout(r, 1800));

    agencyForm.style.display    = 'none';
    agencySuccess.style.display = 'block';

    /* Real implementation:
    const fd = new FormData(agencyForm);
    const res = await fetch('/api/agency-register', { method: 'POST', body: fd });
    if (res.ok) { ... } */
  });
}

/* ── Contact Form Submit ─────────────────────────────────────── */
const contactForm    = document.getElementById('contactForm');
const contactSuccess = document.getElementById('contactSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm(contactForm)) return;

    const btn = contactForm.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${currentLang === 'ar' ? 'جاري الإرسال...' : 'Sending...'}`;

    await new Promise(r => setTimeout(r, 1500));

    contactForm.style.display    = 'none';
    contactSuccess.style.display = 'block';
  });
}

/* ── Download Contract Placeholder ───────────────────────────── */
const downloadBtn = document.getElementById('downloadContractBtn');
if (downloadBtn) {
  downloadBtn.addEventListener('click', e => {
    e.preventDefault();
    const msg = currentLang === 'ar'
      ? 'سيتم رفع ملف العقد قريباً.\nيرجى التواصل معنا مباشرة للحصول على النموذج.'
      : 'The contract PDF will be uploaded soon.\nPlease contact us directly to receive the template.';
    alert(msg);
  });
}

/* ── Intersection-based section reveal (extra) ───────────────── */
const revealItems = document.querySelectorAll('.service-card, .award-card, .timeline-step');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

revealItems.forEach(el => {
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  revealObs.observe(el);
});

/* ── Init ────────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  updateActiveLink();
  toggleBackToTop();
  document.body.style.opacity = '1';
});
