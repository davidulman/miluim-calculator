/**
 * engine/types.ts — THE CONTRACT (types + ids only, NO logic)
 * ============================================================
 * מחשבון זכויות לסטודנטים במילואים — אוניברסיטת חיפה
 *
 * This file is the single source of truth for the refactored rights engine's
 * SHAPE. It contains ONLY type/interface/const-id declarations — no runtime
 * logic, no eligibility evaluation, no imports from other engine files.
 *
 * Authoritative source: /Users/davidulman/Programing/law/miluim/claude.md
 *   - Section 3 → subgroup structure
 *   - Section 4 → the per-subgroup V/X benefit truth table (CANONICAL)
 *
 * Downstream agents implement `benefits.ts` (the Benefit[] catalog filling
 * ALL_BENEFIT_IDS) and `resolve.ts` (qualifyingSubgroups + resolveRights).
 *
 * NOTE: pure TypeScript. NO React / Next imports. Fully unit-testable.
 */

/* ------------------------------------------------------------------ *
 * Re-declared primitive form types (kept local so this file compiles  *
 * in isolation — field names mirror lib/types.ts CalculatorInput so   *
 * the UI maps cleanly).                                                *
 * ------------------------------------------------------------------ */

export type StudentType =
  | 'reserves'
  | 'reserves_spouse'
  | 'evacuee'
  | 'october7_victim'
  | 'bereaved_family'
  | 'security_forces'
  | 'security_spouse';

export type DegreeLevel = 'bachelor' | 'master' | 'doctorate';

/*
 * NOTE (lecturer דלית, note 1): the institution selector was REMOVED.
 * Scope is undergraduate at the University of Haifa; institution is always
 * Haifa, so `InstitutionType` no longer exists on the Profile.
 */

/* ------------------------------------------------------------------ *
 * Subgroups — the 5 ATOMIC eligibility tags.                          *
 * A profile may hold MORE THAN ONE simultaneously (monotonic:         *
 * a G3_MILITARY reservist also satisfies G2_RESERVES and G1).         *
 * ------------------------------------------------------------------ */

export type Subgroup =
  | 'G3_CIVILIAN' // נפגעים אזרחיים (מפונה / נפגע 7.10 / משפחה שכולה) — ללא דרישת שירות
  | 'G3_MILITARY' // שירות מילואים נרחב (35+ בסמסטר / 200 מ-2024 / קדמי+300 מאוק' 2023)
  | 'G2_SECURITY' // כוחות ביטחון/הצלה/רפואה + בני/בנות זוג
  | 'G2_RESERVES' // שירות משמעותי (סמסטר≥21 / שנתי≥35 / טרום-סמסטר≥60)
  | 'G1'; // שירות מינימלי (10–21 ימים בסמסטר)

/**
 * Numeric tier per subgroup (3,3,2,2,1) — used only for the "available
 * from" locked-UI labels (higher tier = more benefits). It does NOT
 * imply ordering of eligibility; eligibility is per-benefit predicate.
 */
export interface SubgroupMeta {
  id: Subgroup;
  tier: 1 | 2 | 3;
  labelHe: string; // human label, e.g. "קבוצה 3 — צבאי"
  bucketLabelHe: string; // bucket-switch label, e.g. "קבוצה 3 (צבאי)" (note 3)
  availableFromHe: string; // short label for locked UI, e.g. "זמין מקבוצה 3"
}

export const SUBGROUP_ORDER: readonly Subgroup[] = [
  'G3_CIVILIAN',
  'G3_MILITARY',
  'G2_SECURITY',
  'G2_RESERVES',
  'G1',
] as const;

export const SUBGROUP_META: Record<Subgroup, SubgroupMeta> = {
  G3_CIVILIAN: {
    id: 'G3_CIVILIAN',
    tier: 3,
    labelHe: 'קבוצה 3 — אזרחי',
    bucketLabelHe: 'קבוצה 3 (אזרחי)',
    availableFromHe: 'זמין מקבוצה 3',
  },
  G3_MILITARY: {
    id: 'G3_MILITARY',
    tier: 3,
    labelHe: 'קבוצה 3 — צבאי',
    bucketLabelHe: 'קבוצה 3 (צבאי)',
    availableFromHe: 'זמין מקבוצה 3',
  },
  G2_SECURITY: {
    id: 'G2_SECURITY',
    tier: 2,
    labelHe: 'קבוצה 2 — כוחות ביטחון',
    bucketLabelHe: 'קבוצה 2 (ביטחון)',
    availableFromHe: 'זמין מקבוצה 2',
  },
  G2_RESERVES: {
    id: 'G2_RESERVES',
    tier: 2,
    labelHe: 'קבוצה 2 — מילואים',
    bucketLabelHe: 'קבוצה 2 (מילואים)',
    availableFromHe: 'זמין מקבוצה 2',
  },
  G1: {
    id: 'G1',
    tier: 1,
    labelHe: 'קבוצה 1',
    bucketLabelHe: 'קבוצה 1',
    availableFromHe: 'זמין מקבוצה 1',
  },
};

/* ------------------------------------------------------------------ *
 * Profile — the engine input. Reuses CalculatorInput field names.     *
 * For a spouse profile, the PARTNER's service days are captured into  *
 * these same day fields (see FIX 5 spouse/parent gate in resolve.ts). *
 * ------------------------------------------------------------------ */

/**
 * ProfileInput — the RAW user-entered shape (תשפ"ו semester-based model).
 *
 * `totalMiluimDays` is intentionally ABSENT here: it is never an input. It is
 * derived (semesterADays + semesterBDays) by `normalizeProfile` in normalize.ts
 * and surfaces only on the resolved `Profile`. Day fields accept .5 increments
 * (half-days, lecturer note 6). For a spouse, the day fields hold the PARTNER's
 * service (see FIX 5 spouse/parent gate in subgroups.ts).
 */
export interface ProfileInput {
  studentType: StudentType;
  degreeLevel: DegreeLevel; // NO institutionType (note 1 — always Haifa)

  // תשפ"ו semester-based service-day counters (allow .5 half-days)
  semesterADays: number; // סמסטר א' תשפ"ו (נפתח 26.10.2025)
  semesterBDays: number; // סמסטר ב' תשפ"ו
  preSemesterDays: number; // אוג'–אוק' 2025 (קריטריון 2ג)
  cumulativeSince2024: number; // מ-01.01.2024 (קריטריון 200+)
  cumulativeSinceOct2023: number; // מאוקטובר 2023 (קריטריון 300+)

  isFrontLine: boolean; // שירות ייעודי קדמי (אישור צה"ל)
  isParentWithChildren: boolean; // הורה לילד עד גיל 13 (gate for spouse inheritance)
}

/**
 * Profile — the engine input AFTER normalization. Identical to ProfileInput
 * plus the AUTO-DERIVED, read-only `totalMiluimDays` ("סך הכל מילואים").
 * Always produced by `normalizeProfile`; engine code may also recompute the
 * sum on demand via `totalMiluim(p)` (normalize.ts).
 */
export interface Profile extends ProfileInput {
  /** DERIVED, read-only: semesterADays + semesterBDays (exact float, half-days OK). */
  readonly totalMiluimDays: number;
}

/* ------------------------------------------------------------------ *
 * Benefit category — reused from existing lib/types.ts Right.category. *
 * ------------------------------------------------------------------ */

export type BenefitCategory =
  | 'exemption'
  | 'gradeConversion'
  | 'alternativeEvaluation'
  | 'flexibility'
  | 'extra'
  | 'support';

/* ------------------------------------------------------------------ *
 * Benefit — one atomic right. `eligible()` is OR across the user's    *
 * qualifying subgroups (FIX 1 union). It may also branch on           *
 * degreeLevel and on raw day counters (FIX 3 independent predicates). *
 * `availableFromHe` is a static label of the LOWEST qualifying        *
 * subgroup, for the locked UI.                                        *
 * ------------------------------------------------------------------ */

export interface Benefit {
  id: string;
  titleHe: string;
  descriptionHe: string;
  category: BenefitCategory;
  notes?: string; // הערות (e.g. the *** footnote, STEM list)
  limitsHe?: string; // הגבלות (e.g. ceilings on grade conversion / exemptions)
  availableFromHe: string; // short locked-UI label, e.g. "זמין מקבוצה 3"
  /**
   * Exam-dependent benefit (25% time / 2-of-3 dates / choose-higher-grade /
   * alternative-evaluation). When degreeLevel==='doctorate' (no exams) these
   * are routed by resolve.ts into `notRelevant` with a Hebrew note (note 2).
   */
  examBased?: boolean;
  eligible: (p: Profile, subs: Set<Subgroup>) => boolean;
}

/* ------------------------------------------------------------------ *
 * Baseline rights — חוק זכויות הסטודנט (Section 5.1). ALWAYS returned  *
 * for any reservist/spouse, even <10 days / NOT_ELIGIBLE (FIX 4).     *
 * ------------------------------------------------------------------ */

export interface BaselineRight {
  id: string;
  titleHe: string;
  descriptionHe: string;
}

/* ------------------------------------------------------------------ *
 * ResolvedRights — output of resolveRights(profile).                  *
 * ------------------------------------------------------------------ */

/**
 * NotRelevantBenefit — a benefit excluded for degree reasons (note 2), with the
 * explanatory Hebrew note (e.g. "לא רלוונטי לתואר שלישי (אין בחינות)").
 */
export interface NotRelevantBenefit {
  benefit: Benefit;
  noteHe: string;
}

/**
 * Bucket — one INDEPENDENT qualifying group/track the profile lands in, with
 * its OWN eligible/locked/notRelevant lists so the UI can let the user SWITCH
 * between qualifying buckets to compare (lecturer note 3). The reserve ladder
 * (G3_MILITARY → G2_RESERVES → G1) collapses into a SINGLE bucket whose root is
 * the highest reserve tag attained; civilian and security tracks are their own
 * buckets.
 */
export interface Bucket {
  id: Subgroup; // representative (root) subgroup of the track
  labelHe: string; // bucket-switch label, e.g. "קבוצה 3 (צבאי)"
  subgroups: Subgroup[]; // subgroups folded into this bucket (ladder closure)
  eligible: Benefit[]; // benefits granted by THIS bucket alone
  locked: Benefit[];
  notRelevant: NotRelevantBenefit[];
  isDefault: boolean; // true for the bucket with the MOST eligible benefits
}

export interface ResolvedRights {
  subgroups: Subgroup[]; // ALL subgroups the profile satisfies (FIX 1 union)
  buckets: Bucket[]; // distinct qualifying tracks, for switch/compare (note 3)
  defaultBucketId: Subgroup | null; // bucket with the most eligible (note 3)
  multiBucket: boolean; // true when buckets.length>1 → show disclaimer (note 4)
  eligible: Benefit[]; // UNION of benefits across ALL subgroups (exemption-collapsed)
  locked: Benefit[]; // benefits the user does NOT get
  notRelevant: NotRelevantBenefit[]; // excluded for degree reasons (note 2)
  baseline: BaselineRight[]; // statutory floor — always present (FIX 4)
}

/* ------------------------------------------------------------------ *
 * ALL_BENEFIT_IDS — the canonical contract. Every id here MUST be      *
 * implemented as exactly one Benefit object in benefits.ts. Derived    *
 * directly from Section 4 of the spec. Ordered by Section 4 numbering. *
 *                                                                      *
 * EXEMPTION LADDER (FIX / collapse): the three credit-waivers          *
 *   exemption-8nz > exemption-6nz > exemption-2nz form a ladder.       *
 *   resolveRights surfaces ONLY the highest the user qualifies for in  *
 *   `eligible`; the lower ones may appear in `locked` as informational.*
 *                                                                      *
 * EXTEND-STUDIES LADDER (FIX 3 / §4.12): 2sem (totalMiluimDays>=84)    *
 *   collapses over 1sem (totalMiluimDays>=42), computed DIRECTLY from   *
 *   totalMiluim(p) = semesterADays+semesterBDays — NOT from subgroups.  *
 * ------------------------------------------------------------------ */

export const ALL_BENEFIT_IDS = [
  // 4.1 — credit-point exemption ladder
  'exemption-8nz', // G3_MILITARY
  'exemption-6nz', // G2_RESERVES
  'exemption-2nz', // G1
  // 4.2 — grade conversion to "pass"
  'grade-conversion-g3', // G3_CIVILIAN + G3_MILITARY
  'grade-conversion-g2', // G2_SECURITY + G2_RESERVES  (FIX 6: security ADDED)
  // 4.3 — alternative evaluation (civilian/security flavor, excl. medicine)
  'alt-eval-no-stem', // G3_CIVILIAN + G2_SECURITY
  // 4.5 — 25% extra exam time
  'extra-time-25', // G3_CIVILIAN + G3_MILITARY  (FIX 2: NOT G2_RESERVES/G1)
  // 4.6 — two of three exam dates (+ extra date within 30d of service end)
  'exam-two-of-three', // G3_MILITARY + G2_RESERVES
  // 4.7 — choose higher grade / alt-eval incl. STEM (military/reserves flavor)
  'choose-higher-grade', // G3_MILITARY + G2_RESERVES
  // 4.4 — progress without prerequisite enforcement
  'skip-prerequisites', // G3_MILITARY + G2_RESERVES
  // 4.8 — thesis / doctorate submission extension
  'thesis-extension', // G3_CIVILIAN + G3_MILITARY (all of group 3)
  // 4.9 — free photocopy cards
  'copy-cards', // G3_MILITARY + G2_RESERVES + G1
  // 4.10 — free private lessons
  'private-lessons', // G3_MILITARY + G2_RESERVES + G1
  // 4.11 — schedule-change flexibility
  'schedule-flexibility', // G3_MILITARY + G2_RESERVES
  // 4.12 — study extension ladder (independent yearlyDays predicates, FIX 3)
  'extend-studies-2sem', // yearlyDays >= 84
  'extend-studies-1sem', // yearlyDays >= 42
] as const;

export type BenefitId = (typeof ALL_BENEFIT_IDS)[number];
