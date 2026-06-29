'use client';

import type { StudentType } from '@/lib/engine/types';
import type { FormState } from './state';
import { isSpouseType } from './state';

interface StudentTypeStepProps {
  form: FormState;
  onChange: (patch: Partial<FormState>) => void;
}

const STUDENT_TYPES: {
  value: StudentType;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: 'reserves',
    label: 'משרת/ת מילואים',
    description: 'סטודנט/ית ששירת/ה בעצמו/ה במילואים',
    icon: '🎖️',
  },
  {
    value: 'reserves_spouse',
    label: 'בן/בת זוג של משרת/ת מילואים',
    description: 'בן/בת הזוג שירת/ה במילואים',
    icon: '👨‍👩‍👧',
  },
  {
    value: 'evacuee',
    label: 'מפונה/ת',
    description: 'תושב/ת אזור עימות שפונה/תה מביתו/ה',
    icon: '🏠',
  },
  {
    value: 'october7_victim',
    label: 'נפגע/ת השבעה באוקטובר',
    description: 'נפגע/ת מהתקפת 7.10 או פצוע/ת פעולות איבה',
    icon: '🕊️',
  },
  {
    value: 'bereaved_family',
    label: 'משפחה שכולה / קרבה ראשונה',
    description: 'קרבה ראשונה למשפחות שכולות, חטופים או חללים',
    icon: '🤍',
  },
  {
    value: 'security_forces',
    label: 'איש/ת כוחות ביטחון, הצלה ורפואה',
    description: 'צה"ל, משטרה, כב"א, מד"א וכוחות הצלה',
    icon: '🚓',
  },
  {
    value: 'security_spouse',
    label: 'בן/בת זוג של כוחות ביטחון',
    description: 'בן/בת הזוג משרת/ת בכוחות הביטחון',
    icon: '🤝',
  },
];

export default function StudentTypeStep({
  form,
  onChange,
}: StudentTypeStepProps) {
  const showParentGate = isSpouseType(form.studentType);

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-primary mb-1">מה הסטטוס שלך?</h2>
      <p className="text-slate-500 mb-6 text-sm">
        בחר/י את התיאור שמתאים לך ביותר. ניתן להשתייך ליותר מקבוצה אחת — נחשב את
        כולן.
      </p>

      <div className="space-y-3" role="radiogroup" aria-label="סוג סטודנט">
        {STUDENT_TYPES.map((type) => {
          const selected = form.studentType === type.value;
          return (
            <label
              key={type.value}
              className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                selected
                  ? 'border-primary bg-primary-light/10 shadow-sm'
                  : 'border-slate-200 hover:border-primary-light/60 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="studentType"
                value={type.value}
                checked={selected}
                onChange={(e) =>
                  onChange({ studentType: e.target.value as StudentType })
                }
                className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)] cursor-pointer"
              />
              <span className="text-2xl leading-none mt-0.5" aria-hidden>
                {type.icon}
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-slate-900">
                  {type.label}
                </span>
                <span className="block text-sm text-slate-500">
                  {type.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {/* Spouse parent gate (FIX 5) — revealed inline for spouse types. */}
      {showParentGate && (
        <div className="mt-5 rounded-xl border-2 border-primary-light/40 bg-primary-light/5 p-4 animate-slide-up">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isParentWithChildren}
              onChange={(e) =>
                onChange({ isParentWithChildren: e.target.checked })
              }
              className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)] cursor-pointer"
            />
            <span>
              <span className="block font-semibold text-primary">
                הורה לילד/ה עד גיל 13?
              </span>
              <span className="block text-sm text-slate-600">
                זכאות של בן/בת זוג מותנית בהיותו/ה הורה לילד/ה עד גיל 13. ללא
                סימון זה, זכויות בן/בת הזוג לא יחושבו.
              </span>
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
