/* ─────────────────────────────────────────────────────────────
 *  Feature flags — temporary toggles for initiatives.
 *
 *  Set DUAA_ENABLED to `true` to re-enable the "اذكروني بدعوة"
 *  initiative (navbar/footer link + page + API routes).
 *  Set to `false` to fully hide it (404 on all public URLs).
 *
 *  Admin routes (/admin/duaa) are NOT gated — admins can always
 *  manage existing data even when the public initiative is off.
 * ───────────────────────────────────────────────────────────── */

export const DUAA_ENABLED = false;

/* ─────────────────────────────────────────────────────────────
 *  "قصّتي" — My Story (Hajj 1447 photo album generator)
 *
 *  Pilgrims upload up to 6 chapter photos covering the Hajj rites,
 *  the system stitches them into a poetic bilingual PDF, branded
 *  with the company identity. Album link stays alive forever; only
 *  the upload/edit flow is gated by these dates.
 *
 *  Start  : 11 Dhul-Hijjah 1447 ≈ 2026-06-06
 *  End    : 29 Dhul-Hijjah 1447 ≈ 2026-06-24 (23:59:59 KSA)
 *
 *  After the end date: /story landing closes, but every generated
 *  album link (/story/s/[slug]) and PDF download remains active.
 * ───────────────────────────────────────────────────────────── */
export const STORY_ENABLED   = true;
export const STORY_HAJJ_YEAR = '1447';
// Use ISO timestamps in KSA timezone (+03:00)
export const STORY_START_AT  = new Date('2026-06-06T00:00:00+03:00').getTime();
export const STORY_END_AT    = new Date('2026-06-24T23:59:59+03:00').getTime();

export function isStoryUploadOpen(now: number = Date.now()): boolean {
  return STORY_ENABLED && now >= STORY_START_AT && now <= STORY_END_AT;
}
