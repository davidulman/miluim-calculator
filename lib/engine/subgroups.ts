/**
 * engine/subgroups.ts — THE SUBGROUP CLASSIFIER (pure logic)
 * ==========================================================
 * מחשבון זכויות לסטודנטים במילואים — אוניברסיטת חיפה
 *
 * Implements the ATOMIC 5-subgroup membership model. Unlike the legacy
 * `classifyStudent` (lib/calculator.ts) which returned a SINGLE group, this
 * module returns the FULL SET of subgroups a profile satisfies. A profile may
 * hold more than one subgroup at once, and `resolveRights` later takes the
 * UNION of all their benefits (FIX 1).
 *
 * Authoritative source: /Users/davidulman/Programing/law/miluim/claude.md
 *   - Section 3 → subgroup membership criteria (the thresholds below)
 *   - Section 7 → the legacy single-group pseudocode (thresholds match)
 *
 * Pure TypeScript. NO React / Next imports. Fully unit-testable.
 */

import type { Profile, StudentType, Subgroup } from './types';
import { SUBGROUP_META } from './types';
import { totalMiluim } from './normalize';

/* ------------------------------------------------------------------ *
 * Helpers                                                             *
 * ------------------------------------------------------------------ */

/** Numeric tier (1|2|3) of a subgroup — thin wrapper over SUBGROUP_META. */
export function tierOf(s: Subgroup): number {
  return SUBGROUP_META[s].tier;
}

const CIVILIAN_TYPES: readonly StudentType[] = [
  'evacuee',
  'october7_victim',
  'bereaved_family',
];

const SECURITY_SELF_TYPES: readonly StudentType[] = ['security_forces'];

/**
 * FIX 5 — spouse/parent gate.
 *
 * A `reserves_spouse` / `security_spouse` profile carries the PARTNER's
 * service days in the same day fields. It INHERITS the partner's membership
 * ONLY IF the spouse is a parent of a child ≤13 (`isParentWithChildren`).
 *
 * Returns true when the day-based / security criteria should be evaluated for
 * this profile (i.e. either the student served themselves, or they are an
 * eligible spouse who passes the parent gate).
 */
function partnerCriteriaApply(p: Profile): boolean {
  switch (p.studentType) {
    case 'reserves':
    case 'security_forces':
      return true; // served in their own right
    case 'reserves_spouse':
    case 'security_spouse':
      return p.isParentWithChildren === true; // gate
    default:
      return false; // civilian tracks never inherit service criteria
  }
}

/* ------------------------------------------------------------------ *
 * Per-subgroup atomic predicates (each computed from its OWN criteria) *
 * ------------------------------------------------------------------ */

/*
 * PER-SEMESTER EVALUATION (תשפ"ו, lecturer note 3 "best-of A or B"):
 * criteria phrased "במהלך הסמסטר" are satisfied if EITHER סמסטר א' OR ב' meets
 * them. Yearly criteria (2ב) use the derived total = semesterADays+semesterBDays.
 */

/** G3_MILITARY — extensive reserve service (Section 3, ק3-צבאי). */
function isG3Military(p: Profile): boolean {
  return (
    // 35+ cumulative days in EITHER semester (best-of A/B). Per the מתווה table,
    // criterion 1 of group 3 LEADS with "35 יום ומעלה במצטבר במהלך הסמסטר", and the
    // *** footnote couples "35 ימים בסמסטר א'/ב'" directly with group 3 — WITHOUT
    // restating ייעוד קדמי. So 35 days alone qualify; "ייעוד קדמי בהתאם לאישור צה"ל"
    // is the IDF-approval qualifier on the day count, NOT a separate gate.
    p.semesterADays >= 35 ||
    p.semesterBDays >= 35 ||
    p.cumulativeSince2024 >= 200 || // 200+ since 01.01.2024
    (p.isFrontLine && p.cumulativeSinceOct2023 >= 300) // 300+ frontline since Oct 2023 (ייעוד קדמי still gates this route)
  );
}

/** G2_RESERVES — significant reserve service (Section 3, ק2-מילואים 2א/2ב/2ג). */
function isG2Reserves(p: Profile): boolean {
  return (
    p.semesterADays >= 21 || // 2א — best-of semester A
    p.semesterBDays >= 21 || // 2א — best-of semester B
    totalMiluim(p) >= 35 || // 2ב — annual total (A + B)
    p.preSemesterDays >= 60 // 2ג — 3 months pre-semester (אוג'–אוק' 2025)
  );
}

/** G1 — minimal reserve service, 10–21 days in EITHER semester (Section 3, ק1). */
function isG1(p: Profile): boolean {
  return (
    (p.semesterADays >= 10 && p.semesterADays < 21) ||
    (p.semesterBDays >= 10 && p.semesterBDays < 21)
  );
}

/* ------------------------------------------------------------------ *
 * qualifyingSubgroups — the public classifier.                        *
 * ------------------------------------------------------------------ */

/**
 * Returns the SET of all subgroups the profile satisfies.
 *
 * Tracks are independent:
 *   - CIVILIAN track   → G3_CIVILIAN (no service required)
 *   - SECURITY track   → G2_SECURITY (self or eligible spouse)
 *   - RESERVE/MILITARY ladder → G3_MILITARY ⊇ G2_RESERVES ⊇ G1
 *
 * MONOTONIC CLOSURE applies ONLY along the reserve/military ladder: per the
 * contract ("a G3_MILITARY reservist also satisfies G2_RESERVES and G1"), a
 * higher reserve tag implies every lower reserve tag. This is what lets the
 * union-of-benefits give a heavy reservist the G1-level perks (copy cards,
 * private lessons) even when their raw semesterDays fall outside [10,21).
 *
 * The civilian and security tracks are NOT folded into this ladder — by the
 * Section 4 truth table, G3_CIVILIAN and G2_SECURITY do NOT receive the
 * reserve-only benefits (copy cards, etc.), so they must stay atomic.
 */
export function qualifyingSubgroups(p: Profile): Set<Subgroup> {
  const subs = new Set<Subgroup>();

  // --- CIVILIAN track (Section 3, ק3-אזרחי) — no service required.
  if (CIVILIAN_TYPES.includes(p.studentType)) {
    subs.add('G3_CIVILIAN');
  }

  // --- SECURITY track (Section 3, ק2-ביטחון) — self, or spouse passing gate.
  if (
    SECURITY_SELF_TYPES.includes(p.studentType) ||
    (p.studentType === 'security_spouse' && partnerCriteriaApply(p))
  ) {
    subs.add('G2_SECURITY');
  }

  // --- RESERVE / MILITARY ladder — evaluated from the profile's service-day
  //     fields. FIX 1 (union): the reserve ladder is NOT gated on studentType
  //     being 'reserves'. Any SELF-served student (incl. an evacuee / security
  //     person who ALSO performed reserve duty) joins the reserve subgroups
  //     when their day counters cross the thresholds, yielding the UNION of
  //     civilian/security + reserve benefits. For a SPOUSE the day fields hold
  //     the PARTNER's days, so inheritance is gated by the parent flag (FIX 5).
  const reserveDaysApply =
    p.studentType === 'reserves_spouse' || p.studentType === 'security_spouse'
      ? p.isParentWithChildren === true
      : true;

  if (reserveDaysApply) {
    const g3m = isG3Military(p);
    const g2r = isG2Reserves(p);
    const g1 = isG1(p);

    if (g3m) subs.add('G3_MILITARY');
    if (g2r) subs.add('G2_RESERVES');
    if (g1) subs.add('G1');

    // Monotonic closure along the reserve ladder (G3_MILITARY → G2_RESERVES → G1).
    if (subs.has('G3_MILITARY')) {
      subs.add('G2_RESERVES');
      subs.add('G1');
    }
    if (subs.has('G2_RESERVES')) {
      subs.add('G1');
    }
  }

  return subs;
}

/* ------------------------------------------------------------------ *
 * classificationReasonHe — short Hebrew explanation of the WHY.       *
 * Tone reused from legacy calculator.ts getClassificationReason.      *
 * ------------------------------------------------------------------ */

/** Spouse-by-parent-gate prefix (FIX 5), or '' for a self-served student. */
function spousePrefix(p: Profile): string {
  if (p.studentType === 'reserves_spouse' || p.studentType === 'security_spouse') {
    return 'בן/בת זוג של משרת/ת (הורה לילד עד גיל 13): ';
  }
  return '';
}

/** Days of the best (higher) semester — used for "במהלך הסמסטר" phrasing. */
function bestSemesterDays(p: Profile): number {
  return Math.max(p.semesterADays, p.semesterBDays);
}

/** Reason for the highest reserve-ladder tag actually triggered, from raw p. */
function militaryReasonHe(p: Profile): string | null {
  if (isG3Military(p)) {
    if (p.semesterADays >= 35 || p.semesterBDays >= 35) {
      return `שירות של ${bestSemesterDays(p)} ימים במהלך הסמסטר (קבוצה 3 — צבאי).`;
    }
    if (p.cumulativeSince2024 >= 200) {
      return `סך ${p.cumulativeSince2024} ימי שירות לפחות מ-01.01.2024 (קבוצה 3 — צבאי).`;
    }
    if (p.isFrontLine && p.cumulativeSinceOct2023 >= 300) {
      return `שירות ייעודי קדמי של ${p.cumulativeSinceOct2023} ימים לפחות מאוקטובר 2023 (קבוצה 3 — צבאי).`;
    }
  }
  if (isG2Reserves(p)) {
    if (p.semesterADays >= 21 || p.semesterBDays >= 21) {
      return `שירות של ${bestSemesterDays(p)} ימים במהלך הסמסטר (קבוצה 2 — מילואים).`;
    }
    if (totalMiluim(p) >= 35) {
      return `שירות של ${totalMiluim(p)} ימים במהלך שנת הלימודים תשפ"ו (קבוצה 2 — מילואים).`;
    }
    if (p.preSemesterDays >= 60) {
      return `שירות של ${p.preSemesterDays} ימים ב-3 החודשים שקדמו לסמסטר (קבוצה 2 — מילואים).`;
    }
  }
  if (isG1(p)) {
    return `שירות של ${bestSemesterDays(p)} ימים במהלך הסמסטר (קבוצה 1).`;
  }
  return null;
}

/**
 * Builds a concise Hebrew explanation of why the profile landed in `subs`.
 * Mentions each independent track that contributed (civilian / security /
 * reserve), and for the reserve ladder reports the single highest tag.
 *
 * When `subs` is empty the profile gets no dedicated benefit subgroup, but —
 * per FIX 4 — the חוק זכויות הסטודנט statutory floor still applies, so the
 * message says so rather than implying "no rights at all".
 */
export function classificationReasonHe(p: Profile, subs: Set<Subgroup>): string {
  const parts: string[] = [];

  if (subs.has('G3_CIVILIAN')) {
    parts.push('זכאות כנפגע/ת אזרחי/ת של מלחמת חרבות ברזל (קבוצה 3 — אזרחי).');
  }

  if (subs.has('G2_SECURITY')) {
    parts.push(
      `${spousePrefix(p)}זכאות כאיש/אשת כוחות ביטחון, הצלה ורפואה (קבוצה 2 — כוחות ביטחון).`,
    );
  }

  // Reserve ladder — report the single highest triggered reason.
  if (subs.has('G3_MILITARY') || subs.has('G2_RESERVES') || subs.has('G1')) {
    const reason = militaryReasonHe(p);
    if (reason) parts.push(`${spousePrefix(p)}${reason}`);
  }

  if (parts.length === 0) {
    return 'לא נמצאה זכאות לקבוצת הטבות ייעודית, אך זכויות הבסיס לפי חוק זכויות הסטודנט עדיין חלות.';
  }

  return parts.join(' ');
}
