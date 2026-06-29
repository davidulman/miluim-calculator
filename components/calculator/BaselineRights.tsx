'use client';

import type { BaselineRight } from '@/lib/engine/types';

interface BaselineRightsProps {
  rights: BaselineRight[];
}

/** Statutory floor (חוק זכויות הסטודנט) — ALWAYS present (FIX 4). */
export default function BaselineRights({ rights }: BaselineRightsProps) {
  if (rights.length === 0) return null;

  return (
    <section className="rounded-xl border border-primary/20 bg-primary/5 p-5">
      <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-primary">
        <span aria-hidden>⚖️</span>
        זכויות בסיס — חוק זכויות הסטודנט
      </h3>
      <p className="mb-4 text-sm text-slate-600">
        זכויות אלו מוקנות לכל משרת/ת מילואים, ללא תלות בכמות הימים או בקבוצה.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {rights.map((r) => (
          <article
            key={r.id}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <h4 className="mb-1 font-semibold text-slate-900">{r.titleHe}</h4>
            <p className="text-sm text-slate-600">{r.descriptionHe}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
