import { Right, GroupClassification } from './types';

export const ALL_RIGHTS: Right[] = [
  // Exemption Rights
  {
    id: 'waiver-credits-bachelor-3-8nz',
    titleHe: 'פטור 8 נקודות זכות (תואר ראשון)',
    descriptionHe:
      'פטור מ-8 נקודות זכות בקורסי בחירה, כלליים וקורסים אחרים. לכל היותר 10 נ"ז במצטבר בכל התואר.',
    category: 'exemption',
    groupsEligible: ['GROUP_3_MILITARY'],
    notes: 'בקורסי בחירה בלבד',
  },
  {
    id: 'waiver-credits-master-4-shass',
    titleHe: 'פטור 4 שש"ס (תואר שני)',
    descriptionHe:
      'פטור מ-4 שש"ס בקורסי בחירה ואחרים. לכל היותר 4 שש"ס במצטבר בתואר.',
    category: 'exemption',
    groupsEligible: ['GROUP_3_MILITARY'],
  },
  {
    id: 'waiver-credits-bachelor-2-6nz',
    titleHe: 'פטור 6 נקודות זכות (תואר ראשון)',
    descriptionHe:
      'פטור מ-6 נקודות זכות בקורסי בחירה, כלליים וקורסים אחרים. לכל היותר 10 נ"ז במצטבר בכל התואר.',
    category: 'exemption',
    groupsEligible: ['GROUP_2_RESERVES'],
  },
  {
    id: 'waiver-credits-master-2-4shass',
    titleHe: 'פטור 4 שש"ס (תואר שני)',
    descriptionHe:
      'פטור מ-4 שש"ס בקורסי בחירה ואחרים. לכל היותר 4 שש"ס במצטבר בתואר.',
    category: 'exemption',
    groupsEligible: ['GROUP_2_RESERVES'],
  },
  {
    id: 'waiver-credits-1-2nz',
    titleHe: 'פטור 2 נקודות זכות',
    descriptionHe:
      'פטור מ-2 נ"ז בהתאם לחוק סטודנטים משרתי מילואים - פעילות חברתית, קורסי בחירה כלליים.',
    category: 'exemption',
    groupsEligible: ['GROUP_1'],
  },

  // Grade Conversion Rights
  {
    id: 'grade-conversion-3-bachelor',
    titleHe: 'המרת ציון לעובר - תואר ראשון (3 קורסים)',
    descriptionHe:
      'אפשרות להמיר ציון מספרי ל"עובר" בתואר ראשון בשנת תשפ"ו ב-3 קורסים לבחירת הסטודנט, בקורסים בהם עמד בדרישות המעבר.',
    category: 'gradeConversion',
    groupsEligible: ['GROUP_3_CIVILIAN', 'GROUP_3_MILITARY'],
    notes:
      'הגבלות: לא בקורסים שנדרש בהם ציון מספרי לרישוי, לא בקורסי חובה בתואר שני. סך לא יעלה על 5 קורסים בתואר ראשון.',
  },
  {
    id: 'grade-conversion-3-master',
    titleHe: 'המרת ציון לעובר - תואר שני (2 קורסים)',
    descriptionHe:
      'אפשרות להמיר ציון מספרי ל"עובר" בתואר שני בשנת תשפ"ו ב-2 קורסים לבחירת הסטודנט.',
    category: 'gradeConversion',
    groupsEligible: ['GROUP_3_CIVILIAN', 'GROUP_3_MILITARY'],
    notes: 'הגבלות חלות. סך לא יעלה על 2 קורסים בתואר שני.',
  },
  {
    id: 'grade-conversion-2-bachelor',
    titleHe: 'המרת ציון לעובר - תואר ראשון (2 קורסים)',
    descriptionHe:
      'אפשרות להמיר ציון מספרי ל"עובר" בתואר ראשון בשנת תשפ"ו ב-2 קורסים לבחירת הסטודנט.',
    category: 'gradeConversion',
    groupsEligible: ['GROUP_2_RESERVES'],
  },
  {
    id: 'grade-conversion-2-master',
    titleHe: 'המרת ציון לעובר - תואר שני (קורס אחד)',
    descriptionHe:
      'אפשרות להמיר ציון מספרי ל"עובר" בתואר שני בשנת תשפ"ו בקורס אחד לבחירת הסטודנט.',
    category: 'gradeConversion',
    groupsEligible: ['GROUP_2_RESERVES'],
  },

  // Alternative Evaluation Rights
  {
    id: 'alternative-evaluation',
    titleHe: 'הערכה חלופית לבחינה',
    descriptionHe:
      'אפשרות לערכה חלופית/בחינה מותאמת - לא כולל תחומי רפואה או מקצועות פרופסיונליים שנדרש בהם ציון מהאוניברסיטה.',
    category: 'alternativeEvaluation',
    groupsEligible: ['GROUP_3_CIVILIAN'],
  },
  {
    id: 'alternative-evaluation-security',
    titleHe: 'הערכה חלופית לבחינה',
    descriptionHe:
      'אפשרות לערכה חלופית לבחינה - לא כולל תחומי רפואה או מקצועות פרופסיונליים.',
    category: 'alternativeEvaluation',
    groupsEligible: ['GROUP_2_SECURITY'],
  },

  // Extra Time Rights
  {
    id: 'extra-25-percent-time',
    titleHe: 'תוספת 25% זמן בבחינות',
    descriptionHe: 'זכאות להוספת 25% זמן בבחינות בסמסטר א׳ ו/או ב׳.',
    category: 'extra',
    groupsEligible: ['GROUP_3_CIVILIAN', 'GROUP_3_MILITARY'],
    notes: '(*) סטודנטים שישרתו 35 ימים ומעלה בסמסטר ישתייכו לקבוצה 3.',
  },

  // Multiple Exam Dates
  {
    id: 'multiple-exam-dates',
    titleHe: 'בחירה בשניים מתוך שלושת מועדי בחינה',
    descriptionHe:
      'זכאות להיבחן בשניים מתוך שלושת מועדי הבחינות (א׳, ב׳, חריג) ובחירת הציון הגבוה מבין השניים.',
    category: 'extra',
    groupsEligible: ['GROUP_3_MILITARY', 'GROUP_2_RESERVES'],
  },
  {
    id: 'choose-higher-grade',
    titleHe: 'בחירת הציון הגבוה מבין שני מועדים',
    descriptionHe:
      'אפשרות לקבל את הציון הגבוה מבין שני מועדי הבחינה או הערכה חלופית/בחינה מותאמת.',
    category: 'extra',
    groupsEligible: ['GROUP_3_MILITARY', 'GROUP_2_RESERVES'],
    notes: 'ההנחיה חלה גם על מקצועות STEM.',
  },

  // Flexibility Rights
  {
    id: 'skip-prerequisites',
    titleHe: 'התקדמות ללא אכיפת דרישות קדם',
    descriptionHe:
      'סטודנטים שלא נבחנו בקורס קדם בגין שירות מילואים יוכלו להתקדם לסמסטר העוקב ללא אכיפת הדרישה.',
    category: 'flexibility',
    groupsEligible: ['GROUP_3_MILITARY', 'GROUP_2_RESERVES'],
    notes: 'רק לסטודנטים שהוקצו לקורס הקדם.',
  },
  {
    id: 'flexibility-schedule',
    titleHe: 'גמישות בשינוי מערכת שעות',
    descriptionHe:
      'אפשרות לשינוי מערכת שעות גם לאחר תום מועד השינויים הרגיל, ללא חיוב.',
    category: 'flexibility',
    groupsEligible: ['GROUP_3_MILITARY', 'GROUP_2_RESERVES'],
  },

  // Support Rights
  {
    id: 'copy-cards',
    titleHe: 'כרטיסי צילום',
    descriptionHe: 'קבלת כרטיסי צילום ללא עלות לשימוש בספרייה.',
    category: 'support',
    groupsEligible: ['GROUP_3_MILITARY', 'GROUP_2_RESERVES', 'GROUP_1'],
  },
  {
    id: 'private-lessons',
    titleHe: 'שיעורים פרטיים ללא עלות',
    descriptionHe:
      'זכאות לשעה של שיעור פרטי ללא עלות על כל יום לימודים שלא נכחו בשל שירות מילואים.',
    category: 'support',
    groupsEligible: ['GROUP_3_MILITARY', 'GROUP_2_RESERVES', 'GROUP_1'],
  },
  {
    id: 'extend-studies-2-semesters',
    titleHe: 'הארכת לימודים ב-2 סמסטרים',
    descriptionHe:
      'סטודנטים עם שירות של 84 ימים מצטבר לפחות במהלך תשפ"ו - הארכה ב-2 סמסטרים ללא תוספת תשלום.',
    category: 'support',
    groupsEligible: ['GROUP_3_MILITARY'],
  },
  {
    id: 'extend-studies-1-semester',
    titleHe: 'הארכת לימודים בסמסטר אחד',
    descriptionHe:
      'סטודנטים עם שירות של 42 ימים מצטבר לפחות במהלך תשפ"ו - הארכה בסמסטר אחד ללא תוספת תשלום.',
    category: 'support',
    groupsEligible: ['GROUP_2_RESERVES'],
  },
  {
    id: 'thesis-extension-military',
    titleHe: 'הארכת מועד הגשת עבודת תזה/דוקטורט',
    descriptionHe:
      'סטודנטים בשנה"ל תשפ"ה המשתייכים לקבוצה 3 יוכלו להגיש עבודת תזה/דוקטורט עד 8 במרץ 2026, ללא עלות.',
    category: 'support',
    groupsEligible: ['GROUP_3_MILITARY', 'GROUP_3_CIVILIAN'],
  },
];

export const getRightById = (id: string): Right | undefined => {
  return ALL_RIGHTS.find((right) => right.id === id);
};

export const getRightsByGroup = (group: string): Right[] => {
  return ALL_RIGHTS.filter((right) =>
    right.groupsEligible.includes(group as GroupClassification),
  );
};
