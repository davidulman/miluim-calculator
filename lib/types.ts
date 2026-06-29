// Student types
export type StudentType =
  | 'reserves'
  | 'reserves_spouse'
  | 'evacuee'
  | 'october7_victim'
  | 'bereaved_family'
  | 'security_forces'
  | 'security_spouse';

// Group classifications
export type GroupClassification =
  | 'GROUP_3_CIVILIAN'
  | 'GROUP_3_MILITARY'
  | 'GROUP_2_RESERVES'
  | 'GROUP_2_SECURITY'
  | 'GROUP_1'
  | 'NOT_ELIGIBLE';

// Degree level
export type DegreeLevel = 'bachelor' | 'master' | 'doctorate';

// Institution type
export type InstitutionType = 'university' | 'college';

// Service unit
export type ServiceUnit = 'reserves' | 'security';

// Calculator input form
export interface CalculatorInput {
  studentType: StudentType;
  degreeLevel: DegreeLevel;
  institutionType: InstitutionType;
  serviceUnit?: ServiceUnit;

  // Service days
  semesterDays: number; // ימים בסמסטר הנוכחי
  yearlyDays: number; // ימים בשנת הלימודים תשפ"ו
  preSemesterDays: number; // ימים ב-3 חודשים שקדמו
  totalDaysSince2024: number; // ימים מ-01.01.2024
  totalDaysSinceOct2023: number; // ימים מאוקטובר 2023

  // Front-line service indicator
  isFrontLine: boolean;

  // Parent status
  isParentWithChildren: boolean;
}

// Right representation
export interface Right {
  id: string;
  titleHe: string;
  descriptionHe: string;
  category:
    | 'exemption'
    | 'gradeConversion'
    | 'alternativeEvaluation'
    | 'flexibility'
    | 'extra'
    | 'support';
  groupsEligible: GroupClassification[];
  notes?: string;
  icon?: string;
}

// Group information
export interface GroupInfo {
  id: GroupClassification;
  nameHe: string;
  descriptionHe: string;
  color: string;
  rights: string[]; // array of Right IDs
}

// Calculator result
export interface CalculatorResult {
  group: GroupClassification;
  groupInfo: GroupInfo;
  eligibleRights: Right[];
  lockedRights: Right[];
  input: CalculatorInput;
}
