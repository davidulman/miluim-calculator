'use client';

import { useMemo, useState } from 'react';
import type { Subgroup } from '@/lib/engine/types';
import { normalizeProfile, totalMiluim } from '@/lib/engine/normalize';
import { validateProfile } from '@/lib/engine/validate';
import { classifyTopGroup, resolveRights } from '@/lib/engine/resolve';
import { classificationReasonHe } from '@/lib/engine/subgroups';
import type { FormState } from './state';
import { needsServiceDays } from './state';
import StepIndicator from './StepIndicator';
import BucketSwitcher from './BucketSwitcher';
import EligibleRights from './EligibleRights';
import LockedRights from './LockedRights';
import NotRelevantRights from './NotRelevantRights';
import BaselineRights from './BaselineRights';
import TuitionAssistanceSection from './TuitionAssistanceSection';
import LinksSection from './LinksSection';
import Disclaimer from './Disclaimer';

interface ResultsViewProps {
  form: FormState;
  onEdit: () => void;
  onReset: () => void;
}

export default function ResultsView({
  form,
  onEdit,
  onReset,
}: ResultsViewProps) {
  const { result, headline, reason, warnings, total } = useMemo(() => {
    const profile = normalizeProfile(form);
    const result = resolveRights(profile);
    const { warnings } = validateProfile(profile);
    return {
      profile,
      result,
      headline: classifyTopGroup(profile),
      reason: classificationReasonHe(profile, new Set(result.subgroups)),
      warnings,
      total: totalMiluim(profile),
    };
  }, [form]);

  const [selectedId, setSelectedId] = useState<Subgroup | null>(
    result.defaultBucketId,
  );

  // Resolve the active bucket (or fall back to the union view when no bucket).
  const activeBucket =
    result.buckets.find((b) => b.id === selectedId) ??
    result.buckets.find((b) => b.isDefault) ??
    null;

  const view = activeBucket
    ? {
        eligible: activeBucket.eligible,
        locked: activeBucket.locked,
        notRelevant: activeBucket.notRelevant,
      }
    : {
        eligible: result.eligible,
        locked: result.locked,
        notRelevant: result.notRelevant,
      };

  const showService = needsServiceDays(form.studentType);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <StepIndicator currentStep={4} />

      {/* Header badge */}
      <header className="mb-6 rounded-2xl border-t-4 border-primary bg-white p-6 shadow-sm animate-slide-up">
        <p className="text-sm font-medium text-slate-500">סיווג מיטבי</p>
        <h1 className="mt-1 text-3xl font-extrabold text-primary">
          {headline}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{reason}</p>
        {showService && (
          <p className="mt-3 inline-block rounded-full bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
            סך הכל מילואים: {total} ימים
          </p>
        )}
      </header>

      {/* Anomaly warnings (חריגה) carried into results. */}
      {warnings.length > 0 && (
        <div className="mb-6 rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
          <p className="mb-1 font-semibold text-amber-800">⚠️ חריגות בנתונים</p>
          <ul className="list-disc pr-5 space-y-1 text-sm text-amber-700">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Multi-bucket disclaimer alert (note 4). */}
      {result.multiBucket && (
        <div className="mb-6 rounded-xl border-2 border-sky-300 bg-sky-50 p-4 animate-fade-in">
          <p className="font-semibold text-sky-900">
            ℹ️ נמצאת זכאות ביותר מקבוצה אחת
          </p>
          <p className="mt-1 text-sm text-sky-800">
            הפרופיל שלך עומד בקריטריונים של מספר קבוצות. כברירת מחדל מוצגת הקבוצה
            המיטבית (⭐). ניתן לעבור בין הקבוצות כדי להשוות. ההטבות אינן
            בהכרח מצטברות — יש לבחור מסלול בהתאם להנחיות החוג.
          </p>
        </div>
      )}

      {/* Bucket switcher (note 3). */}
      {result.buckets.length > 1 && (
        <div className="mb-6">
          <BucketSwitcher
            buckets={result.buckets}
            selectedId={activeBucket?.id ?? null}
            onSelect={setSelectedId}
          />
        </div>
      )}

      <div className="space-y-8">
        {/* Eligible rights */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
              <span aria-hidden>🎯</span>
              הזכויות שלך
            </h2>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              {view.eligible.length} הטבות
            </span>
          </div>
          <EligibleRights benefits={view.eligible} />
        </section>

        {/* Not relevant (doctorate) */}
        <NotRelevantRights items={view.notRelevant} />

        {/* Locked — what is NOT granted (note 7) */}
        <LockedRights benefits={view.locked} />

        {/* Baseline statutory floor — always present */}
        <BaselineRights rights={result.baseline} />

        {/* IDF tuition assistance (שמ"פ) — external benefit, accurate תשפ"ו window */}
        <TuitionAssistanceSection />

        {/* Links */}
        <LinksSection />

        {/* Legal disclaimer */}
        <Disclaimer />
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={onEdit}
          className="rounded-lg border border-primary px-6 py-2.5 font-medium text-primary transition hover:bg-primary/5"
        >
          חזרה לעריכה
        </button>
        <button
          onClick={onReset}
          className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white transition hover:bg-primary/90"
        >
          התחל מחדש
        </button>
      </div>
    </div>
  );
}
