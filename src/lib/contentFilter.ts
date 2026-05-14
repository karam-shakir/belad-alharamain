/* ─────────────────────────────────────────────────────────────
 *  Content moderation filter for the public prayer wall.
 *
 *  Philosophy: this is a platform for *good* prayers (دعاء بالخير) only.
 *  Any imprecation against a person — political leader, public figure,
 *  ethnic group, or private individual — is rejected before publishing.
 *
 *  Blocks:
 *   1. Profanity (Arabic + transliterated)
 *   2. ANY imprecation / curse pattern targeting a person, irrespective
 *      of who the target is (لعن، اللهم العن، اللهم اهلك، الله ياخذه،
 *      يا رب انتقم، الموت لـ، تبا، سقوط …)
 *   3. Hard-banned phrases naming Saudi/Arab/Gulf/Muslim leaders
 *      (kept as a defense-in-depth list)
 *
 *  Allowed: religiously-rooted curses on Iblis (الشيطان) — handled via
 *  whitelist exception so "اللهم العن الشيطان" is not blocked.
 *
 *  Returns one of:
 *   { ok: true }
 *   { ok: false; reason: <Arabic user-facing message>; category }
 * ───────────────────────────────────────────────────────────── */

export type FilterResult =
  | { ok: true }
  | { ok: false; reason: string; category: 'profanity' | 'imprecation' | 'political' };

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
    /* Normalize taa marbouta → haa */
    .replace(/ة/g, 'ه')
    /* Collapse whitespace */
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/* ── 1. Profanity — explicit obscene/abusive words. */
const PROFANITY = [
  'كلب', 'كلاب', 'حمار', 'حقير', 'وسخ', 'قذر', 'تافه',
  'خرا', 'خراء', 'تبا لك', 'يا حقير', 'يا قذر',
  'منيوك', 'منيوكه', 'عاهر', 'عاهره', 'شرموط', 'شرموطه',
  'زاني', 'زانيه', 'لوطي',
  'كس', 'طيز', 'زبر',
  'يكره', 'مكروه',
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'pussy',
  'kalb', 'sharmoot', 'sharmoota',
];

/* ── 2. Imprecation patterns — ANY phrase that invokes harm against a
 *  person, group, regime, or entity. Blocked unconditionally (with a
 *  small whitelist for religiously-permitted exceptions). */
const IMPRECATION_PATTERNS = [
  /* Direct cursing verbs (curse + object) */
  'اللهم العن', 'اللهم ال عن', 'اللهم العنه', 'اللهم العنهم',
  'لعن الله', 'لعنه الله', 'لعنهم الله',
  'يلعن', 'يلعنه', 'يلعنهم', 'يلعنك', 'يلعنكم', 'يلعنها',
  'تلعن', 'العنه', 'العنهم', 'لعنه عليه', 'عليه اللعنه', 'عليهم اللعنه',
  /* "Take away / destroy / annihilate" */
  'اللهم خذ', 'اللهم خذه', 'اللهم خذهم',
  'اللهم اهلك', 'اللهم اهلكه', 'اللهم اهلكهم',
  'اللهم دمر', 'اللهم دمره', 'اللهم دمرهم',
  'اللهم اقصم', 'اللهم اخسف', 'اللهم اخسف به', 'اللهم اخسف بهم',
  'اللهم انتقم', 'اللهم انتقم منه', 'اللهم انتقم منهم',
  'اللهم اشغل', 'اللهم سلط', 'اللهم اقهر',
  'اللهم اكفنا شر', 'اللهم اكفنا شره', 'اللهم اكفنا شرهم',
  /* Same with "يا رب" instead of "اللهم" */
  'يا رب خذ', 'يا رب اهلك', 'يا رب انتقم',
  'يا رب دمر', 'يا رب اقهر', 'يا رب اقصم',
  /* "May Allah take/destroy" */
  'الله ياخذ', 'الله ياخذه', 'الله ياخذهم', 'الله ياخذك',
  'الله يخرب', 'الله يحرق', 'الله يقطع',
  'الله يلعن', 'الله ينتقم',
  'الله ينتقم منه', 'الله ينتقم منهم',
  /* Wishing death / fall */
  'الموت ل', 'الموت لـ', 'الموت له', 'الموت لهم',
  'سقوط', 'سقطه', 'فلتسقط',
  'يموت', 'يموتو', 'يموتون',
  'تبا له', 'تبا لهم', 'تبا لها', 'تبا لكم',
  'اخسا', 'اخسئوا',
  'هلاك', 'الهلاك',
  /* "Damn / break / destroy" colloquial */
  'يخرب', 'خرب الله', 'يخسف', 'يقطع',
  'يحرق الله', 'احرقهم', 'احرقه',
];

/* ── 3. Whitelist — religiously-permitted imprecations that should NOT
 *  be blocked even if they include curse words (e.g. cursing Iblis). */
const WHITELIST_TARGETS = [
  'الشيطان', 'ابليس', 'إبليس', 'ابن ابليس',
  'الكفر', 'الكفار',
  'الظلم', 'الفساد', 'البدع',
];

/* ── 4. Hard-banned phrases — explicit imprecations naming political
 *  leaders or regimes in the Arab/Gulf/Muslim world (defense-in-depth;
 *  most are already caught by the imprecation patterns above). */
const HARD_BANNED_PHRASES = [
  /* Saudi Arabia */
  'اللهم العن ال سعود', 'اللهم العن آل سعود', 'اللهم العن السعود',
  'لعن الله ال سعود', 'لعن الله آل سعود',
  'سقوط ال سعود', 'سقوط آل سعود',
  'الموت لال سعود', 'الموت لآل سعود',
  'اللهم العن بن سلمان', 'اللهم العن محمد بن سلمان',
  'لعن الله بن سلمان',
  'اللهم العن الملك سلمان', 'اللهم العن ولي العهد',
  /* UAE */
  'اللهم العن بن زايد', 'اللهم العن محمد بن زايد',
  'لعن الله بن زايد', 'سقوط ال نهيان',
  /* Egypt */
  'اللهم العن السيسي', 'لعن الله السيسي', 'سقوط السيسي',
  /* Syria */
  'اللهم العن بشار', 'اللهم العن الاسد', 'لعن الله بشار',
  'سقوط الاسد',
  /* Jordan */
  'اللهم العن ملك الاردن', 'سقوط ال هاشم',
  /* Bahrain */
  'اللهم العن ال خليفه', 'سقوط ال خليفه',
  /* Qatar */
  'اللهم العن ال ثاني', 'سقوط ال ثاني',
  /* Kuwait, Oman, Yemen, Iraq, Libya, Tunisia, Algeria, Morocco, etc. */
  'اللهم العن ال صباح', 'اللهم العن ال سعيد',
  'اللهم العن السلطان', 'سقوط الحوثي', 'سقوط الحوثيين',
  'اللهم العن السوداني', 'اللهم العن السيستاني',
  'اللهم العن اردوغان', 'لعن الله اردوغان',
  /* Iran */
  'اللهم العن خامنئي', 'لعن الله خامنئي',
  /* Generic regime / nation curses */
  'اللهم العن النظام', 'اللهم العن الحكومه',
  'سقوط النظام', 'الموت للحكومه',
];

/* ── Pre-normalize the lists once (module init) ── */
const N_PROFANITY     = PROFANITY.map(normalize);
const N_IMPRECATION   = IMPRECATION_PATTERNS.map(normalize);
const N_WHITELIST     = WHITELIST_TARGETS.map(normalize);
const N_HARD_BANNED   = HARD_BANNED_PHRASES.map(normalize);

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

  /* 1. Profanity — always blocked */
  if (includesAny(text, N_PROFANITY)) {
    return {
      ok: false,
      category: 'profanity',
      reason: 'الدعاء يحتوي على ألفاظ غير لائقة. يرجى استخدام كلمات طيبة.',
    };
  }

  /* 2. Hard-banned political imprecations (named leaders) */
  if (includesAny(text, N_HARD_BANNED)) {
    return {
      ok: false,
      category: 'political',
      reason: 'هذه المنصة للدعاء بالخير فقط — لا يُسمح بالدعاء على الأشخاص أو القادة. اللهم اهدِنا واهدِ بنا.',
    };
  }

  /* 3. Generic imprecation patterns — block ANY curse against a person.
   *    Exception: if the only target appears to be on the whitelist
   *    (الشيطان / إبليس / الظلم / الفساد …) we allow it. */
  const imprec = includesAny(text, N_IMPRECATION);
  if (imprec) {
    const onlyWhitelistTarget = includesAny(text, N_WHITELIST);
    if (!onlyWhitelistTarget) {
      return {
        ok: false,
        category: 'imprecation',
        reason: 'هذه المنصة للدعاء بالخير فقط — لا يُسمح بالدعاء على الأشخاص. ادعُ لنفسك وللمسلمين بالهداية والمغفرة.',
      };
    }
  }

  return { ok: true };
}
