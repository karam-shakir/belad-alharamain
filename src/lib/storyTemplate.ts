/* ─────────────────────────────────────────────────────────────
 *  Narrative template for "قصّتي" — My Hajj Story.
 *
 *  All Arabic prose, English translations, and Qur'anic/hadith
 *  citations live HERE and HERE ONLY. To edit any line later:
 *  open this file, change the text, redeploy. No code touched.
 *
 *  Verification of sources:
 *   • Surah Al-Hajj 22:27           (verified Mushaf)
 *   • Surah Al-Baqarah 2:198        (verified Mushaf)
 *   • "الحج عرفة"                    Sunan Abi Dawud 1949
 *                                   At-Tirmidhi 889 (Sahih)
 *   • Hadith of Arafah pride         Sahih Muslim 1348
 *   • "من حج هذا البيت..."           Sahih al-Bukhari 1521
 *                                   Sahih Muslim 1350
 *
 *  All claims about Prophets are kept general and Qur'an-rooted
 *  (no unverified narrations about specific places/events).
 * ───────────────────────────────────────────────────────────── */

export type ChapterKey =
  | 'ihram'
  | 'tarwiyah'
  | 'arafah'
  | 'muzdalifah'
  | 'jamarat'
  | 'eid';

export interface Chapter {
  key:        ChapterKey;
  numberAr:   string;          // "الأول" … "السادس"
  numberEn:   string;          // "One" … "Six"
  titleAr:    string;
  titleEn:    string;
  /* Poetic prose — single string with explicit line breaks (\n\n) */
  proseAr:    string;
  proseEn:    string;
  /* Optional Qur'an/hadith citation block */
  citation?:  {
    textAr:    string;
    refAr:     string;          // المرجع بالعربية
    textEn?:   string;          // optional English translation
  };
}

/* ── Cover, dedication, closing ─── */
export const STORY_BRAND = {
  companyAr:  'شركة بلاد الحرمين للحجّ والعمرة',
  companyEn:  'Belad Alharamain Co. for Hajj & Umrah',
  domain:     'belad-alharamain.com',
} as const;

export const STORY_COVER = {
  titleAr:    'قصّتي',
  titleEn:    'My Story',
  subtitleAr: 'رحلة الحجّ المباركة',
  subtitleEn: 'The Blessed Pilgrimage',
  yearLabelAr: 'موسم',
  yearLabelEn: 'Season',
} as const;

export const STORY_DEDICATION = {
  greetingAr: 'إلى الحاجّ الكريم',
  greetingEn: 'To our honored pilgrim',
  bodyAr:
    'في هذه الصفحات أثرٌ من رحلةٍ لا تعود،\n' +
    'وذكرى لقلبٍ خفق بين يدَي مولاه.\n' +
    'كنّا شرفاء بصحبتكم في طريقٍ يطول فيه الذِّكر،\n' +
    'ويقصُر فيه الزمان أمام عظمة المقام.\n' +
    'فلتكن هذه القصّة نوراً يُضيء لكم سنوات العمر،\n' +
    'وذكرى تحملونها إلى أبنائكم وأحفادكم.',
  bodyEn:
    'Within these pages lies the trace of a journey that never returns,\n' +
    'a memory of a heart that beat before its Lord.\n' +
    'We were honored to walk beside you on a path\n' +
    'where remembrance is long, and time stands still.\n' +
    'May this story remain a light through your years,\n' +
    'and a memory carried to your children and grandchildren.',
  citation: {
    textAr: '﴿ وَأَذِّن فِي النَّاسِ بِالْحَجِّ يَأْتُوكَ رِجَالًا وَعَلَىٰ كُلِّ ضَامِرٍ يَأْتِينَ مِن كُلِّ فَجٍّ عَمِيقٍ ﴾',
    refAr:  'سورة الحجّ — الآية ٢٧',
    textEn: 'And proclaim to the people the Hajj; they will come to you on foot and on every lean camel, coming from every distant pass.',
  },
  signatureAr: 'فريق شركة بلاد الحرمين',
  signatureEn: 'The Belad Alharamain Team',
} as const;

/* ── The six chapters ─── */
export const STORY_CHAPTERS: Chapter[] = [
  /* ─── 1 ─────────────────────────────────────────────────── */
  {
    key:      'ihram',
    numberAr: 'الأول',
    numberEn: 'One',
    titleAr:  'استعدادٌ ونيّة',
    titleEn:  'Of Preparation and Pure Intention',
    proseAr:
      'يا قاصدَ البيتِ،\n' +
      'كم انتظرتَ أن تطأ قدماك هذا الطريق…\n' +
      'خلعتَ ثوبَ الدنيا، ولبستَ ثوبَ الفقرِ إلى الله،\n' +
      'فصارت الدنيا كلُّها خلفَك، والوجهُ كلُّه إليه.\n\n' +
      'لبَّيتَ يا عبدَ الله…\n' +
      'فهنّأك اللهُ بالنّداء، وأكرمَك بالطريق،\n' +
      'وكتبَ لك ميلاداً جديداً من رحلةٍ أوّلُها وعدٌ، وآخرُها لقاء.',
    proseEn:
      'O traveler to the House,\n' +
      'how long you waited to set foot upon this path…\n' +
      'You shed the garments of the world\n' +
      'and clothed yourself in humility before your Lord,\n' +
      'leaving the world behind, turning your face to Him alone.\n\n' +
      'You answered His call —\n' +
      'and He honored you with the road,\n' +
      'and wrote for you a new beginning,\n' +
      'on a journey that opens with a promise and closes with His meeting.',
  },

  /* ─── 2 ─────────────────────────────────────────────────── */
  {
    key:      'tarwiyah',
    numberAr: 'الثاني',
    numberEn: 'Two',
    titleAr:  'يومُ التَّروية — على أبواب مِنى',
    titleEn:  'The Day of Tarwiyah — At the Gates of Mina',
    proseAr:
      'خرجتَ إلى مِنى وقلبُك يَخفُق…\n' +
      'تسير في موكبٍ ممتدٍّ من نبيٍّ إلى نبيّ،\n' +
      'ومن جيلٍ إلى جيل،\n' +
      'حتى انتهى الطريقُ إلى قدمَيك.\n\n' +
      'هنا في هذه الوديان،\n' +
      'وقفَ خاتمُ الأنبياءِ ﷺ بين أصحابه،\n' +
      'فأوصى ووصّى، وعلَّمَ وحدَّد.\n' +
      'وها أنت اليوم تُكمل ما بدأه،\n' +
      'تحمل ذِكرَ الله على لسانك،\n' +
      'وحُبَّ بيته في صدرك،\n' +
      'فطوبى لك على هذا الطريق.',
    proseEn:
      'You set out for Mina, your heart trembling…\n' +
      'walking in a procession that flows from one prophet to another,\n' +
      'from one generation to the next,\n' +
      'until the road came to rest beneath your feet.\n\n' +
      'Here, in these valleys,\n' +
      'the Seal of the Prophets ﷺ once stood among his companions,\n' +
      'teaching and entrusting, defining the way.\n' +
      'And today, you complete what he began —\n' +
      'God’s remembrance on your tongue,\n' +
      'the love of His House in your heart.\n' +
      'Blessed are you upon this path.',
  },

  /* ─── 3 ─────────────────────────────────────────────────── */
  {
    key:      'arafah',
    numberAr: 'الثالث',
    numberEn: 'Three',
    titleAr:  'يومُ عرفة — يومُ العُمر',
    titleEn:  'The Day of Arafah — The Day of a Lifetime',
    proseAr:
      'الحَجُّ عرفة…\n' +
      'وقفتَ على ذلك الصّعيد،\n' +
      'فأحسستَ بضعفِك بين يدَي مولاك،\n' +
      'فبكيتَ كما يبكي الصّغير بين يدَي أبيه.\n\n' +
      'كانت الشّمسُ فوقك،\n' +
      'وكان الدّعاءُ يَتصاعد كأنّه حمامُ السّماء،\n' +
      'تنزل الرّحمةُ كالغيث،\n' +
      'ويُباهي اللهُ بكم ملائكتَه.\n\n' +
      'تلك ساعةٌ من ساعات العمر،\n' +
      'لو حملتَها في صدرك إلى آخر يوم،\n' +
      'لظَلَّت تُضيء قلبَك إلى لقاء الله.',
    proseEn:
      'Hajj is Arafah…\n' +
      'You stood upon that plain,\n' +
      'feeling your weakness before your Lord,\n' +
      'weeping as a child weeps in his father’s arms.\n\n' +
      'The sun above you,\n' +
      'your prayers ascending like doves of the sky,\n' +
      'mercy descending as gentle rain,\n' +
      'and your Lord, before His angels, glorying in you.\n\n' +
      'That single hour —\n' +
      'were you to carry it in your chest to your final day —\n' +
      'would remain a light within you,\n' +
      'until you meet your Lord.',
    citation: {
      textAr: '«الحَجُّ عَرَفَة»',
      refAr:  'رواه أبو داود (١٩٤٩) والترمذي (٨٨٩) — صحيح',
      textEn: '“Hajj is Arafah.” — Sunan Abi Dawud 1949 / Tirmidhi 889 (Sahih)',
    },
  },

  /* ─── 4 ─────────────────────────────────────────────────── */
  {
    key:      'muzdalifah',
    numberAr: 'الرابع',
    numberEn: 'Four',
    titleAr:  'ليلةُ مُزدلفة — تحت سماء المشعر الحرام',
    titleEn:  'The Night of Muzdalifah — Beneath the Sacred Sky',
    proseAr:
      'تحت قُبّةٍ من نجوم،\n' +
      'كنتَ ومَن معكَ على الأرض،\n' +
      'وكان الذِّكرُ يَعلو فوقَكم إلى السّماء.\n\n' +
      'جمعتَ حصياتٍ صغيراتٍ من أرضٍ كبيرةٍ في قلب الله،\n' +
      'كأنّك تجمع عهداً مع نفسك:\n' +
      'أن ترميَ ضعفَك، وأن تَخرُجَ من ضيق ذاتك\n' +
      'إلى سَعَةِ ربّك.\n\n' +
      'سمَّى اللهُ هذا الموضعَ «المشعرَ الحرام»،\n' +
      'فما أعظمَ من بات ليلةً عند مشعرٍ سمّاه الله.',
    proseEn:
      'Beneath a canopy of stars,\n' +
      'you lay upon the ground with your companions,\n' +
      'while remembrance rose above you to the heavens.\n\n' +
      'You gathered small stones from a great earth\n' +
      'held within the heart of God —\n' +
      'as though gathering a covenant with yourself:\n' +
      'to cast away your weakness,\n' +
      'to step out of the narrowness of self\n' +
      'into the vastness of your Lord.\n\n' +
      'God named this place al-Mash‘ar al-Haram —\n' +
      'how great is the one who slept a night where God Himself has named.',
    citation: {
      textAr: '﴿ فَإِذَا أَفَضْتُم مِّنْ عَرَفَاتٍ فَاذْكُرُوا اللَّهَ عِندَ الْمَشْعَرِ الْحَرَامِ ﴾',
      refAr:  'سورة البقرة — الآية ١٩٨',
      textEn: 'And when you depart from Arafat, remember Allah at al-Mash‘ar al-Haram. — Al-Baqarah 2:198',
    },
  },

  /* ─── 5 ─────────────────────────────────────────────────── */
  {
    key:      'jamarat',
    numberAr: 'الخامس',
    numberEn: 'Five',
    titleAr:  'رميُ العَقَبة والتَّحلُّل — عهدٌ جديد',
    titleEn:  'The Stoning and Release — A New Covenant',
    proseAr:
      'رميتَ الجمرةَ بسَبْعِ حصيات،\n' +
      'فكأنّك رميتَ كلَّ ما يُثقل قلبَك،\n' +
      'وكلَّ ما يَشدُّك إلى أرضك.\n\n' +
      'حَلَقتَ شعرَك،\n' +
      'فسقطت معه ذنوبٌ كنتَ تحملها سنين،\n' +
      'وقُمتَ نقيّاً، كأنّك وُلِدتَ اليوم.\n\n' +
      'هكذا وعدَ النبيُّ ﷺ:\n' +
      'مَن حجَّ فلم يَرفُث ولم يَفسُق،\n' +
      'رجَع كيومَ ولدته أمُّه.\n' +
      'فيا لها من عودةٍ! ويا لها من ميلادٍ جديد!',
    proseEn:
      'You cast seven small stones at the pillar,\n' +
      'as though casting away every weight upon your heart,\n' +
      'every chain that bound you to the earth.\n\n' +
      'You shaved your hair,\n' +
      'and with each strand fell years of forgotten sins,\n' +
      'and you rose, pure, as if newly born.\n\n' +
      'Such was the promise of the Prophet ﷺ:\n' +
      'whoever performs Hajj without indecency or transgression\n' +
      'returns as on the day his mother gave him birth.\n' +
      'What a return — and what a new beginning.',
    citation: {
      textAr: '«مَنْ حَجَّ هذا البَيتَ فَلَمْ يَرْفُثْ وَلَمْ يَفْسُقْ، رَجَعَ كَيَومَ وَلَدَتْهُ أُمُّهُ»',
      refAr:  'رواه البخاري (١٥٢١) ومسلم (١٣٥٠)',
      textEn: '“Whoever performs Hajj without indecency or wrongdoing returns as the day his mother bore him.” — Bukhari 1521 / Muslim 1350',
    },
  },

  /* ─── 6 ─────────────────────────────────────────────────── */
  {
    key:      'eid',
    numberAr: 'السادس',
    numberEn: 'Six',
    titleAr:  'يومُ العيد وطوافُ الإفاضة — فرحُ العائدين',
    titleEn:  'The Day of Eid and the Tawaf of Return — A Joy Restored',
    proseAr:
      'عُدتَ إلى بيت الله طائفاً،\n' +
      'وفي قلبك فرحةُ المغفور لهم.\n' +
      'كانت الكعبةُ تَلوحُ كأنّها قلبُ الكون،\n' +
      'وكنتَ ترقُص حولها رقصةَ شكرٍ صامتة،\n' +
      'تَهمسُ في كلِّ خطوة:\n' +
      'الحمدُ لله…\n' +
      'الحمدُ لله…\n\n' +
      'اليومُ عيدُ المسلمين،\n' +
      'وأنت في أوّل صفِّ الفرحين،\n' +
      'يَفرح اللهُ بك كما تفرح أنت بربّك.\n\n' +
      'تقبّل اللهُ منك،\n' +
      'وجعلَ ما أتممتَه ذُخراً يومَ تلقاه،\n' +
      'وميزاناً يَرجُح به قلبُك بين يدَيه.',
    proseEn:
      'You returned to the House of God in tawaf,\n' +
      'your heart filled with the joy of the forgiven.\n' +
      'The Ka‘bah shone like the heart of the universe,\n' +
      'and you circled it in a silent dance of gratitude,\n' +
      'whispering with every step:\n' +
      'Praise be to God…\n' +
      'Praise be to God…\n\n' +
      'This is the day of Eid,\n' +
      'and you stand in the first row of the joyful,\n' +
      'for God rejoices in His servant as the servant rejoices in his Lord.\n\n' +
      'May God accept from you,\n' +
      'and may what you have completed shine for you\n' +
      'on the Day you meet your Lord.',
  },
];

/* ── Closing page ─── */
export const STORY_CLOSING = {
  duaAr:
    'تقبّل اللهُ منكم،\n' +
    'وجعلَ حجَّكم مبروراً،\n' +
    'وسعيَكم مشكوراً،\n' +
    'وذنبَكم مغفوراً.',
  duaEn:
    'May God accept your pilgrimage,\n' +
    'reward your striving,\n' +
    'and forgive your sins.',
  thanksAr:
    'كنّا شرفاء بخدمتكم في رحلة العمر،\n' +
    'وستظلّ أسماؤكم في قلوبنا، وذكرياتكم بين دفّتَي هذه القصّة.',
  thanksEn:
    'It was our honor to walk with you through the journey of a lifetime.\n' +
    'Your names remain in our hearts, and your memories within these pages.',
  signatureAr: 'فريق شركة بلاد الحرمين',
  signatureEn: 'The Belad Alharamain Team',
} as const;

export const STORY_BACK_COVER = {
  inviteAr:    'شاركوا قصّتكم',
  inviteEn:    'Share Your Story',
  scanLabelAr: 'امسحوا الرمز لمشاركة النسخة الرقمية',
  scanLabelEn: 'Scan to share the digital edition',
} as const;
