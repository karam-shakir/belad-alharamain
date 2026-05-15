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
