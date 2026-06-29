/**
 * components/calculator/benefitMeta.ts — UI labels for benefit categories.
 */
import type { BenefitCategory } from '@/lib/engine/types';

export const CATEGORY_ICON: Record<BenefitCategory, string> = {
  exemption: '📚',
  gradeConversion: '📝',
  alternativeEvaluation: '✅',
  flexibility: '⚡',
  extra: '⏱️',
  support: '🤝',
};

export const CATEGORY_LABEL: Record<BenefitCategory, string> = {
  exemption: 'פטור מנקודות זכות',
  gradeConversion: 'המרת ציון ל"עובר"',
  alternativeEvaluation: 'הערכה חלופית',
  flexibility: 'גמישות אקדמית',
  extra: 'הקלות בבחינות',
  support: 'תמיכה וסיוע',
};
