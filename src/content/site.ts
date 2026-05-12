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

/* ─────────────────────── 1.5) معلومات الشركة الرسمية ─────────────────────── */
export const business = {
  companyName: { ar: 'شركة بلاد الحرمين للحج والعمرة', en: 'Belad Alharamain Hajj & Umrah Co.' },
  cr:          '7001455810',          // السجل التجاري
  vat:         '300231121300003',     // الرقم الضريبي
  hajjLicense: '10125',               // ترخيص وزارة الحج والعمرة
  established: 2006,                  // سنة التأسيس (تقريبية بناءً على 20 سنة خبرة)
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

/* ─────────────────────── 7.5) قسم آراء العملاء (Testimonials) ─────────────────────── */
// شهادات الحجاج — يمكن إضافة/حذف شهادة بنسخ كائن { ... } كاملاً
//
// الحقول:
//   name     : اسم الحاج كما يظهر على البطاقة
//   country  : البلد (يُعرض مع علم الدولة)
//   flag     : إيموجي علم البلد
//   image    : مسار صورة الحاج (اختياري — يُعرض دائرة بأحرفه الأولى إن كان '')
//              مثلاً: '/images/testimonials/fouad-belaid.jpg'
//   quote    : الاقتباس القصير الذي يظهر في البطاقة
//   rating   : عدد النجوم 1-5 (افتراضياً 5)
//
// زر "شاهد الشهادات كاملةً" أسفل القسم يربط بالفيديو على يوتيوب.
export const testimonialsConfig = {
  videoUrl: 'https://youtu.be/WUnjV0jupbM',
};

export const testimonials = [
  {
    name:    'فؤاد بلعيد',
    country: { ar: 'المملكة المتحدة', en: 'United Kingdom' },
    flag:    '🇬🇧',
    image:   '',
    quote:   { ar: 'فنادق قريبة جداً من الحرمين، خدمات ممتازة، ووجبات متنوعة ومرضية تماماً.',
               en: 'Hotels very close to the Two Holy Mosques, excellent services, and varied meals.' },
    rating:  5,
  },
  {
    name:    'محمد أمين',
    country: { ar: 'فرنسا', en: 'France' },
    flag:    '🇫🇷',
    image:   '',
    quote:   { ar: 'تجربة رائعة وتنظيم محكم — كان المرافقون معنا في كل خطوة لتذليل الصعاب.',
               en: 'Wonderful experience and impeccable organization — escorts with us every step of the way.' },
    rating:  5,
  },
  {
    name:    'حاجة من جنوب أفريقيا',
    country: { ar: 'جنوب أفريقيا', en: 'South Africa' },
    flag:    '🇿🇦',
    image:   '',
    quote:   { ar: 'رحلة العمر بكل تفاصيلها — مخيمات منى وعرفات كانت مريحة ومجهزة بالكامل.',
               en: 'The journey of a lifetime — camps in Mina and Arafat were fully equipped and comfortable.' },
    rating:  5,
  },
  {
    name:    'عبد الله العتيبي',
    country: { ar: 'الكويت', en: 'Kuwait' },
    flag:    '🇰🇼',
    image:   '',
    quote:   { ar: 'سلاسة التنقلات والقرب من الحرم جعلت مناسكنا سهلة وميسّرة. شكراً لحسن الاستقبال.',
               en: 'Smooth transport and proximity to the Haram made our rituals easy. Thanks for the warm hospitality.' },
    rating:  5,
  },
];

/* ─────────────────────── 7.7) قسم الأسئلة الشائعة (FAQ) ─────────────────────── */
// إضافة/حذف سؤال: انسخ كائن { ... } كاملاً وعدّل النص.
// الإجابات تدعم HTML بسيط (مثل <strong> و <a>) — استخدم بحذر.
export const faq = [
  {
    q: { ar: 'ما الفرق بين الحج والعمرة؟',
         en: 'What is the difference between Hajj and Umrah?' },
    a: { ar: 'الحج فريضة على المسلم القادر مرة واحدة في العمر، يُؤدّى في أشهر معلومة من العام الهجري. أما العمرة فهي سُنّة مؤكدة يمكن أداؤها في أي وقت من السنة، وتشمل الطواف والسعي والحلق أو التقصير.',
         en: 'Hajj is an obligatory pilgrimage performed once in a Muslim\'s lifetime during specific months. Umrah is a recommended pilgrimage that can be performed any time of the year.' },
  },
  {
    q: { ar: 'متى يفتح التسجيل لموسم الحج؟',
         en: 'When does Hajj registration open?' },
    a: { ar: 'تُحدّد وزارة الحج والعمرة موعد فتح التسجيل سنوياً عبر منصة "نُسُك" الرسمية. عادةً ما يبدأ التسجيل قبل موسم الحج بعدة أشهر. تابعونا للحصول على آخر التحديثات.',
         en: 'The Ministry of Hajj announces the opening date annually via the official Nusuk platform. Registration typically opens several months before the Hajj season.' },
  },
  {
    q: { ar: 'ما هي الوثائق المطلوبة للتسجيل في الحج الداخلي؟',
         en: 'What documents are needed for domestic Hajj?' },
    a: { ar: 'يلزم للمواطنين والمقيمين في المملكة: الهوية الوطنية أو الإقامة سارية المفعول، تصريح الحج من منصة "نُسُك"، شهادة التطعيمات الموصى بها، وأي وثائق إضافية حسب الباقة المختارة.',
         en: 'Required documents include: valid Saudi National ID or Iqama, Hajj permit from Nusuk platform, recommended vaccinations certificate, and any additional documents per the chosen package.' },
  },
  {
    q: { ar: 'ما الذي تشمله باقات الحج لديكم؟',
         en: 'What is included in your Hajj packages?' },
    a: { ar: 'تشمل باقاتنا عادةً: السكن في المشاعر المقدسة، النقل المكيّف بين المشاعر المقدّسة سواء بالمترو أو الباصات، الإعاشة الكاملة، خدمات الإرشاد الديني، الدعم الميداني على مدار الساعة، والمخيمات المجهّزة في منى وعرفات. تختلف التفاصيل حسب نوع الباقة (عادية / VIP).',
         en: 'Packages typically include: hotel accommodation near the Two Mosques, air-conditioned transport, full meals, religious guidance, 24/7 field support, and equipped camps in Mina and Arafat. Details vary by package tier.' },
  },
  {
    q: { ar: 'هل العمرة متاحة طوال السنة؟',
         en: 'Is Umrah available year-round?' },
    a: { ar: 'نعم، نقدّم برامج العمرة طوال أيام السنة الميلادية، باستثناء فترات الحج المحددة. لدينا باقات متنوعة تناسب جميع الميزانيات والاحتياجات، سواء للأفراد أو العائلات أو المجموعات.',
         en: 'Yes, we offer Umrah programs throughout the year, except during the specific Hajj period. We have packages for individuals, families, and groups.' },
  },
  {
    q: { ar: 'هل يمكن للنساء أداء العمرة بدون محرم؟',
         en: 'Can women perform Umrah without a Mahram?' },
    a: { ar: 'نعم، وفقاً لقرارات وزارة الحج والعمرة الصادرة، يُسمح للمرأة بأداء العمرة دون محرم وفق ضوابط محددة (الانضمام لمجموعة منظّمة). نوفّر مرشدات نساء في باقات خاصة لتيسير الرحلة.',
         en: 'Yes, per current Saudi regulations, women may perform Umrah without a Mahram under specific conditions (organized group). We provide female guides in special packages.' },
  },
  {
    q: { ar: 'كم تستغرق رحلة الحج معكم؟',
         en: 'How long does the Hajj journey take?' },
    a: { ar: 'تتراوح مدة برامج الحج لدينا بين 5 إلى 12 يوماً حسب الباقة، تشمل أيام التحضير، أداء المناسك في المشاعر المقدّسة، وزيارة المدينة المنوّرة (في بعض الباقات).',
         en: 'Hajj programs range from 5 to 12 days depending on the package, including preparation, performing rituals at the holy sites, and visiting Madinah (in some packages).' },
  },
  {
    q: { ar: 'ما الفرق بين الباقة العادية وباقة VIP؟',
         en: 'What\'s the difference between regular and VIP packages?' },
    a: { ar: 'تتميّز باقة VIP بـ: فنادق 5 نجوم بأقرب الأبراج للحرمين، خدمة شخصية لكل حاج، نقل في حافلات فاخرة، وجبات راقية، مخيمات VIP في منى، ومرافق ميداني خاص. الباقة العادية توفّر تجربة مريحة بمعايير عالية لكن بأسعار أنسب.',
         en: 'VIP includes 5-star hotels closest to the Haram, personal service, luxury transport, gourmet meals, VIP camps in Mina, and dedicated field escort. Regular packages offer comfort and high standards at more accessible pricing.' },
  },
  {
    q: { ar: 'ما هي سياسة الإلغاء واسترداد المبالغ؟',
         en: 'What is the cancellation and refund policy?' },
    a: { ar: 'تختلف سياسة الإلغاء حسب موعد الإلغاء قبل بداية الرحلة، وتُحدَّد بالتفصيل في العقد المبرم. عموماً: الإلغاء المبكر يضمن استرداد أكبر، أما الإلغاء قبل أيام قليلة فيستوجب رسوماً إدارية. الظروف القاهرة (وفاة، مرض موثّق) تُعالَج وفق الأنظمة.',
         en: 'Cancellation terms vary by timing relative to trip start, detailed in the contract. Early cancellation yields larger refunds; late cancellation incurs administrative fees. Force-majeure cases (death, documented illness) are handled per regulations.' },
  },
  {
    q: { ar: 'كيف يمكنني الحجز والدفع؟',
         en: 'How do I book and pay?' },
    a: { ar: 'يمكنكم التواصل معنا عبر نموذج "تواصل معنا" أو الاتصال المباشر على رقمنا، ثم نُرسل لكم تفاصيل الباقات والأسعار. الدفع يتم عبر تحويل بنكي رسمي بعد توقيع العقد. لا نطلب أي مبالغ نقدية مسبقة عبر الموقع.',
         en: 'Contact us via the form or by phone — we\'ll send package details and pricing. Payment is made via official bank transfer after signing the contract. We never request cash payments through the website.' },
  },
  {
    q: { ar: 'هل توفّرون باقات للوكالات الخارجية؟',
         en: 'Do you offer packages for external agencies?' },
    a: { ar: 'نعم، لدينا برنامج تعاقد شامل للوكالات الخارجية يشمل: عمولات تنافسية، باقات مخصّصة، دعم تشغيلي، ومواد تسويقية. سجّل وكالتك مباشرة عبر <a href="/agencies">صفحة الوكالات</a>.',
         en: 'Yes, we have a comprehensive partner program for external agencies including: competitive commissions, custom packages, operational support, and marketing materials. Register your agency via the <a href="/agencies">Agencies page</a>.' },
  },
  {
    q: { ar: 'هل يمكنني تخصيص الباقة حسب احتياجي؟',
         en: 'Can I customize the package?' },
    a: { ar: 'بالتأكيد. نقدّم باقات مرنة قابلة للتخصيص حسب: عدد الأفراد، نوع السكن المفضّل، مدة الرحلة، الخدمات الإضافية (زيارة المدينة، خدمات VIP، إلخ). تواصل معنا لتفصيل باقة على مقاسك.',
         en: 'Absolutely. We offer flexible packages customizable by group size, accommodation type, trip duration, and add-ons (Madinah visit, VIP services, etc.). Contact us for a tailored quote.' },
  },
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
