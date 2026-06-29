'use client';

import type { NotRelevantBenefit } from '@/lib/engine/types';

interface NotRelevantRightsProps {
  items: NotRelevantBenefit[];
}

/** Doctorate routing (note 2): exam-based benefits shown as "לא רלוונטי". */
export default function NotRelevantRights({ items }: NotRelevantRightsProps) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-5">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-700">
          <span aria-hidden>➖</span>
          לא רלוונטי לתואר שלישי
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          בתואר שלישי אין בחינות, ולכן הטבות הבחינה אינן רלוונטיות.
        </p>
      </div>
      <ul className="divide-y divide-slate-100">
        {items.map(({ benefit, noteHe }) => (
          <li key={benefit.id} className="flex flex-col gap-1 p-4">
            <span className="font-medium text-slate-500 line-through decoration-slate-300">
              {benefit.titleHe}
            </span>
            <span className="text-xs text-slate-400">{noteHe}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
