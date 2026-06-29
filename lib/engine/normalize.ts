/**
 * engine/normalize.ts — INPUT NORMALIZER (תשפ"ו semester model)
 * ============================================================
 * מחשבון זכויות לסטודנטים במילואים — אוניברסיטת חיפה
 *
 * Turns a RAW (possibly partial / string-typed) form payload into a fully
 * formed `Profile`, computing the AUTO-DERIVED, read-only
 *
 *     totalMiluimDays = semesterADays + semesterBDays      ("סך הכל מילואים")
 *
 * as an EXACT float so half-days sum correctly (35.5 + 35.5 = 71, lecturer
 * note 6). `totalMiluimDays` is NEVER a user input — it lives only on the
 * normalized Profile, and can also be recomputed on demand via `totalMiluim`.
 *
 * Normalization is deliberately MINIMAL: it coerces values to finite numbers
 * (NaN / undefined → 0) but does NOT silently clamp negatives or round odd
 * fractions — those anomalies are surfaced to the user by validate.ts so the
 * UI can warn ("חריגה") rather than hide the problem.
 *
 * Pure TypeScript. NO React / Next imports. Fully unit-testable.
 */

import type { DegreeLevel, Profile, ProfileInput, StudentType } from './types';

/** Coerce an unknown to a finite number; NaN / null / undefined → 0. */
function num(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/**
 * totalMiluim(p) — the canonical "סך הכל מילואים" accessor.
 * Recomputes the EXACT float sum of the two תשפ"ו semesters; engine logic uses
 * this rather than the cached field so results are correct even for a Profile
 * assembled by hand. Half-days preserved (never rounded).
 */
export function totalMiluim(
  p: Pick<ProfileInput, 'semesterADays' | 'semesterBDays'>,
): number {
  return num(p.semesterADays) + num(p.semesterBDays);
}

/** Loose shape accepted from the UI (any field may be missing / a string). */
export type RawProfile = Partial<{
  studentType: StudentType;
  degreeLevel: DegreeLevel;
  semesterADays: number | string;
  semesterBDays: number | string;
  preSemesterDays: number | string;
  cumulativeSince2024: number | string;
  cumulativeSinceOct2023: number | string;
  isFrontLine: boolean;
  isParentWithChildren: boolean;
}>;

/**
 * normalizeProfile — build a fully formed Profile from raw form input.
 * Fills sane defaults, coerces day fields to finite numbers, and sets the
 * derived read-only `totalMiluimDays` (exact float, half-days OK).
 */
export function normalizeProfile(raw: RawProfile): Profile {
  const semesterADays = num(raw.semesterADays);
  const semesterBDays = num(raw.semesterBDays);

  return {
    studentType: raw.studentType ?? 'reserves',
    degreeLevel: raw.degreeLevel ?? 'bachelor',
    semesterADays,
    semesterBDays,
    preSemesterDays: num(raw.preSemesterDays),
    cumulativeSince2024: num(raw.cumulativeSince2024),
    cumulativeSinceOct2023: num(raw.cumulativeSinceOct2023),
    isFrontLine: raw.isFrontLine === true,
    isParentWithChildren: raw.isParentWithChildren === true,
    // AUTO-DERIVED, read-only — exact float sum, never rounded.
    totalMiluimDays: semesterADays + semesterBDays,
  };
}
