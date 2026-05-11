/* =====================================================================
 *  ملف المحتوى المركزي للموقع
 *  ─────────────────────────────────────────────────────────────────────
 *  هذا الملف يحتوي على كل المحتوى القابل للتعديل في الموقع.
 *
 *  كيف تُعدِّل المحتوى:
 *    1) ادخل على https://github.com/karam-shakir/belad-alharamain
 *    2) افتح: src/content/site.ts
 *    3) اضغط أيقونة القلم (Edit) في أعلى يمين الملف
 *    4) عدّل النصوص أو الأرقام أو الروابط
 *    5) في الأسفل اضغط "Commit changes" → "Commit changes" مرة ثانية
 *    6) انتظر دقيقة وستظهر التعديلات على الموقع تلقائياً
 *
 *  قواعد مهمة:
 *   - النصوص العربية والإنجليزية بالشكل: { ar: '...', en: '...' }
 *   - لا تحذف الفواصل ( , ) أو الأقواس ({ } [ ])
 *   - لا تُغيِّر أسماء الحقول (مثل title_ar, icon, etc.)
 *   - عدِّل ما بعد علامة المساواة (=) أو ما داخل علامتي الاقتباس فقط
 *   - أيقونات Font Awesome: ابحث عنها في https://fontawesome.com/icons
 * ===================================================================== */

/* ─────────────────────── 1) معلومات التواصل ─────────────────────── */
export const contact = {
  phone:    '+966 55 550 8979',                                // رقم الهاتفي
  whatsapp: '966556777063',                                    // الواتساب (بدون + ولا مسافات، مثال: 966500000000)
  email:    'info@belad-alharamain.com',                       // البريد الإلكتروني
  address:  { ar: 'مكة المكرمة، شارع الحج، بجوار مسجد بن عبيد، بجوار سوق الخيام، المملكة العربية السعودية', en: 'Makkah, Al-Hajj Street, next to Ibn Obaid Mosque, near Al-Khiyam Market, Saudi Arabia' },
  hours:    { ar: 'السبت – الخميس: 8:00ص – 10:00م',          en: 'Sat – Thu: 8:00AM – 10:00PM' },
  // رابط Google Maps Embed (انسخه من Google Maps → Share → Embed a map → Copy HTML → خذ ما بين علامتي src)
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3713.856919612649!2d39.858454099999996!3d21.434868200000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15c20378a661133f%3A0xc1901a99535b1320!2z2LTYsdmD2Kkg2KjZhNin2K8g2KfZhNit2LHZhdmK2YYg2YTZhNit2Kwg2YjYp9mE2LnZhdix2Kkg2LAu2YUu2YUu!5e0!3m2!1sar!2ssa!4v1778407844524!5m2!1sar!2ssa',
  // رابط ملف الشركة على Google My Business (لزر "اطلع علينا على Google" تحت الخريطة)
  googleBusinessUrl: 'https://share.google/5QYB5rUC61TprQo9p',
};

/* ─────────────────────── 2) السوشيال ميديا ─────────────────────── */
export const social = {
  twitter:   'https://x.com/beelad_harameen',           // ضع رابط حساب X (تويتر)
  instagram: 'https://instagram.com/your_account',
  facebook:  'https://www.facebook.com/beelad.alharameen',
  youtube:   'https://youtube.com/@belad2010?si=SRXNIQpQIEogdnBK',
  linkedin:  'https://www.linkedin.com/company/belad-alharamain/',
  tiktok:    'https://tiktok.com/@belad10125',
};

/* ─────────────────────── 3) قسم الواجهة (Hero) ─────────────────────── */
export const hero = {
  // الإحصائيات أعلى الصفحة الرئيسية
  stats: [
    { num: 20,    suffix: '+', label: { ar: 'سنة خبرة',    en: 'Years' } },
    { num: 27000, suffix: '+', label: { ar: 'حاج ومعتمر',  en: 'Pilgrims' } },
    { num: 12,   suffix: '+', label: { ar: 'وكالة شريكة', en: 'Agencies' } },
    { num: 4,    suffix: '+', label: { ar: 'جائزة تميز',  en: 'Awards' } },
  ],
};

/* ─────────────────────── 4) قسم "من نحن" (About) ─────────────────────── */
export const about = {
  // نصّ تعريفي بالشركة
  description: {
    ar: 'شركة سعودية رائدة متخصصة في خدمات الحج والعمرة الداخلية، تأسست بهدف تقديم تجربة روحانية متكاملة لضيوف الرحمن من مختلف أنحاء العالم، مع الحفاظ على أعلى معايير الجودة والاحترافية.',
    en: 'A leading Saudi company specializing in domestic Hajj & Umrah services, established to deliver a comprehensive spiritual experience for pilgrims worldwide while maintaining the highest standards of quality and professionalism.',
  },

  // مسار صورة قسم "من نحن" (ضع الصورة في public/images/ ثم اكتب اسمها هنا، أو اتركه فارغ '' لإخفاء الصورة)
  image: '/images/about.jpg',                                  // مثال: '/images/about.jpg'

  // نصّ شارة الخبرة فوق الصورة
  experienceBadge: { ar: '+20 سنة خبرة', en: '+20 Years' },

  // الرؤية والرسالة والقيم (يمكن تعديل النصوص فقط)
  mvv: [
    { icon: 'fa-eye',      title: { ar: 'رؤيتنا',  en: 'Vision'  }, body: { ar: 'أن نكون الشركة الأولى والأكثر ثقةً في خدمات الحج والعمرة الداخلية على مستوى المملكة.', en: 'To be the leading and most trusted company in domestic Hajj & Umrah services across Saudi Arabia.' } },
    { icon: 'fa-bullseye', title: { ar: 'رسالتنا', en: 'Mission' }, body: { ar: 'تقديم تجربة روحانية استثنائية بأعلى معايير الجودة والاحترافية والالتزام بالقيم الإسلامية.', en: 'Delivering an exceptional spiritual experience with the highest standards of quality, professionalism, and Islamic values.' } },
    { icon: 'fa-gem',      title: { ar: 'قيمنا',   en: 'Values'  }, body: { ar: 'الأمانة، الاحترافية، الجودة، الابتكار، والخدمة المتميزة لكل ضيف من ضيوف الرحمن.', en: 'Integrity, professionalism, quality, innovation, and distinguished service for every pilgrim.' } },
  ],

  // الإحصائيات داخل قسم "من نحن"
  stats: [
    { icon: 'fa-calendar-check', num: 20,    label: { ar: 'سنة خبرة',    en: 'Years Experience' } },
    { icon: 'fa-users',          num: 27000, label: { ar: 'حاج ومعتمر',  en: 'Pilgrims Served'  } },
    { icon: 'fa-building',       num: 12,    label: { ar: 'وكالة شريكة', en: 'Partner Agencies' } },
    { icon: 'fa-trophy',         num: 4,     label: { ar: 'جائزة تميز',  en: 'Excellence Awards'} },
  ],

  // شارات الثقة أسفل القسم
  badges: [
    { icon: 'fa-shield-halved', label: { ar: 'شركة معتمدة',         en: 'Certified Company'    } },
    { icon: 'fa-award',         label: { ar: 'ISO 9001',            en: 'ISO 9001'             } },
    { icon: 'fa-lightbulb',     label: { ar: 'ISO الابتكار',        en: 'ISO Innovation'       } },
    { icon: 'fa-check-circle',  label: { ar: 'ضمان الجودة',         en: 'Quality Guarantee'    } },
  ],
};

/* ─────────────────────── 5) قسم الخدمات (Services) ─────────────────────── */
// لإضافة خدمة جديدة: انسخ كائن { ... } كاملاً وألصقه في نهاية المصفوفة قبل [ ]
// لحذف خدمة: احذف الكائن { ... } بكامله بما فيها الفاصلة بعده
// "featured: true" يجعل البطاقة مميزة بـ "الأكثر طلباً"
export const services = [
  { icon: 'fa-kaaba',  color: 'from-gold-dark to-gold', accent: 'gold',
    title: { ar: 'حج الداخل', en: 'Domestic Hajj' },
    body:  { ar: 'باقات حج متكاملة للمواطنين والمقيمين تشمل السكن الفاخر والنقل المريح وجميع الخدمات اللوجستية طوال موسم الحج.',
             en: 'Complete Hajj packages for citizens & residents covering luxury accommodation, comfortable transport, and all logistics throughout the Hajj season.' } },
  { icon: 'fa-moon',   color: 'from-teal-dark to-teal', accent: 'teal',
    title: { ar: 'العمرة', en: 'Umrah Services' },
    body:  { ar: 'برامج عمرة متنوعة على مدار العام بباقات تناسب جميع الاحتياجات مع مرشدين متخصصين وخدمات راقية.',
             en: 'Diverse Umrah programs year-round with packages for all needs, including specialized guides and premium services.' } },
  { icon: 'fa-crown',  color: 'from-gold-dark to-gold', accent: 'gold', featured: true,
    title: { ar: 'باقات VIP', en: 'VIP Packages' },
    body:  { ar: 'تجربة فاخرة لضيوف الرحمن مع أرقى الفنادق القريبة من الحرمين وخدمات شخصية وفريق مرافقة خاص.',
             en: 'A luxury experience for pilgrims with the finest hotels near the Two Holy Mosques, personal services, and a private escort team.' } },
  { icon: 'fa-bus',    color: 'from-teal-dark to-teal', accent: 'teal',
    title: { ar: 'خدمات الضيافة والنقل', en: 'Hospitality & Transport' },
    body:  { ar: 'أسطول من الحافلات الفاخرة المكيفة وخدمات ضيافة راقية على مدار الساعة لضمان أقصى درجات الراحة.',
             en: 'A fleet of luxurious air-conditioned buses and round-the-clock premium hospitality services to ensure maximum comfort.' } },
];

/* ─────────────────────── 6) قسم رحلة الحاج (Journey) ─────────────────────── */
// خطوات الرحلة بالترتيب — لإضافة/حذف خطوة يلزم تعديل الترقيم العربي يدوياً
export const journey = [
  { num: '١', icon: 'fa-laptop',          title: { ar: 'التسجيل عبر نسك',  en: 'Register via Nusuk' },   desc: { ar: 'التسجيل في منصة نسك الرسمية والحصول على تصريح الحج أو العمرة.', en: 'Register on the official Nusuk platform and obtain your permit.' } },
  { num: '٢', icon: 'fa-list-check',      title: { ar: 'اختيار الباقة',    en: 'Choose Package' },       desc: { ar: 'اختيار الباقة المناسبة من قائمة باقاتنا المتنوعة.',              en: 'Select the ideal package from our diverse offerings.' } },
  { num: '٣', icon: 'fa-location-pin',    title: { ar: 'التجمع',           en: 'Assembly' },             desc: { ar: 'التوجه إلى نقطة التجمع المحددة مع فريقنا المتخصص.',              en: 'Head to the designated assembly point with our team.' } },
  { num: '٤', icon: 'fa-bus',             title: { ar: 'النقل',            en: 'Transport' },            desc: { ar: 'نقل آمن ومريح إلى مكة المكرمة والمشاعر المقدسة.',               en: 'Safe and comfortable transport to Makkah and holy sites.' } },
  { num: '٥', icon: 'fa-hotel',           title: { ar: 'السكن',            en: 'Accommodation' },        desc: { ar: 'إقامة مريحة في أفضل الفنادق القريبة من الحرمين.',               en: 'Comfortable stay at the finest hotels near the Two Mosques.' } },
  { num: '٦', icon: 'fa-hands-praying',   title: { ar: 'أداء المناسك',     en: 'Performing Rituals' },   desc: { ar: 'مرافقة مرشدين دينيين لأداء جميع المناسك بشكل صحيح.',            en: 'Accompanied by religious guides for correct ritual performance.' } },
  { num: '٧', icon: 'fa-plane-departure', title: { ar: 'العودة',           en: 'Return' },               desc: { ar: 'توديع مريح مع تيسير جميع إجراءات العودة إلى الوطن.',           en: 'Comfortable farewell with full assistance for the return journey.' } },
];

/* ─────────────────────── 7) قسم الفيديوهات (Video Gallery) ─────────────────────── */
// كيف تستخرج youtubeId من رابط يوتيوب:
//   https://www.youtube.com/watch?v=dQw4w9WgXcQ  →  youtubeId: 'dQw4w9WgXcQ'
//   https://youtu.be/dQw4w9WgXcQ                 →  youtubeId: 'dQw4w9WgXcQ'
export const videos = [
  { youtubeId: 'uqIlNOIUvUE', title: { ar: 'موسم الحج 1446 هـ',     en: 'Hajj Season 1446 AH' },     subtitle: { ar: 'لقطات مميزة من الموسم الماضي',  en: 'Highlights from last Hajj season' } },
  { youtubeId: 'dFGv83j1Sts', title: { ar: 'استقبال ضيوف الرحمن',  en: 'Receiving the Guests of Allah' },   subtitle: { ar: 'تجربة العمرة مع بلاد الحرمين',  en: 'Umrah experience with us' } },
  { youtubeId: '2V3Upa9coNM', title: { ar: 'نهتم بالابتكار والابداع',       en: 'Our Luxury Services' },     subtitle: { ar: 'تمكين الابتكار في تقديم الخدمات',     en: 'Discover our premium services' } },
  { youtubeId: 'WUnjV0jupbM', title: { ar: 'شهادات الحجاج',         en: 'Pilgrim Testimonials' },    subtitle: { ar: 'آراء ومشاركات حجاجنا الكرام',   en: 'Reviews from our valued pilgrims' } },
  { youtubeId: 'JT4c99ibQm8', title: { ar: 'جولة المشاعر المقدسة',  en: 'Tour of Holy Sites' },      subtitle: { ar: 'الحرم المكي والمدني والمشاعر',  en: "Grand Mosque, Prophet's Mosque" } },
  { youtubeId: 'n7A9Qnf2E7M', title: { ar: 'فريق عملنا المتخصص',    en: 'Our Specialized Team' },    subtitle: { ar: 'تعرف على فريق بلاد الحرمين',    en: 'Meet the Belad Alharamain team' } },
];

/* ─────────────────────── 8) قسم الجوائز (Awards) ─────────────────────── */
// الجوائز والشهادات الحقيقية للشركة
// ملاحظة: عدّل قيمة "year" أو "org" إذا احتجت لتحديث السنة أو الجهة المانحة
export const awards = [
  { icon: 'fa-trophy',      year: '2024',
    color: 'from-gold-dark to-gold',
    title: { ar: 'جائزة مبدعون في المسار الرقمي', en: 'Creators in the Digital Track Award' },
    org:   { ar: 'المملكة العربية السعودية',       en: 'Saudi Arabia' } },

  { icon: 'fa-award',       year: '—',
    color: 'from-teal-dark to-teal',
    title: { ar: 'شهادة الجودة ISO 9001',          en: 'ISO 9001 Quality Certificate' },
    org:   { ar: 'المنظمة الدولية للمعايير',         en: 'International Organization for Standardization' } },

  { icon: 'fa-lightbulb',   year: '—',
    color: 'from-gold-dark to-gold',
    title: { ar: 'شهادة الابتكار ISO',              en: 'ISO Innovation Certificate' },
    org:   { ar: 'المنظمة الدولية للمعايير',         en: 'International Organization for Standardization' } },
];

/* ─────────────────────── 9) قسم الوكالات الخارجية (Agencies) ─────────────────────── */
export const agencies = {
  // مزايا الشراكة
  benefits: [
    { ar: 'باقات تنافسية مصممة خصيصاً للوكالات الخارجية',  en: 'Competitive packages designed for external agencies' },
    { ar: 'دعم فني وميداني متخصص على مدار الساعة',          en: '24/7 specialized technical and field support' },
    { ar: 'عمولات تنافسية وبرامج مكافآت للوكلاء المتميزين',  en: 'Competitive commissions and partner reward programs' },
    { ar: 'نظام إلكتروني متكامل لإدارة ملفات الحجاج',       en: 'Integrated electronic system for pilgrim management' },
    { ar: 'تدريب وتأهيل مستمر لموظفي الوكالات الشريكة',     en: 'Ongoing training for partner agency staff' },
    { ar: 'مواد تسويقية احترافية جاهزة للاستخدام الفوري',    en: 'Professional marketing materials ready to use' },
  ],

  // قائمة الدول للاختيار في النموذج
  countries: ['مصر','تركيا','باكستان','بنغلاديش','إندونيسيا','ماليزيا','المغرب','الجزائر','تونس','نيجيريا','السنغال','الهند','أخرى'],

  // علم الدول الشريكة (إيموجي العلم)
  partnerFlags: ['🇪🇬','🇹🇷','🇵🇰','🇮🇩','🇲🇾','🇲🇦','🇩🇿','🇳🇬','🇧🇩'],
};

/* ─────────────────────── 10) الفوتر (Footer) ─────────────────────── */
export const footer = {
  // النص التعريفي القصير
  description: {
    ar: 'نخدم ضيوف الرحمن بشغف واحترافية منذ أكثر من 20 عاماً.',
    en: 'Serving pilgrims with passion and professionalism for over 20 years.',
  },
  // نص حقوق النشر (سنة + اسم)
  copyright: {
    ar: '© 2026 بلاد الحرمين للحج والعمرة. جميع الحقوق محفوظة.',
    en: '© 2026 Belad Alharamain Hajj & Umrah. All rights reserved.',
  },
};
