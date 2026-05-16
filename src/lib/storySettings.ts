import { kv } from '@vercel/kv';
import { STORY_START_AT, STORY_END_AT } from './features';

/* ─────────────────────────────────────────────────────────────
 *  Runtime-editable settings for "قصّتي".
 *
 *  All values that an admin may want to change WITHOUT a deploy
 *  live here (in KV) — feature toggle, window dates, limits,
 *  print partner contact details, etc.
 *
 *  STORY_ENABLED in features.ts is still the master kill switch:
 *  if it's false in code, nothing in KV can re-enable the feature.
 * ───────────────────────────────────────────────────────────── */

export interface PrintPartner {
  enabled:        boolean;
  nameAr:         string;
  nameEn:         string;
  whatsapp:       string;       // E.164 without "+", e.g. "966555123456"
  phone:          string;
  addressAr:      string;
  noteAr:         string;       // free-text instructions for pilgrims
  priceFromSAR:   number;       // displayed price hint
}

export interface StorySettings {
  /** runtime feature toggle (in addition to compile-time STORY_ENABLED) */
  enabled:                boolean;
  /** unix ms — upload/edit window open */
  startAt:                number;
  endAt:                  number;
  /** per-pilgrim limits */
  maxPhotosPerStory:      number;       // hard cap (default 6)
  maxFileSizeMB:          number;       // per photo (default 4)
  /** anti-abuse */
  generateCooldownMin:    number;       // minutes between PDF regenerations
  maxGenerationsPerDay:   number;       // per pilgrim
  /** print partner section shown to pilgrims after generating */
  printPartner:           PrintPartner;
  /** for audit */
  updatedAt:              number;
}

const KEY = 'story:settings';

export const DEFAULT_SETTINGS: StorySettings = {
  enabled:              true,
  startAt:              STORY_START_AT,
  endAt:                STORY_END_AT,
  maxPhotosPerStory:    6,
  maxFileSizeMB:        4,
  generateCooldownMin:  15,
  maxGenerationsPerDay: 10,
  printPartner: {
    enabled:      false,
    nameAr:       'مطبعة الشريك',
    nameEn:       'Partner Print Shop',
    whatsapp:     '',
    phone:        '',
    addressAr:    '',
    noteAr:       'تواصلوا مع المطبعة عبر واتساب وأرسلوا لهم رابط قصّتكم لاستلام نسخة مطبوعة فاخرة.',
    priceFromSAR: 99,
  },
  updatedAt: 0,
};

/* ── Read merged settings (KV → defaults) ── */
export async function getSettings(): Promise<StorySettings> {
  try {
    const stored = await kv.get<Partial<StorySettings>>(KEY);
    if (!stored) return DEFAULT_SETTINGS;
    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      printPartner: {
        ...DEFAULT_SETTINGS.printPartner,
        ...(stored.printPartner ?? {}),
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/* ── Save (validates basic fields) ── */
export async function saveSettings(input: Partial<StorySettings>): Promise<StorySettings> {
  const current = await getSettings();
  const next: StorySettings = {
    ...current,
    ...input,
    printPartner: { ...current.printPartner, ...(input.printPartner ?? {}) },
    updatedAt:    Date.now(),
  };
  // basic clamps
  next.maxPhotosPerStory    = Math.max(1, Math.min(12, Number(next.maxPhotosPerStory) || 6));
  next.maxFileSizeMB        = Math.max(1, Math.min(10, Number(next.maxFileSizeMB) || 4));
  next.generateCooldownMin  = Math.max(0, Math.min(120, Number(next.generateCooldownMin) || 15));
  next.maxGenerationsPerDay = Math.max(1, Math.min(50, Number(next.maxGenerationsPerDay) || 10));
  if (next.endAt < next.startAt) next.endAt = next.startAt + 24 * 3600 * 1000;
  await kv.set(KEY, next);
  return next;
}

/* ── Derived helpers ── */
export function isUploadWindowOpen(s: StorySettings, now: number = Date.now()): boolean {
  return s.enabled && now >= s.startAt && now <= s.endAt;
}
