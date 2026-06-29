/**
 * engine/baseline.ts — BASELINE rights (חוק זכויות הסטודנט)
 * ========================================================
 * מחשבון זכויות לסטודנטים במילואים — אוניברסיטת חיפה
 *
 * Authoritative source: /Users/davidulman/Programing/law/miluim/claude.md
 *   → Section 5.1 (זכויות בסיסיות — חוק זכויות הסטודנט)
 *
 * FIX 4 — STATUTORY FLOOR: these rights are returned by resolveRights()
 * for ANY reservist/spouse profile, regardless of service days or matveh
 * classification (even <10 days / "NOT_ELIGIBLE"). They never depend on a
 * subgroup. The engine must never hide this statutory floor behind an
 * empty result.
 *
 * NOTE: pure TypeScript. NO React / Next imports. Fully unit-testable.
 */

import type { BaselineRight } from './types';

export const BASELINE_RIGHTS: BaselineRight[] = [
  {
    id: 'baseline-absence',
    titleHe: 'היעדרות ללא הגבלה',
    descriptionHe:
      'היעדרות בלי הגבלה מהלימודים בתקופת שירות המילואים, ללא פגיעה בזכויות הסטודנט.',
  },
  {
    id: 'baseline-course-deferral',
    titleHe: 'דחיית קורס ללא תשלום',
    descriptionHe:
      'דחיית קורס ללא תשלום — למי ששירת 10 ימים ומעלה בסמסטר (או 20 ימים ומעלה בשנה לקורס שנתי).',
  },
  {
    id: 'baseline-extra-exam-date',
    titleHe: 'מועד בחינה נוסף',
    descriptionHe:
      'זכאות למועד בחינה נוסף — למי ששירת 10 ימים ומעלה בתקופת הבחינות, או 21 ימים ומעלה בסמסטר הסמוך.',
  },
  {
    id: 'baseline-2nz',
    titleHe: '2 נ"ז עבור שירות מילואים',
    descriptionHe:
      '2 נקודות זכות עבור 14 ימי מילואים ומעלה בשנת לימודים (פעם אחת במהלך התואר).',
  },
  {
    id: 'baseline-assignment-deferral',
    titleHe: 'דחיית מועד הגשת מטלה',
    descriptionHe:
      'דחיית מועד הגשת מטלה — לכל הפחות במספר הימים בהם שירת הסטודנט במילואים.',
  },
  {
    id: 'baseline-recordings',
    titleHe: 'שיעורים מוקלטים / סיכומים',
    descriptionHe:
      'צפייה בהקלטות שיעורים או קבלת סיכום כתוב עבור שיעורים שהוחמצו בשל שירות המילואים.',
  },
];
