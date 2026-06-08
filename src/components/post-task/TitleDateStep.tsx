"use client";
import React, { useState } from 'react';
import { Sun, Sunrise, Sunset, CloudMoon, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

import type { Category } from '@/types';
import { CategorySelect } from '@/components/post-task/CategorySelect';
import {
  postTaskLabel,
  postTaskInputMd,
  postTaskInputError,
  postTaskErrorText,
  postTaskErrorTextSm,
  postTaskChipActive,
  postTaskChipInactive,
} from '@/components/post-task/postTaskStyles';
import { landingHeadline } from '@/components/LangingHome/landingTypography';

export interface TaskData {
  title: string;
  categoryId: string;
  categoryName: string;
  dateType: 'specific' | 'before' | 'flexible' | '';
  specificDate: string;
  beforeDate: string;
  timeOfDayRequired: boolean;
  timeSlot: 'morning' | 'midday' | 'afternoon' | 'evening' | null;
  location: string;
  locationType: 'in-person' | 'remote';
  latitude?: number;
  longitude?: number;
  details: string;
  budgetType: 'total' | 'hourly';
  budgetAmount: number;
  images: File[];
}

interface TitleDateStepProps {
  data: TaskData;
  updateData: (updates: Partial<TaskData>) => void;
  categories: Category[];
  categoriesLoaded: boolean;
  showErrors?: boolean;
  errors?: Partial<
    Record<
      'title' | 'categoryId' | 'dateType' | 'specificDate' | 'beforeDate' | 'timeSlot',
      string
    >
  >;
}

export const TitleDateStep: React.FC<TitleDateStepProps> = ({
  data,
  updateData,
  categories,
  categoriesLoaded,
  showErrors,
  errors,
}) => {
  const [showCalendar, setShowCalendar] = useState<'specific' | 'before' | null>(null);
  const [isTitleTouched, setIsTitleTouched] = useState(false);
  const titleError = errors?.title && (showErrors || isTitleTouched) ? errors.title : null;
  const categoryError = errors?.categoryId && showErrors ? errors.categoryId : null;
  const dateError = errors?.dateType && showErrors ? errors.dateType : null;
  const timeSlotError = errors?.timeSlot && showErrors ? errors.timeSlot : null;

  const handleDateSelect = (date: Date, type: 'specific' | 'before') => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    if (type === 'specific') {
      updateData({ specificDate: dateString, dateType: 'specific' });
    } else {
      updateData({ beforeDate: dateString, dateType: 'before' });
    }

    setTimeout(() => setShowCalendar(null), 300);
  };

  const handleDateTypeClick = (type: 'specific' | 'before') => {
    setShowCalendar(showCalendar === type ? null : type);
  };

  const hasSpecificDate = data.specificDate !== '';
  const hasBeforeDate = data.beforeDate !== '';

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  const chipClass = (active: boolean) =>
    `flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 font-body text-xs font-semibold transition-all sm:text-[13px] ${
      active ? postTaskChipActive : postTaskChipInactive
    }`;

  return (
    <div className="w-full">
      <h1 className={`${landingHeadline} mb-1 text-xl text-[#000d45] leading-tight sm:text-2xl`}>
        Let's start with the basics
      </h1>
      <p className="mb-4 font-body text-xs text-[#6a719a] sm:mb-5 sm:text-sm">
        Tell us what you need and when you'd like it done.
      </p>

      <div className="space-y-4 sm:space-y-5">
        <div className="w-full max-w-md space-y-4 sm:max-w-lg sm:space-y-5">
          <CategorySelect
            categories={categories}
            categoriesLoaded={categoriesLoaded}
            value={data.categoryId}
            onChange={(categoryId, categoryName) =>
              updateData({ categoryId, categoryName })
            }
            showError={showErrors}
            error={categoryError ?? undefined}
          />

          <div className="w-full">
            <label className={`${postTaskLabel} mb-2 block`}>
              In a few words, what do you need done?
            </label>
            <input
              type="text"
              className={`${postTaskInputMd} w-full ${titleError ? postTaskInputError : ''}`}
              placeholder="e.g. Help move my sofa"
              value={data.title}
              onChange={(e) => updateData({ title: e.target.value })}
              onBlur={() => setIsTitleTouched(true)}
            />
            {titleError && <p className={postTaskErrorText}>{titleError}</p>}
          </div>
        </div>

        <div>
          <label className={`${postTaskLabel} mb-1.5 block`}>When do you need this done?</label>
          <div className="mb-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleDateTypeClick('specific')}
              className={chipClass(hasSpecificDate)}
            >
              <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
              <span>
                {hasSpecificDate ? `On ${formatDate(data.specificDate)}` : 'On date'}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 transition-transform ${showCalendar === 'specific' ? 'rotate-180' : ''}`}
              />
            </button>

            <button
              type="button"
              onClick={() => handleDateTypeClick('before')}
              className={chipClass(hasBeforeDate)}
            >
              <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
              <span>
                {hasBeforeDate ? `Before ${formatDate(data.beforeDate)}` : 'Before date'}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 transition-transform ${showCalendar === 'before' ? 'rotate-180' : ''}`}
              />
            </button>

            <button
              type="button"
              onClick={() => {
                updateData({ dateType: 'flexible' });
                setShowCalendar(null);
              }}
              className={chipClass(data.dateType === 'flexible')}
            >
              I'm flexible
            </button>
          </div>

          {showCalendar && (
            <div className="mt-1.5 w-fit animate-in fade-in slide-in-from-top-2 duration-200">
              <Calendar
                selected={
                  showCalendar === 'specific'
                    ? data.specificDate
                      ? (() => {
                          const [year, month, day] = data.specificDate.split('-').map(Number);
                          return new Date(year, month - 1, day);
                        })()
                      : undefined
                    : data.beforeDate
                      ? (() => {
                          const [year, month, day] = data.beforeDate.split('-').map(Number);
                          return new Date(year, month - 1, day);
                        })()
                      : undefined
                }
                onSelect={(date) => handleDateSelect(date, showCalendar)}
                minDate={new Date()}
                showMonthYearPickers={false}
                className="mx-0 border border-black shadow-none"
              />
            </div>
          )}
          {dateError && <p className={postTaskErrorTextSm}>{dateError}</p>}
        </div>

        {data.dateType !== '' && (
          <div className="space-y-3">
            <label className="group flex cursor-pointer items-center gap-2">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer h-4 w-4 cursor-pointer appearance-none rounded bg-gray-100 transition-all checked:bg-primary"
                  checked={data.timeOfDayRequired}
                  onChange={(e) => updateData({ timeOfDayRequired: e.target.checked })}
                />
                <svg
                  className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className={`${postTaskLabel} font-medium`}>I need a certain time of day</span>
            </label>

            {data.timeOfDayRequired && (
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
                {[
                  { id: 'morning', icon: Sunrise, label: 'Morning', sub: 'Before 10am' },
                  { id: 'midday', icon: Sun, label: 'Midday', sub: '10am – 2pm' },
                  { id: 'afternoon', icon: Sunset, label: 'Afternoon', sub: '2pm – 6pm' },
                  { id: 'evening', icon: CloudMoon, label: 'Evening', sub: 'After 6pm' },
                ].map((slot) => {
                  const Icon = slot.icon;
                  const isActive = data.timeSlot === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => updateData({ timeSlot: slot.id as TaskData['timeSlot'] })}
                      className={`flex flex-col items-center justify-center rounded-xl px-2 py-2 transition-all sm:py-2.5 ${
                        isActive
                          ? 'bg-[#eef4ff] text-primary shadow-sm'
                          : 'bg-gray-50 text-[#6a719a] hover:bg-gray-100'
                      }`}
                    >
                      <Icon
                        className={`mb-1 h-4 w-4 sm:h-5 sm:w-5 ${isActive ? 'text-primary' : 'text-[#8a96b0]'}`}
                      />
                      <span className="font-body text-[11px] font-semibold sm:text-xs">{slot.label}</span>
                      <span className="font-body text-[9px] opacity-70 sm:text-[10px]">{slot.sub}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {timeSlotError && <p className={postTaskErrorTextSm}>{timeSlotError}</p>}
          </div>
        )}
      </div>
    </div>
  );
};
