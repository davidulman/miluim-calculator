'use client';

import type { DegreeLevel } from '@/lib/engine/types';
import type { FormState } from './state';

interface AcademicDetailsStepProps {
  form: FormState;
  onChange: (patch: Partial<FormState>) => void;
}

const DEGREES: {
  value: DegreeLevel;
  label: string;
  icon: string;
  hint: string;
}[] = [
  {
    value: 'bachelor',
    label: 'תואר ראשון',
    icon: '🎓',
    hint: 'הזכויות מחושבות בנקודות זכות (נ"ז). זהו המיקוד של המחשבון.',
  },
  {
    value: 'master',
    label: 'תואר שני',
    icon: '📘',
    hint: 'המענה בתואר שני נמדד בשש"ס (לא נ"ז), ותקרות ההמרה נמוכות יותר.',
  },
  {
    value: 'doctorate',
    label: 'תואר שלישי (דוקטורט)',
    icon: '🔬',
    hint: 'בתואר שלישי אין בחינות — הטבות הבחינה (25% זמן, 2 מתוך 3 מועדים, בחירת ציון גבוה, הערכה חלופית) יסומנו כ"לא רלוונטי".',
  },
];

export default function AcademicDetailsStep({
  form,
  onChange,
}: AcademicDetailsStepProps) {
  const current = DEGREES.find((d) => d.value === form.degreeLevel);

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-primary mb-1">פרטים אקדמיים</h2>
      <p className="text-slate-500 mb-6 text-sm">
        הלימודים באוניברסיטת חיפה. בחר/י את רמת התואר כדי לקבל מענה מותאם.
      </p>

      <fieldset>
        <legend className="block text-sm font-semibold text-slate-800 mb-3">
          רמת התואר
        </legend>
        <div className="space-y-2.5">
          {DEGREES.map((degree) => {
            const selected = form.degreeLevel === degree.value;
            return (
              <label
                key={degree.value}
                className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selected
                    ? 'border-primary bg-primary-light/10 shadow-sm'
                    : 'border-slate-200 hover:border-primary-light/60 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="degreeLevel"
                  value={degree.value}
                  checked={selected}
                  onChange={(e) =>
                    onChange({ degreeLevel: e.target.value as DegreeLevel })
                  }
                  className="h-5 w-5 shrink-0 accent-[var(--primary)] cursor-pointer"
                />
                <span className="text-xl" aria-hidden>
                  {degree.icon}
                </span>
                <span className="font-semibold text-slate-900">
                  {degree.label}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {current && (
        <div className="mt-5 rounded-xl border border-primary-light/40 bg-primary-light/5 p-4 animate-slide-up">
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-primary">המענה לתואר זה: </span>
            {current.hint}
          </p>
        </div>
      )}

      {/* Out-of-scope note (lecturer note 9) — placeholder only, no auth built. */}
      <p className="mt-6 text-center text-xs text-slate-400">
        בעתיד תתאפשר כניסה עם דוא&quot;ל אוניברסיטאי לשמירת הנתונים (אינו פעיל בשלב
        זה).
      </p>
    </div>
  );
}
