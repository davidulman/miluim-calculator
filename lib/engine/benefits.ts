/**
 * engine/benefits.ts — THE BENEFIT CATALOG (Section 4.1–4.12)
 * ==========================================================
 * מחשבון זכויות לסטודנטים במילואים — אוניברסיטת חיפה
 *
 * One Benefit object per id in ALL_BENEFIT_IDS. Each `eligible(p, subs)`
 * encodes Section 4's V/X truth table as an OR across the user's qualifying
 * subgroups (FIX 1 — union of multi-membership). Predicates may also branch
 * on degreeLevel and on raw day counters (FIX 3 — independent predicates).
 *
 * Authoritative source: /Users/davidulman/Programing/law/miluim/claude.md §4.
 *
 * FIXES encoded here:
 *   FIX 1 — eligible() = OR across subs (a reservist who is also an evacuee
 *           gets the union; handled because each benefit just tests its own
 *           qualifying subgroups against the user's FULL subgroup set).
 *   FIX 2 — 25% time / 2-of-3 dates / choose-higher-grade follow §4.5/4.6/4.7
 *           V/X exactly: extra-time-25 is G3 ONLY (NOT G2_RESERVES / G1).
 *   FIX 3 — extend-studies is computed from yearlyDays directly (>=84 / >=42),
 *           NOT from static subgroup membership.
 *   FIX 6 — grade-conversion-g2 includes G2_SECURITY (was missing in rights.ts).
 *
 * Ladder collapse (exemption-8nz>6nz>2nz, extend-studies-2sem>1sem) is the
 * concern of resolve.ts; here every predicate is independent and monotonic.
 *
 * NOTE: pure TypeScript. NO React / Next imports. Fully unit-testable.
 */

import type { Benefit, Profile, Subgroup } from './types';
import { totalMiluim } from './normalize';

/* Helper — true if the user's subgroup set contains ANY of the given tags.
 * This is the mechanical implementation of FIX 1 (OR across subgroups). */
const hasAny = (subs: Set<Subgroup>, ...ids: Subgroup[]): boolean =>
  ids.some((id) => subs.has(id));

/* Shared limit/notes copy reused across benefits (Section 4 quoted text). */
const GRADE_CONVERSION_LIMITS =
  'הגבלות: לא ניתן להמיר ציון מספרי ל"עובר" בקורס שנדרש בו ציון מספרי כתנאי לרישוי מקצועי, ולא בקורס חובה בתואר שני. מספר הקורסים בהמרה ל"עובר" בכל התואר לא יעלה על 5 בתואר ראשון ו-2 בתואר שני. סך נ"ז הקורסים בציון "עובר" (כולל מסמסטרים קודמים) לא יעלה על 10% מסך הנ"ז לתואר. בתואר שני: סך השש"ס בציון "עובר" + פטור לא יעלה על 8 שש"ס.';

const STEM_NOTE =
  'ההנחיה חלה גם על מקצועות STEM (מדמ"ח, ביו-פיזיקה, מתמטיקה, סטטיסטיקה, מערכות מידע, כלכלה, פיזיותרפיה, ריפוי בעיסוק, הפרעות בתקשורת).';

const NO_STEM_NOTE =
  'לא כולל תחומי רפואה ו/או מקצועות פרופסיונליים בהם נדרש ציון מספרי מהאוניברסיטה.';

export const BENEFITS: Benefit[] = [
  /* ============================================================ *
   * 4.1 — פטור מנקודות זכות (סולם פטורים: 8 נ"ז > 6 נ"ז > 2 נ"ז)   *
   * ============================================================ */
  {
    id: 'exemption-8nz',
    titleHe: 'פטור 8 נ"ז (תואר ראשון) / 4 שש"ס (תואר שני)',
    descriptionHe:
      'פטור מ-8 נקודות זכות בתואר ראשון, או מ-4 שש"ס בתואר שני, בקורסי בחירה, כלליים וקורסים אחרים כפי שקבע המוסד. ראש סולם הפטורים.',
    category: 'exemption',
    limitsHe:
      'לכל היותר 10 נ"ז בתואר ראשון ו-4 שש"ס בתואר שני במצטבר בכל התואר.',
    availableFromHe: 'זמין מקבוצה 3',
    eligible: (_p: Profile, subs: Set<Subgroup>) => hasAny(subs, 'G3_MILITARY'),
  },
  {
    id: 'exemption-6nz',
    titleHe: 'פטור 6 נ"ז (תואר ראשון) / 4 שש"ס (תואר שני)',
    descriptionHe:
      'פטור מ-6 נקודות זכות בתואר ראשון, או מ-4 שש"ס בתואר שני, בקורסי בחירה, כלליים וקורסים אחרים. אמצע סולם הפטורים.',
    category: 'exemption',
    limitsHe:
      'לכל היותר 10 נ"ז בתואר ראשון ו-4 שש"ס בתואר שני במצטבר בכל התואר.',
    availableFromHe: 'זמין מקבוצה 2',
    eligible: (_p: Profile, subs: Set<Subgroup>) => hasAny(subs, 'G2_RESERVES'),
  },
  {
    id: 'exemption-2nz',
    titleHe: 'פטור 2 נ"ז / שש"ס',
    descriptionHe:
      'פטור מ-2 נ"ז/שש"ס בהתאם לחוק סטודנטים משרתי מילואים — פעילות חברתית, קורסי בחירה כלליים בתואר ראשון ובתואר שני. תחתית סולם הפטורים.',
    category: 'exemption',
    availableFromHe: 'זמין מקבוצה 1',
    eligible: (_p: Profile, subs: Set<Subgroup>) => hasAny(subs, 'G1'),
  },

  /* ============================================================ *
   * 4.2 — המרת ציון ל"עובר"                                       *
   * ============================================================ */
  {
    id: 'grade-conversion-g3',
    titleHe: 'המרת ציון ל"עובר" — 3 קורסים (תואר ראשון) / 2 (תואר שני)',
    descriptionHe:
      'אפשרות להמיר ציון מספרי ל"עובר" בשנת תשפ"ו ב-3 קורסים בתואר ראשון או ב-2 קורסים בתואר שני, בקורס לבחירת הסטודנט, בתנאי שעמד בדרישות המעבר.',
    category: 'gradeConversion',
    limitsHe: GRADE_CONVERSION_LIMITS,
    availableFromHe: 'זמין מקבוצה 3',
    eligible: (_p: Profile, subs: Set<Subgroup>) =>
      hasAny(subs, 'G3_CIVILIAN', 'G3_MILITARY'),
  },
  {
    id: 'grade-conversion-g2',
    // FIX 6 — G2_SECURITY added (was missing in rights.ts)
    titleHe: 'המרת ציון ל"עובר" — 2 קורסים (תואר ראשון) / 1 (תואר שני)',
    descriptionHe:
      'אפשרות להמיר ציון מספרי ל"עובר" בשנת תשפ"ו ב-2 קורסים בתואר ראשון או בקורס אחד בתואר שני, בקורס לבחירת הסטודנט, בתנאי שעמד בדרישות המעבר.',
    category: 'gradeConversion',
    notes: 'חל גם על כוחות ביטחון/הצלה/רפואה ובני/בנות זוגם (תת-קבוצה 2-ביטחון).',
    limitsHe: GRADE_CONVERSION_LIMITS,
    availableFromHe: 'זמין מקבוצה 2',
    eligible: (_p: Profile, subs: Set<Subgroup>) =>
      hasAny(subs, 'G2_SECURITY', 'G2_RESERVES'),
  },

  /* ============================================================ *
   * 4.3 — הערכה חלופית לבחינה (גרסה אזרחית/ביטחון, ללא STEM)       *
   * ============================================================ */
  {
    id: 'alt-eval-no-stem',
    titleHe: 'הערכה חלופית לבחינה',
    descriptionHe:
      'אפשרות להערכה חלופית/בחינה מותאמת במקום בחינה, בהתאם לשיקול דעת המרצה או החוג.',
    category: 'alternativeEvaluation',
    notes: NO_STEM_NOTE,
    availableFromHe: 'זמין מקבוצה 2',
    examBased: true, // alternative-evaluation — לא רלוונטי לתואר שלישי
    eligible: (_p: Profile, subs: Set<Subgroup>) =>
      hasAny(subs, 'G3_CIVILIAN', 'G2_SECURITY'),
  },

  /* ============================================================ *
   * 4.5 — תוספת 25% זמן בבחינות                                   *
   * FIX 2: G3 בלבד (G3_CIVILIAN + G3_MILITARY) — לא G2_RESERVES/G1 *
   * ============================================================ */
  {
    id: 'extra-time-25',
    titleHe: 'תוספת 25% זמן בבחינות',
    descriptionHe: 'זכאות לתוספת 25% זמן בבחינות בסמסטר א׳ ו/או ב׳.',
    category: 'extra',
    notes:
      '(***) סטודנטים שישרתו 35 ימים ומעלה בסמסטר א׳ ו/או ב׳ וישתייכו לקבוצה 3 — זכאים לתוספת 25% זמן, להיבחן בשניים מתוך שלושת המועדים, ובחירת הציון הגבוה מבין השניים. אינה ניתנת לקבוצה 2-מילואים או לקבוצה 1.',
    availableFromHe: 'זמין מקבוצה 3',
    examBased: true, // 25% exam time — לא רלוונטי לתואר שלישי
    eligible: (_p: Profile, subs: Set<Subgroup>) =>
      hasAny(subs, 'G3_CIVILIAN', 'G3_MILITARY'),
  },

  /* ============================================================ *
   * 4.6 — היבחנות בשניים משלושת המועדים + מועד נוסף תוך 30 יום     *
   * ============================================================ */
  {
    id: 'exam-two-of-three',
    titleHe: 'היבחנות בשניים מתוך שלושת מועדי הבחינה',
    descriptionHe:
      'זכאות להיבחן בשניים מתוך שלושת מועדי הבחינות (א׳, ב׳, חריג), ולמועד בחינה נוסף תוך 30 יום מסיום השירות.',
    category: 'extra',
    availableFromHe: 'זמין מקבוצה 2',
    examBased: true, // 2-of-3 exam dates — לא רלוונטי לתואר שלישי
    eligible: (_p: Profile, subs: Set<Subgroup>) =>
      hasAny(subs, 'G3_MILITARY', 'G2_RESERVES'),
  },

  /* ============================================================ *
   * 4.7 / 4.3 — בחירת הציון הגבוה מבין שניים / הערכה חלופית כולל STEM *
   * ============================================================ */
  {
    id: 'choose-higher-grade',
    titleHe: 'בחירת הציון הגבוה מבין שני מועדים / הערכה חלופית (כולל STEM)',
    descriptionHe:
      'אפשרות לקבל את הציון הגבוה מבין שני מועדי הבחינה, או הערכה חלופית/בחינה מותאמת, בהתאם לשיקול דעת המרצה או החוג.',
    category: 'extra',
    notes: STEM_NOTE,
    availableFromHe: 'זמין מקבוצה 2',
    examBased: true, // choose-higher-grade — לא רלוונטי לתואר שלישי
    eligible: (_p: Profile, subs: Set<Subgroup>) =>
      hasAny(subs, 'G3_MILITARY', 'G2_RESERVES'),
  },

  /* ============================================================ *
   * 4.4 — התקדמות ללא אכיפת דרישות קדם                            *
   * ============================================================ */
  {
    id: 'skip-prerequisites',
    titleHe: 'התקדמות ללא אכיפת דרישות קדם',
    descriptionHe:
      'סטודנטים בשנים מתקדמות שהיו רשומים למקצוע קדם אך לא נבחנו בו בשל שירות מילואים — יוכלו להמשיך בסמסטר העוקב ללא אכיפת דרישת הקדם.',
    category: 'flexibility',
    notes: 'רק לסטודנטים שהיו רשומים לקורס הקדם.',
    availableFromHe: 'זמין מקבוצה 2',
    eligible: (_p: Profile, subs: Set<Subgroup>) =>
      hasAny(subs, 'G3_MILITARY', 'G2_RESERVES'),
  },

  /* ============================================================ *
   * 4.8 — הארכת מועד הגשת תזה/דוקטורט (כל קבוצה 3)                 *
   * ============================================================ */
  {
    id: 'thesis-extension',
    titleHe: 'הארכת מועד הגשת עבודת תזה/דוקטורט',
    descriptionHe:
      'סטודנטים בשנה"ל תשפ"ו המשתייכים לקבוצה 3 יוכלו להגיש עבודת תזה/דוקטורט עד 8 במרץ 2026, ללא עלות.',
    category: 'support',
    availableFromHe: 'זמין מקבוצה 3',
    eligible: (_p: Profile, subs: Set<Subgroup>) =>
      hasAny(subs, 'G3_CIVILIAN', 'G3_MILITARY'),
  },

  /* ============================================================ *
   * 4.9 — כרטיסי צילום ללא עלות                                   *
   * ============================================================ */
  {
    id: 'copy-cards',
    titleHe: 'כרטיסי צילום ללא עלות',
    descriptionHe: 'קבלת כרטיסי צילום ללא עלות לשימוש בספרייה.',
    category: 'support',
    availableFromHe: 'זמין מקבוצה 1',
    eligible: (_p: Profile, subs: Set<Subgroup>) =>
      hasAny(subs, 'G3_MILITARY', 'G2_RESERVES', 'G1'),
  },

  /* ============================================================ *
   * 4.10 — שיעורים פרטיים ללא עלות                                *
   * ============================================================ */
  {
    id: 'private-lessons',
    titleHe: 'שיעורים פרטיים ללא עלות',
    descriptionHe:
      'זכאות לשעת שיעור פרטי ללא עלות על כל יום לימודים שלא נכחו בו בשל שירות המילואים.',
    category: 'support',
    availableFromHe: 'זמין מקבוצה 1',
    eligible: (_p: Profile, subs: Set<Subgroup>) =>
      hasAny(subs, 'G3_MILITARY', 'G2_RESERVES', 'G1'),
  },

  /* ============================================================ *
   * 4.11 — גמישות בשינוי מערכת שעות                               *
   * ============================================================ */
  {
    id: 'schedule-flexibility',
    titleHe: 'גמישות בשינוי מערכת שעות',
    descriptionHe:
      'אפשרות לשנות את מערכת השעות גם לאחר תום מועד השינויים הרגיל, ללא חיוב.',
    category: 'flexibility',
    availableFromHe: 'זמין מקבוצה 2',
    eligible: (_p: Profile, subs: Set<Subgroup>) =>
      hasAny(subs, 'G3_MILITARY', 'G2_RESERVES'),
  },

  /* ============================================================ *
   * 4.12 — הארכת לימודים (FIX 3: predicate ישיר מ-yearlyDays)      *
   * סולם: 2 סמסטרים (>=84) נכבש על-פני סמסטר אחד (>=42)            *
   * ============================================================ */
  {
    id: 'extend-studies-2sem',
    titleHe: 'הארכת לימודים ב-2 סמסטרים ללא תשלום',
    descriptionHe:
      'שירות של 84 ימים מצטבר לפחות במהלך שנת הלימודים תשפ"ו (סמסטר א׳ + ב׳) — הארכת לימודים ב-2 סמסטרים ללא תוספת תשלום.',
    category: 'support',
    availableFromHe: 'זמין מ-84 ימי שירות בשנה',
    // FIX 3 / §4.12 — computed directly from totalMiluim (A+B), NOT from subgroups.
    eligible: (p: Profile) => totalMiluim(p) >= 84,
  },
  {
    id: 'extend-studies-1sem',
    titleHe: 'הארכת לימודים בסמסטר אחד ללא תשלום',
    descriptionHe:
      'שירות של 42 ימים מצטבר לפחות במהלך שנת הלימודים תשפ"ו (סמסטר א׳ + ב׳) — הארכת לימודים בסמסטר אחד ללא תוספת תשלום.',
    category: 'support',
    availableFromHe: 'זמין מ-42 ימי שירות בשנה',
    // FIX 3 / §4.12 — computed directly from totalMiluim (A+B); collapsed by 2sem.
    eligible: (p: Profile) => totalMiluim(p) >= 42,
  },
];
