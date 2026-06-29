'use client';

import { useState } from 'react';
import type { Benefit } from '@/lib/engine/types';

interface LockedRightsProps {
  benefits: Benefit[];
}

/**
 * "מה אין בזכאות" — the locked side. Each item shows the group it becomes
 * available from (benefit.availableFromHe), so the student sees both sides.
 */
export default function LockedRights({ benefits }: LockedRightsProps) {
  const [open, setOpen] = useState(false);
  if (benefits.length === 0) return null;

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 p-5 text-right"
      >
        <span className="flex items-center gap-2 text-lg font-bold text-slate-700">
          <span aria-hidden>🔒</span>
          מה אין בזכאות ({benefits.length})
        </span>
        <span
          className={`text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`}
        >
          ◀
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-200 p-5 animate-fade-in">
          <p className="mb-4 text-sm text-slate-500">
            ההטבות הבאות אינן כלולות בקבוצה זו. לצד כל אחת מצוין מהיכן היא זמינה.
          </p>
          <div className="grid gap-3">
            {benefits.map((b) => (
              <article
                key={b.id}
                className="rounded-lg border border-slate-200 bg-white p-4 opacity-80"
              >
                <h4 className="mb-1 flex items-center gap-2 font-semibold text-slate-600">
                  <span aria-hidden>🔒</span>
                  {b.titleHe}
                </h4>
                <p className="text-sm text-slate-500">{b.descriptionHe}</p>
                <p className="mt-2 inline-block rounded-full bg-primary-light/10 px-3 py-1 text-xs font-medium text-primary">
                  {b.availableFromHe}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
