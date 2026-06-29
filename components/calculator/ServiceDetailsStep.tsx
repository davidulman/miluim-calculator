'use client';

import type { FormState } from './state';
import { needsServiceDays } from './state';
import { normalizeProfile } from '@/lib/engine/normalize';
import { validateProfile } from '@/lib/engine/validate';

interface ServiceDetailsStepProps {
  form: FormState;
  onChange: (patch: Partial<FormState>) => void;
}

type DayField =
  | 'semesterADays'
  | 'semesterBDays'
  | 'preSemesterDays'
  | 'cumulativeSince2024'
  | 'cumulativeSinceOct2023';

function DayInput({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: DayField;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-slate-800 mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step={0.5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pe-12 focus:border-primary-light focus:ring-2 focus:ring-primary-light/30 transition"
        />
        <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-slate-400">
          ימים
        </span>
      </div>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export default function ServiceDetailsStep({
  form,
  onChange,
}: ServiceDetailsStepProps) {
  if (!needsServiceDays(form.studentType)) {
    return (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold text-primary mb-1">פרטי שירות</h2>
        <div className="mt-5 rounded-xl border border-primary-light/40 bg-primary-light/5 p-6 text-center">
          <p className="text-3xl mb-2" aria-hidden>
            ℹ️
          </p>
          <p className="text-slate-700">
            לפי הסטטוס שבחרת, הזכאות אינה תלויה במספר ימי מילואים — אין צורך למלא
            ימי שירות.
          </p>
          <p className="text-sm text-slate-500 mt-2">
            ניתן להמשיך לשלב הבא.
          </p>
        </div>
      </div>
    );
  }

  const isSpouse = form.studentType === 'reserves_spouse';
  const profile = normalizeProfile(form);
  const total = profile.totalMiluimDays;
  const { errors, warnings } = validateProfile(profile);

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-primary mb-1">
        פרטי שירות מילואים — תשפ&quot;ו
      </h2>
      <p className="text-slate-500 mb-6 text-sm">
        {isSpouse
          ? 'הזינו את ימי השירות של בן/בת הזוג. ניתן להזין גם חצאי-ימים (למשל 35.5).'
          : 'הזינו את ימי השירות שלכם. ניתן להזין גם חצאי-ימים (למשל 35.5).'}
      </p>

      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <DayInput
            id="semesterADays"
            label='סמסטר א׳ תשפ"ו'
            hint="נפתח 26.10.2025"
            value={form.semesterADays}
            onChange={(v) => onChange({ semesterADays: v })}
          />
          <DayInput
            id="semesterBDays"
            label='סמסטר ב׳ תשפ"ו'
            hint="הסמסטר הנוכחי"
            value={form.semesterBDays}
            onChange={(v) => onChange({ semesterBDays: v })}
          />
        </div>

        {/* Auto-derived read-only total (note: never an input). */}
        <div className="flex items-center justify-between rounded-xl border-2 border-primary/20 bg-primary/5 px-5 py-4">
          <div>
            <p className="font-semibold text-primary">סך הכל מילואים</p>
            <p className="text-xs text-slate-500">
              מחושב אוטומטית: סמסטר א׳ + סמסטר ב׳
            </p>
          </div>
          <output
            aria-live="polite"
            className="text-2xl font-extrabold text-primary tabular-nums"
          >
            {total}{' '}
            <span className="text-sm font-medium text-slate-500">ימים</span>
          </output>
        </div>

        {/* Validation: errors (block) + warnings (חריגה). */}
        {errors.length > 0 && (
          <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
            <p className="font-semibold text-red-800 mb-1">⛔ שגיאות קלט</p>
            <ul className="list-disc pr-5 space-y-1 text-sm text-red-700">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}
        {warnings.length > 0 && (
          <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
            <p className="font-semibold text-amber-800 mb-1">
              ⚠️ חריגות בנתונים
            </p>
            <ul className="list-disc pr-5 space-y-1 text-sm text-amber-700">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Advanced / optional fields. */}
        <details className="group rounded-xl border border-slate-200 bg-white">
          <summary className="flex cursor-pointer items-center justify-between px-5 py-3 font-medium text-slate-700 select-none">
            <span>נתונים נוספים (אופציונלי) — לקריטריונים מיוחדים</span>
            <span className="text-slate-400 transition-transform group-open:rotate-90">
              ◀
            </span>
          </summary>
          <div className="space-y-5 border-t border-slate-100 px-5 py-5">
            <DayInput
              id="preSemesterDays"
              label="טרום-סמסטר (אוג׳–אוק׳ 2025)"
              hint="קריטריון 2ג — שירות בחלון אוג׳–אוק׳ 2025"
              value={form.preSemesterDays}
              onChange={(v) => onChange({ preSemesterDays: v })}
            />
            <DayInput
              id="cumulativeSince2024"
              label="מצטבר מ-01.01.2024"
              hint="קריטריון 200+ ימים מצטבר"
              value={form.cumulativeSince2024}
              onChange={(v) => onChange({ cumulativeSince2024: v })}
            />
            <DayInput
              id="cumulativeSinceOct2023"
              label="מצטבר מאוקטובר 2023"
              hint="קריטריון 300+ ימים (שירות ייעודי קדמי)"
              value={form.cumulativeSinceOct2023}
              onChange={(v) => onChange({ cumulativeSinceOct2023: v })}
            />
            <label className="flex items-start gap-3 rounded-lg bg-slate-50 p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFrontLine}
                onChange={(e) => onChange({ isFrontLine: e.target.checked })}
                className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)] cursor-pointer"
              />
              <span>
                <span className="block font-semibold text-slate-900">
                  שירות ייעודי קדמי
                </span>
                <span className="block text-sm text-slate-500">
                  יש אישור צה&quot;ל לשירות ייעודי קדמי. רלוונטי רק לקריטריון 300+
                  ימים מאוקטובר 2023. (35+ ימים בסמסטר מזכים בקבוצה 3 גם ללא ייעוד
                  קדמי.)
                </span>
              </span>
            </label>
          </div>
        </details>
      </div>
    </div>
  );
}
