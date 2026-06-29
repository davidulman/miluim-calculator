/**
 * engine/validate.ts — INPUT VALIDATION & ANOMALY FLAGS (lecturer note 5)
 * ======================================================================
 * מחשבון זכויות לסטודנטים במילואים — אוניברסיטת חיפה
 *
 * Surfaces Hebrew warnings/errors for impossible or suspicious service-day
 * input so the UI can flag a "חריגה" rather than silently compute nonsense.
 * Example given by the lecturer: 365 days in סמסטר א' must raise an exception.
 *
 * Convention:
 *   - errors[]   — hard input problems (negatives, NaN) — block / red.
 *   - warnings[] — anomalies / חריגה (out of plausible range, total>365,
 *                  non-half fractions) — show but allow.
 *
 * Pure TypeScript. NO React / Next imports. Fully unit-testable.
 */

import type { Profile } from './types';
import { totalMiluim } from './normalize';

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

/** A plausible single-semester ceiling (a תשפ"ו semester is ~ up to ~150 days). */
export const SEMESTER_MAX_DAYS = 150;
/** A year cannot exceed 365 days of service. */
export const YEAR_MAX_DAYS = 365;
/** The pre-semester window (אוג'–אוק' 2025) is ~92 days. */
export const PRE_SEMESTER_MAX_DAYS = 92;

/** True when the value is a multiple of 0.5 (half-day increments, note 6). */
function isHalfStep(n: number): boolean {
  return Number.isFinite(n) && Math.round(n * 2) === n * 2;
}

/** Per-field label → Hebrew name, used in messages. */
const FIELD_LABELS = {
  semesterADays: 'סמסטר א׳',
  semesterBDays: 'סמסטר ב׳',
  preSemesterDays: 'טרום-סמסטר (אוג׳–אוק׳ 2025)',
  cumulativeSince2024: 'מצטבר מ-01.01.2024',
  cumulativeSinceOct2023: 'מצטבר מאוקטובר 2023',
} as const;

type DayField = keyof typeof FIELD_LABELS;

/**
 * validateProfile — collect anomaly errors/warnings for a (normalized) Profile.
 */
export function validateProfile(p: Profile): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const dayFields: DayField[] = [
    'semesterADays',
    'semesterBDays',
    'preSemesterDays',
    'cumulativeSince2024',
    'cumulativeSinceOct2023',
  ];

  for (const field of dayFields) {
    const value = p[field];
    const label = FIELD_LABELS[field];

    if (!Number.isFinite(value)) {
      errors.push(`ערך לא תקין בשדה "${label}".`);
      continue;
    }
    if (value < 0) {
      errors.push(`ערך שלילי אינו אפשרי בשדה "${label}".`);
    }
    if (!isHalfStep(value)) {
      warnings.push(
        `חריגה: בשדה "${label}" יש להזין ימים שלמים או חצאי-ימים בלבד (קפיצות של 0.5).`,
      );
    }
  }

  // Single-semester plausibility (note 5: a semester is ~ up to ~150 days).
  if (p.semesterADays > SEMESTER_MAX_DAYS) {
    warnings.push(
      `חריגה: ${p.semesterADays} ימים בסמסטר א׳ חורגים מהטווח הסביר (עד כ-${SEMESTER_MAX_DAYS} ימים בסמסטר).`,
    );
  }
  if (p.semesterBDays > SEMESTER_MAX_DAYS) {
    warnings.push(
      `חריגה: ${p.semesterBDays} ימים בסמסטר ב׳ חורגים מהטווח הסביר (עד כ-${SEMESTER_MAX_DAYS} ימים בסמסטר).`,
    );
  }

  // Pre-semester window plausibility.
  if (p.preSemesterDays > PRE_SEMESTER_MAX_DAYS) {
    warnings.push(
      `חריגה: ${p.preSemesterDays} ימים בטרום-הסמסטר חורגים מחלון אוג׳–אוק׳ 2025 (עד כ-${PRE_SEMESTER_MAX_DAYS} ימים).`,
    );
  }

  // Total within a single academic year cannot exceed 365 days.
  const total = totalMiluim(p);
  if (total > YEAR_MAX_DAYS) {
    warnings.push(
      `חריגה: סך ימי המילואים (${total}) עולה על ${YEAR_MAX_DAYS} ימים בשנה — בדקו את הנתונים.`,
    );
  }

  // Cross-field sanity: cumulative-since-2024 cannot be smaller than the
  // multi-year cumulative-since-Oct-2023 (the latter spans a longer window).
  if (
    Number.isFinite(p.cumulativeSince2024) &&
    Number.isFinite(p.cumulativeSinceOct2023) &&
    p.cumulativeSinceOct2023 > 0 &&
    p.cumulativeSince2024 > p.cumulativeSinceOct2023
  ) {
    warnings.push(
      'חריגה: המצטבר מ-01.01.2024 גדול מהמצטבר מאוקטובר 2023, אף שהחלון המאוחר קצר יותר — בדקו את הנתונים.',
    );
  }

  return { errors, warnings };
}
