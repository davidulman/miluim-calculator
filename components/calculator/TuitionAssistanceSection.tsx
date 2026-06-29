'use client';

/**
 * Tuition-assistance for reserve students — an EXTERNAL benefit, independent of
 * the university מתווה buckets. Surfaced as informational copy.
 *
 * Fact-checked (06.2026) against miluim.idf.il / che.org.il:
 *  - The tuition GRANT is administered by המל"ג (in cooperation with צה"ל),
 *    submitted directly to המל"ג (*8438) — NOT by אכ"א.
 *  - ≥50 שמ"פ days in 23.10.2025–30.9.2026; the aid is TIERED by combat/rear.
 *  - קרן הסיוע למשרתי המילואים is a SEPARATE economic/social-aid body.
 * Amounts are תשפ"ה baseline figures — marked as subject to official תשפ"ו update.
 */
export default function TuitionAssistanceSection() {
  return (
    <section>
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
        <span aria-hidden>🎖️</span>
        סיוע בשכר לימוד למשרתי מילואים (שמ&quot;פ)
      </h3>
      <div className="rounded-xl border border-emerald-200 border-r-4 border-r-emerald-500 bg-emerald-50/60 p-5">
        <p className="text-sm text-slate-700">
          בנוסף להטבות האוניברסיטה, <span className="font-semibold">המל&quot;ג</span>{' '}
          (בשיתוף צה&quot;ל) מעניקה מענק לשכר לימוד למשרתי מילואים (שמ&quot;פ — שירות
          מילואים פעיל). הזכאות נבחנת בנפרד מהמתווה של האוניברסיטה.
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
            <dt className="text-xs font-medium text-slate-500">סף כניסה</dt>
            <dd className="mt-0.5 font-semibold text-slate-900">
              לפחות 50 ימי שמ&quot;פ (מדורג)
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-slate-600">
          הסיוע <span className="font-semibold">מדורג</span> לפי היקף השירות וסיווג
          לוחם/עורפי: 50+ ימים במערך לוחם — עד כ-100% משכר הלימוד (כ-11,653 ₪);
          50+ ימים במערך עורפי — כ-30% (כ-3,495 ₪).{' '}
          <span className="text-slate-400">הסכומים הם בסיס תשפ&quot;ה ובכפוף לעדכון רשמי לתשפ&quot;ו.</span>
        </p>
        <p className="mt-3 text-xs text-slate-600">
          <span className="font-semibold">הגשה:</span> ישירות למל&quot;ג — מוקד *8438
          או וואטסאפ 050-4032888, עד סוף יוני 2026 לערך.
        </p>
        <p className="mt-3 text-xs text-slate-500">
          <span className="font-semibold text-slate-600">קרן הסיוע למשרתי המילואים</span>{' '}
          היא גוף נפרד לסיוע כלכלי/חברתי (לרבות שיעורי עזר), ואינה הגורם למענק שכר
          הלימוד. לבירורי שכר לימוד יש לפנות למל&quot;ג ול<span className="font-semibold">מדור
          המלגות של האוניברסיטה</span>.
        </p>
        <p className="mt-2 text-[11px] text-slate-400">
          מידע חיצוני למתווה — לאימות מול המל&quot;ג / אתר המילואים של צה&quot;ל
          (ראו קישורים למטה).
        </p>
      </div>
    </section>
  );
}
