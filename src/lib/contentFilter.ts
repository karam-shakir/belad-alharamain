/* ─────────────────────────────────────────────────────────────
 *  Content moderation filter for the public prayer wall.
 *
 *  Blocks:
 *   1. Common profanity (Arabic + transliterated)
 *   2. Curses / imprecations directed at Saudi rulers, government, or
 *      members of the royal family (لعن، اللهم العن، اللهم انتقم …
 *      + ملك / آل سعود / ولي العهد / بن سلمان …)
 *   3. Hate speech / generic threats
 *
 *  Returns one of:
 *   { ok: true }
 *   { ok: false; reason: <Arabic user-facing message>; category }
 * ───────────────────────────────────────────────────────────── */

export type FilterResult =
  | { ok: true }
  | { ok: false; reason: string; category: 'profanity' | 'political' | 'hate' };

/* ── Normalize Arabic text so we catch variants like
 *   "آل سَعود"، "ال‎سعود"، "ال سعود"، "اَل  سعـود"… */
function normalize(text: string): string {
  return text
    /* Strip Arabic diacritics (harakat) */
    .replace(/[ً-ْٰـ]/g, '')
    /* Strip zero-width chars often used to bypass filters */
    .replace(/[​-‏‪-‮⁠﻿]/g, '')
    /* Normalize alef variants → bare alef */
    .replace(/[إأآٱ]/g, 'ا')
    /* Normalize yaa / alef-maksura */
    .replace(/[يى]/g, 'ي')
    /* Normalize taa marbouta → haa (so أمة == امه matches) */
    .replace(/ة/g, 'ه')
    /* Collapse whitespace */
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/* ── 1. Profanity — explicit obscene/abusive words.
 *  These are blocked outright with no context check. */
const PROFANITY = [
  // Arabic
  'كلب', 'كلاب', 'حمار', 'حقير', 'وسخ', 'قذر', 'تافه',
  'خرا', 'خراء', 'تبا لك', 'يا حقير', 'يا قذر',
  'منيوك', 'منيوكه', 'عاهر', 'عاهره', 'شرموط', 'شرموطه',
  'زاني', 'زانيه', 'لوطي',
  'كس', 'طيز', 'زبر',
  'يكره', 'مكروه',
  // Transliterations
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'pussy',
  'kalb', 'sharmoot', 'sharmoota',
];

/* ── 2. Curse phrases — words used to invoke harm on someone */
const CURSE_WORDS = [
  'لعن', 'يلعن', 'تلعن', 'العن', 'لعنه', 'اللعنه',
  'يلعنه', 'يلعنهم', 'يلعنك',
  'اللهم العن', 'اللهم خذ', 'اللهم انتقم', 'اللهم اهلك',
  'اللهم دمر', 'اللهم اقصم', 'اللهم اخسف',
  'يا رب خذ', 'يا رب انتقم', 'يا رب اهلك',
  'تبا له', 'تبا لهم', 'تبا لها',
  'يخرب', 'خرب الله', 'اخسا',
  'اقتل', 'يموت', 'الموت ل', 'الموت لـ',
  'الله ياخذ', 'الله ياخذك', 'الله يأخذ',
  'هلاك', 'دمار', 'سقوط',
];

/* ── 3. Sensitive political targets — Saudi state / royal family / rulers.
 *  Blocking is triggered only when a CURSE_WORD appears alongside one of
 *  these (so legitimate mentions like "الدعاء لولاة الأمر" remain allowed). */
const POLITICAL_TARGETS = [
  'ملك', 'الملك', 'ملوك',
  'ال سعود', 'آل سعود', 'السعود', 'بني سعود',
  'بن سلمان', 'ابن سلمان', 'محمد بن سلمان', 'mbs',
  'ولي العهد', 'وليالعهد',
  'حكام', 'الحكام', 'حاكم',
  'النظام', 'نظام ال', 'نظام آل',
  'الحكومه', 'حكومه السعود', 'الحكومه السعوديه',
  'ولاه الامر', 'ولاة الامر',
  'الدوله', 'دوله السعود',
  'السعوديه', 'المملكه',
  'سلمان', 'الامير', 'امراء',
];

/* ── 4. Hard-banned political imprecations (no context needed) ── */
const HARD_BANNED_PHRASES = [
  'اللهم العن ال سعود',
  'اللهم العن آل سعود',
  'اللهم العن السعود',
  'لعن الله ال سعود',
  'لعن الله آل سعود',
  'يلعن ال سعود',
  'يلعن آل سعود',
  'اللهم اهلك ال سعود',
  'اللهم اهلك آل سعود',
  'اللهم خذ ال سعود',
  'اللهم خذ آل سعود',
  'اللهم انتقم من ال سعود',
  'اللهم انتقم من آل سعود',
  'سقوط ال سعود',
  'سقوط آل سعود',
  'الموت لال سعود',
  'الموت لآل سعود',
  'تبا لال سعود',
  'تبا لآل سعود',
  'اللهم العن بن سلمان',
  'اللهم العن محمد بن سلمان',
  'لعن الله بن سلمان',
  'يلعن بن سلمان',
  'اللهم اهلك بن سلمان',
  'اللهم خذ بن سلمان',
  'اللهم العن الملك',
  'لعن الله الملك',
  'يلعن الملك',
  'اللهم العن ولي العهد',
  'لعن الله ولي العهد',
];

/* ── Pre-normalize the lists once (module init) ── */
const N_PROFANITY        = PROFANITY.map(normalize);
const N_CURSE_WORDS      = CURSE_WORDS.map(normalize);
const N_POLITICAL_TARGETS = POLITICAL_TARGETS.map(normalize);
const N_HARD_BANNED      = HARD_BANNED_PHRASES.map(normalize);

function includesAny(haystack: string, needles: string[]): string | null {
  for (const n of needles) {
    if (!n) continue;
    if (haystack.includes(n)) return n;
  }
  return null;
}

/* ── Public API ─── */
export function moderateContent(input: string): FilterResult {
  const text = normalize(input);
  if (!text) return { ok: true };

  /* 1. Hard-banned phrases (political imprecations against rulers) */
  const hard = includesAny(text, N_HARD_BANNED);
  if (hard) {
    return {
      ok: false,
      category: 'political',
      reason: 'لا يُسمح بنشر دعاء يحوي إساءة أو دعاء على ولاة الأمر. هذه المنصة للدعاء الطيب فقط.',
    };
  }

  /* 2. Profanity (always blocked) */
  const profane = includesAny(text, N_PROFANITY);
  if (profane) {
    return {
      ok: false,
      category: 'profanity',
      reason: 'الدعاء يحتوي على ألفاظ غير لائقة. يرجى استخدام كلمات طيبة.',
    };
  }

  /* 3. Curse + political target combination */
  const curse  = includesAny(text, N_CURSE_WORDS);
  const target = includesAny(text, N_POLITICAL_TARGETS);
  if (curse && target) {
    return {
      ok: false,
      category: 'political',
      reason: 'لا يُسمح بنشر دعاء يحوي إساءة أو دعاء على ولاة الأمر. هذه المنصة للدعاء الطيب فقط.',
    };
  }

  return { ok: true };
}
