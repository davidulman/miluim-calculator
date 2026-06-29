import { CalculatorInput, GroupClassification } from './types';

/**
 * Classify a student into the appropriate group based on their input
 * לפי המתווה הרשמי מל"ג/ור"ה לשנת תשפ"ו (עדכון 26.11.2025)
 */
export function classifyStudent(input: CalculatorInput): GroupClassification {
  // GROUP 3 - CIVILIAN (אזרחים)
  if (
    input.studentType === 'evacuee' ||
    input.studentType === 'october7_victim' ||
    input.studentType === 'bereaved_family'
  ) {
    return 'GROUP_3_CIVILIAN';
  }

  // GROUP 2 - SECURITY (כוחות ביטחון)
  if (
    input.studentType === 'security_forces' ||
    input.studentType === 'security_spouse'
  ) {
    return 'GROUP_2_SECURITY';
  }

  // محسوبات עבור משרתי מילואים ובני/בנות זוג שלהם
  if (
    input.studentType === 'reserves' ||
    input.studentType === 'reserves_spouse'
  ) {
    // GROUP 3 - MILITARY (שירות מילואים קדמי נרחב)
    // תנאי 1: 35 ימים ומעלה בסמסטר בשירות ייעודי קדמי
    if (input.isFrontLine && input.semesterDays >= 35) {
      return 'GROUP_3_MILITARY';
    }

    // תנאי 2: 200 ימים ויותר מ-01.01.2024
    if (input.totalDaysSince2024 >= 200) {
      return 'GROUP_3_MILITARY';
    }

    // תנאי 3: 300 ימים ויותר בשירות ייעודי קדמי מאוקטובר 2023
    if (input.isFrontLine && input.totalDaysSinceOct2023 >= 300) {
      return 'GROUP_3_MILITARY';
    }

    // GROUP 2 - RESERVES (שירות משמעותי)
    // תת-קבוצה 2א: 21 ימים ומעלה בסמסטר
    if (input.semesterDays >= 21) {
      return 'GROUP_2_RESERVES';
    }

    // תת-קבוצה 2ב: 35 ימים ומעלה בכל שנת לימודים תשפ"ו (מופעל בסמסטר ב׳)
    if (input.yearlyDays >= 35) {
      return 'GROUP_2_RESERVES';
    }

    // תת-קבוצה 2ג: 60 ימים ומעלה ב-3 חודשים שקדמו (אוגוסט-אוקטובר 2025)
    if (input.preSemesterDays >= 60) {
      return 'GROUP_2_RESERVES';
    }

    // GROUP 1 (שירות מינימלי)
    // 10-21 ימים בסמסטר
    if (input.semesterDays >= 10 && input.semesterDays < 21) {
      return 'GROUP_1';
    }
  }

  return 'NOT_ELIGIBLE';
}

/**
 * Validate if the input data is complete and makes sense
 */
export function validateInput(input: CalculatorInput): string[] {
  const errors: string[] = [];

  if (!input.studentType) {
    errors.push('סוג סטודנט הוא שדה חובה');
  }

  if (!input.degreeLevel) {
    errors.push('תואר לימודים הוא שדה חובה');
  }

  if (input.semesterDays < 0) {
    errors.push('מספר הימים בסמסטר לא יכול להיות שלילי');
  }

  if (input.yearlyDays < 0) {
    errors.push('מספר הימים בשנה לא יכול להיות שלילי');
  }

  if (input.preSemesterDays < 0) {
    errors.push('מספר הימים לפני הסמסטר לא יכול להיות שלילי');
  }

  return errors;
}

/**
 * Format a number as Hebrew text for presentation
 */
export function formatNumberHe(num: number): string {
  const hebrewNumbers: { [key: string]: string } = {
    '0': '0',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
  };

  return num
    .toString()
    .split('')
    .map((digit) => hebrewNumbers[digit] || digit)
    .join('');
}

/**
 * Get a human-readable explanation of why a student was classified into a group
 */
export function getClassificationReason(
  input: CalculatorInput,
  group: GroupClassification,
): string {
  if (group === 'GROUP_3_CIVILIAN') {
    return 'אתה זכאי כנפגע אזרחי מלחמת חרבות ברזל.';
  }

  if (group === 'GROUP_3_MILITARY') {
    if (input.isFrontLine && input.semesterDays >= 35) {
      return `שירות קדמי של ${input.semesterDays} ימים במהלך הסמסטר.`;
    }
    if (input.totalDaysSince2024 >= 200) {
      return `סה"כ ${input.totalDaysSince2024} ימי שירות לפחות מ-01.01.2024.`;
    }
    if (input.isFrontLine && input.totalDaysSinceOct2023 >= 300) {
      return `שירות קדמי של ${input.totalDaysSinceOct2023} ימים לפחות מאוקטובר 2023.`;
    }
  }

  if (group === 'GROUP_2_RESERVES') {
    if (input.semesterDays >= 21) {
      return `שירות של ${input.semesterDays} ימים במהלך הסמסטר.`;
    }
    if (input.yearlyDays >= 35) {
      return `שירות של ${input.yearlyDays} ימים במהלך שנת הלימודים תשפ"ו.`;
    }
    if (input.preSemesterDays >= 60) {
      return `שירות של ${input.preSemesterDays} ימים ב-3 החודשים שקדמו לסמסטר.`;
    }
  }

  if (group === 'GROUP_2_SECURITY') {
    return 'אתה זכאי כעובד כוחות ביטחון או הצלה.';
  }

  if (group === 'GROUP_1') {
    return `שירות של ${input.semesterDays} ימים במהלך הסמסטר.`;
  }

  return 'עדיין לא ברור המסווג שלך.';
}
