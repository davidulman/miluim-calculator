'use client';

/**
 * IDF tuition-assistance (סיוע שכר לימוד צה"ל) — an external IDF benefit that is
 * independent of the university eligibility buckets. Surfaced as informational
 * copy so the accurate תשפ"ו window and threshold are visible (lecturer note 7
 * "show eligible rights WITH notes/limits"). Not part of resolveRights logic.
 */
export default function TuitionAssistanceSection() {
  return (
    <section>
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
        <span aria-hidden>🎖️</span>
        סיוע בשכר לימוד מצה&quot;ל (שמ&quot;פ)
      </h3>
      <div className="rounded-xl border border-emerald-200 border-r-4 border-r-emerald-500 bg-emerald-50/60 p-5">
        <p className="text-sm text-slate-700">
          בנוסף להטבות האוניברסיטה, אגף משאבי אנוש בצה&quot;ל מעניק סיוע במימון שכר
          הלימוד למשרתי מילואים (שמ&quot;פ — שירות מילואים פעיל). הזכאות נבחנת מול
          צה&quot;ל בנפרד מהמתווה של האוניברסיטה.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-white p-3 ring-1 ring-emerald-100">
            <dt className="text-xs font-medium text-slate-500">
              תקופת שירות מזכה (תשפ&quot;ו)
            </dt>
            <dd className="mt-0.5 font-semibold text-slate-900 tabular-nums">
              23.10.2025 – 30.9.2026
            </dd>
          </div>
          <div className="rounded-lg bg-white p-3 ring-1 ring-emerald-100">
            <dt className="text-xs font-medium text-slate-500">סף ימי שירות</dt>
            <dd className="mt-0.5 font-semibold text-slate-900">
              לפחות 50 ימי שמ&quot;פ
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-slate-500">
          יש שירות מצטבר של לפחות 50 ימי שמ&quot;פ בתקופה 23.10.2025–30.9.2026 כדי
          להיכלל בקריטריון הסיוע. ההגשה והאישור מתבצעים מול אגף משאבי אנוש בצה&quot;ל
          (ראו קישור למטה).
        </p>
        <p className="mt-2 text-xs font-medium text-slate-600">
          לכל הנוגע לסיוע בשכר הלימוד יש לפנות ל<span className="font-semibold">קרן
          הסיוע של משרתי המילואים</span> ול<span className="font-semibold">מדור
          המלגות של האוניברסיטה</span>.
        </p>
      </div>
    </section>
  );
}
