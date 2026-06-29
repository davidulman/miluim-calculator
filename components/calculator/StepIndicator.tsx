'use client';

import type { Step } from './state';

interface StepIndicatorProps {
  currentStep: Step;
}

const STEPS: { number: Step; label: string }[] = [
  { number: 1, label: 'סוג סטודנט' },
  { number: 2, label: 'פרטי שירות' },
  { number: 3, label: 'פרטים אקדמיים' },
  { number: 4, label: 'תוצאות' },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="התקדמות" className="mb-8">
      <ol className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isDone = step.number < currentStep;
          const isActive = step.number === currentStep;
          return (
            <li
              key={step.number}
              className="flex items-center flex-1 last:flex-none"
            >
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <span
                  aria-current={isActive ? 'step' : undefined}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-white ring-4 ring-primary-light/30 scale-110'
                      : isDone
                        ? 'bg-primary-light text-white'
                        : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? '✓' : step.number}
                </span>
                <span
                  className={`text-[11px] sm:text-xs font-medium whitespace-nowrap ${
                    isActive
                      ? 'text-primary'
                      : isDone
                        ? 'text-primary-light'
                        : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 rounded transition-colors duration-300 ${
                    step.number < currentStep
                      ? 'bg-primary-light'
                      : 'bg-slate-200'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
