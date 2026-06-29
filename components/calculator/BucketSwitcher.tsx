'use client';

import type { Bucket, Subgroup } from '@/lib/engine/types';

interface BucketSwitcherProps {
  buckets: Bucket[];
  selectedId: Subgroup | null;
  onSelect: (id: Subgroup) => void;
}

/** Pills to compare qualifying buckets (note 3); default = richest bucket. */
export default function BucketSwitcher({
  buckets,
  selectedId,
  onSelect,
}: BucketSwitcherProps) {
  if (buckets.length <= 1) return null;

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-700">
        השוואת קבוצות זכאות:
      </p>
      <div
        role="tablist"
        aria-label="קבוצות זכאות"
        className="flex flex-wrap gap-2"
      >
        {buckets.map((b) => {
          const selected = b.id === selectedId;
          return (
            <button
              key={b.id}
              role="tab"
              aria-selected={selected}
              onClick={() => onSelect(b.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                selected
                  ? 'border-primary bg-primary text-white shadow-sm'
                  : 'border-slate-300 bg-white text-slate-600 hover:border-primary-light'
              }`}
            >
              {b.labelHe}
              <span
                className={`ms-2 rounded-full px-1.5 py-0.5 text-xs ${
                  selected ? 'bg-white/25' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {b.eligible.length}
              </span>
              {b.isDefault && (
                <span className="ms-1.5" title="הקבוצה המיטבית" aria-hidden>
                  ⭐
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
