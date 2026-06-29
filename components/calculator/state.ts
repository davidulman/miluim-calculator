/**
 * components/calculator/state.ts — UI form state + reducer (תשפ"ו model)
 * ======================================================================
 * Holds the 4-step wizard state. Day fields are kept as STRINGS so the user can
 * type freely (empty / ".5"); `normalizeProfile` (engine) coerces them to exact
 * floats and derives the read-only totalMiluimDays. NO institutionType (note 1).
 */

import type { DegreeLevel, StudentType } from '@/lib/engine/types';

export type Step = 1 | 2 | 3 | 4;

/** All raw form fields. Day counters are strings (allow empty / .5 input). */
export interface FormState {
  studentType: StudentType;
  degreeLevel: DegreeLevel;
  semesterADays: string;
  semesterBDays: string;
  preSemesterDays: string;
  cumulativeSince2024: string;
  cumulativeSinceOct2023: string;
  isFrontLine: boolean;
  isParentWithChildren: boolean;
}

export interface WizardState {
  step: Step;
  form: FormState;
}

export const initialForm: FormState = {
  studentType: 'reserves',
  degreeLevel: 'bachelor',
  semesterADays: '',
  semesterBDays: '',
  preSemesterDays: '',
  cumulativeSince2024: '',
  cumulativeSinceOct2023: '',
  isFrontLine: false,
  isParentWithChildren: false,
};

export const initialState: WizardState = { step: 1, form: initialForm };

export type Action =
  | { type: 'SET'; patch: Partial<FormState> }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'GOTO'; step: Step }
  | { type: 'RESET' };

const clampStep = (n: number): Step =>
  (n < 1 ? 1 : n > 4 ? 4 : n) as Step;

export function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case 'SET':
      return { ...state, form: { ...state.form, ...action.patch } };
    case 'NEXT':
      return { ...state, step: clampStep(state.step + 1) };
    case 'PREV':
      return { ...state, step: clampStep(state.step - 1) };
    case 'GOTO':
      return { ...state, step: action.step };
    case 'RESET':
      return { step: 1, form: initialForm };
    default:
      return state;
  }
}

/** Reservist tracks whose service-day inputs are relevant (note: spouse holds partner's days). */
export function needsServiceDays(t: StudentType): boolean {
  return t === 'reserves' || t === 'reserves_spouse';
}

/** Spouse tracks that surface the "הורה לילד עד גיל 13?" gate (FIX 5). */
export function isSpouseType(t: StudentType): boolean {
  return t === 'reserves_spouse' || t === 'security_spouse';
}
