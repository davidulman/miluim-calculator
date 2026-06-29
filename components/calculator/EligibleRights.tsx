'use client';

import type { Benefit, BenefitCategory } from '@/lib/engine/types';
import { CATEGORY_ICON, CATEGORY_LABEL } from './benefitMeta';

interface EligibleRightsProps {
  benefits: Benefit[];
}

const CATEGORY_ORDER: BenefitCategory[] = [
  'exemption',
  'gradeConversion',
  'alternativeEvaluation',
  'extra',
  'flexibility',
  'support',
];

export default function EligibleRights({ benefits }: EligibleRightsProps) {
  if (benefits.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
        בקבוצה זו לא נמצאו הטבות ייעודיות מעבר לזכויות הבסיס שלהלן.
      </div>
    );
  }

  const grouped = new Map<BenefitCategory, Benefit[]>();
  for (const b of benefits) {
    const arr = grouped.get(b.category) ?? [];
    arr.push(b);
    grouped.set(b.category, arr);
  }
  const categories = CATEGORY_ORDER.filter((c) => grouped.has(c));

  return (
    <div className="space-y-7">
      {categories.map((category) => (
        <section key={category}>
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-800">
            <span aria-hidden>{CATEGORY_ICON[category]}</span>
            {CATEGORY_LABEL[category]}
          </h3>
          <div className="grid gap-3">
            {grouped.get(category)!.map((b) => (
              <article
                key={b.id}
                className="rounded-xl border border-slate-200 border-r-4 border-r-emerald-500 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <h4 className="mb-1.5 font-semibold text-slate-900">
                  {b.titleHe}
                </h4>
                <p className="text-sm text-slate-600">{b.descriptionHe}</p>
                {b.notes && (
                  <p className="mt-3 rounded-md bg-sky-50 border border-sky-100 p-3 text-xs text-sky-800">
                    <span className="font-semibold">הערה: </span>
                    {b.notes}
                  </p>
                )}
                {b.limitsHe && (
                  <p className="mt-2 rounded-md bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800">
                    <span className="font-semibold">הגבלות: </span>
                    {b.limitsHe}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
