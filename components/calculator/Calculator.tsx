'use client';

import { useReducer } from 'react';
import { normalizeProfile } from '@/lib/engine/normalize';
import { validateProfile } from '@/lib/engine/validate';
import { initialState, reducer } from './state';
import StepIndicator from './StepIndicator';
import StudentTypeStep from './StudentTypeStep';
import ServiceDetailsStep from './ServiceDetailsStep';
import AcademicDetailsStep from './AcademicDetailsStep';
import ResultsView from './ResultsView';

const scrollTop = () =>
  typeof window !== 'undefined' &&
  window.scrollTo({ top: 0, behavior: 'smooth' });

export default function RightsCalculator() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { step, form } = state;

  const setField = (patch: Partial<typeof form>) =>
    dispatch({ type: 'SET', patch });
  const next = () => {
    dispatch({ type: 'NEXT' });
    scrollTop();
  };
  const prev = () => {
    dispatch({ type: 'PREV' });
    scrollTop();
  };
  const reset = () => {
    dispatch({ type: 'RESET' });
    scrollTop();
  };
  const edit = () => {
    dispatch({ type: 'GOTO', step: 1 });
    scrollTop();
  };

  // Block advancing past step 2 on hard input errors (negatives / NaN).
  const blockingErrors =
    step === 2 ? validateProfile(normalizeProfile(form)).errors : [];
  const canAdvance = blockingErrors.length === 0;

  if (step === 4) {
    return <ResultsView form={form} onEdit={edit} onReset={reset} />;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-primary sm:text-4xl">
          מחשבון זכויות מילואים
        </h1>
        <p className="mt-2 text-slate-500">
          לסטודנטים במילואים · אוניברסיטת חיפה · שנת תשפ&quot;ו
        </p>
      </div>

      <StepIndicator currentStep={step} />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        {step === 1 && <StudentTypeStep form={form} onChange={setField} />}
        {step === 2 && <ServiceDetailsStep form={form} onChange={setField} />}
        {step === 3 && <AcademicDetailsStep form={form} onChange={setField} />}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          onClick={prev}
          disabled={step === 1}
          className="rounded-lg border border-slate-300 px-6 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          הקודם
        </button>

        {step < 3 ? (
          <button
            onClick={next}
            disabled={!canAdvance}
            className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            הבא
          </button>
        ) : (
          <button
            onClick={next}
            className="rounded-lg bg-emerald-600 px-6 py-2.5 font-medium text-white transition hover:bg-emerald-700"
          >
            חשב את הזכויות שלי
          </button>
        )}
      </div>

      {step === 2 && !canAdvance && (
        <p className="mt-3 text-center text-sm text-red-600">
          יש לתקן את שגיאות הקלט לפני המעבר לשלב הבא.
        </p>
      )}
    </main>
  );
}
