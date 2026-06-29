import { GroupInfo, GroupClassification } from './types';

export const GROUPS: Record<GroupClassification, GroupInfo> = {
  GROUP_3_CIVILIAN: {
    id: 'GROUP_3_CIVILIAN',
    nameHe: 'קבוצה 3 - אזרחים',
    descriptionHe: 'נפגעים אזרחיים מלחמת חרבות ברזל',
    color: 'bg-blue-100 border-r-4 border-blue-600',
    rights: [
      'grade-conversion-3-bachelor',
      'grade-conversion-3-master',
      'alternative-evaluation',
      'extra-25-percent-time',
      'multiple-exam-dates',
    ],
  },

  GROUP_3_MILITARY: {
    id: 'GROUP_3_MILITARY',
    nameHe: 'קבוצה 3 - צבאי',
    descriptionHe: 'סטודנטים עם שירות מילואים קדמי נרחב',
    color: 'bg-green-100 border-r-4 border-green-600',
    rights: [
      'waiver-credits-bachelor-3-8nz',
      'waiver-credits-master-4-shass',
      'grade-conversion-3-bachelor',
      'grade-conversion-3-master',
      'extra-25-percent-time',
      'multiple-exam-dates',
      'choose-higher-grade',
      'skip-prerequisites',
      'flexibility-schedule',
      'copy-cards',
      'private-lessons',
      'extend-studies-2-semesters',
      'thesis-extension-military',
    ],
  },

  GROUP_2_RESERVES: {
    id: 'GROUP_2_RESERVES',
    nameHe: 'קבוצה 2 - מילואים',
    descriptionHe: 'סטודנטים משרתי מילואים משמעותיים',
    color: 'bg-purple-100 border-r-4 border-purple-600',
    rights: [
      'waiver-credits-bachelor-2-6nz',
      'waiver-credits-master-2-4shass',
      'grade-conversion-2-bachelor',
      'grade-conversion-2-master',
      'choose-higher-grade',
      'multiple-exam-dates',
      'skip-prerequisites',
      'copy-cards',
      'private-lessons',
      'flexibility-schedule',
      'extend-studies-1-semester',
    ],
  },

  GROUP_2_SECURITY: {
    id: 'GROUP_2_SECURITY',
    nameHe: 'קבוצה 2 - כוחות ביטחון',
    descriptionHe: 'אנשי כוחות ביטחון, הצלה ורפואה',
    color: 'bg-yellow-100 border-r-4 border-yellow-600',
    rights: ['alternative-evaluation-security'],
  },

  GROUP_1: {
    id: 'GROUP_1',
    nameHe: 'קבוצה 1',
    descriptionHe: 'שירות מילואים מינימלי (10-21 ימים)',
    color: 'bg-gray-100 border-r-4 border-gray-600',
    rights: ['waiver-credits-1-2nz', 'copy-cards', 'private-lessons'],
  },

  NOT_ELIGIBLE: {
    id: 'NOT_ELIGIBLE',
    nameHe: 'לא זכאי',
    descriptionHe: 'לא עומד בקריטריונים',
    color: 'bg-red-100 border-r-4 border-red-600',
    rights: [],
  },
};

export const getGroupInfo = (group: GroupClassification): GroupInfo => {
  return GROUPS[group];
};
