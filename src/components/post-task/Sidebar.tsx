"use client";
import React from 'react';
import { Check } from 'lucide-react';
import { landingHeadlineSm } from '@/components/LangingHome/landingTypography';

export type StepId = 'title-date' | 'location' | 'details' | 'budget';

export interface Step {
  id: StepId;
  label: string;
}

export const STEPS: Step[] = [
  { id: 'title-date', label: 'Title & date' },
  { id: 'location', label: 'Location' },
  { id: 'details', label: 'Details' },
  { id: 'budget', label: 'Budget' },
];

interface SidebarProps {
  activeStep: StepId;
}

export const MobileStepProgress: React.FC<SidebarProps> = ({ activeStep }) => {
  const currentIndex = STEPS.findIndex((s) => s.id === activeStep);
  const current = STEPS[currentIndex];

  return (
    <div className="shrink-0 bg-white py-3 lg:hidden">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className={`${landingHeadlineSm} text-xs uppercase tracking-wide text-[#6a719a]`}>
          Post a task
        </p>
        <p className="font-body text-xs font-semibold text-[#6a719a]">
          {currentIndex + 1} / {STEPS.length}
        </p>
      </div>
      <div className="flex gap-1.5" aria-hidden>
        {STEPS.map((step, index) => (
          <div
            key={step.id}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              index <= currentIndex
                ? 'bg-gradient-to-r from-[#000d45] to-[#1161fe]'
                : 'bg-[#e8ecf4]'
            }`}
          />
        ))}
      </div>
      {current && (
        <p className={`${landingHeadlineSm} mt-2 truncate text-sm text-primary`}>
          {current.label}
        </p>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeStep }) => {
  const activeIndex = STEPS.findIndex((s) => s.id === activeStep);

  return (
    <aside className="hidden w-44 shrink-0 bg-white lg:block xl:w-48">
      <div className="sticky top-0 py-6 xl:py-8">
        <h2 className={`${landingHeadlineSm} mb-5 text-base text-[#000d45] xl:mb-6 xl:text-lg`}>
          Post a task
        </h2>
        <nav className="flex flex-col gap-1" aria-label="Post task steps">
          {STEPS.map((step, index) => {
            const isActive = step.id === activeStep;
            const isComplete = index < activeIndex;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-2 rounded-xl px-2 py-2 transition-all ${
                  isActive
                    ? 'font-semibold text-primary'
                    : isComplete
                      ? 'font-medium text-[#000d45]'
                      : 'font-medium text-[#8a96b0]'
                }`}
                aria-current={isActive ? 'step' : undefined}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                    isActive
                      ? 'bg-primary text-white'
                      : isComplete
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-[#eef2fa] text-[#8a96b0]'
                  }`}
                >
                  {isComplete ? <Check className="h-3 w-3 stroke-[3]" /> : index + 1}
                </span>
                <span className="font-body text-xs leading-tight xl:text-[13px]">{step.label}</span>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
