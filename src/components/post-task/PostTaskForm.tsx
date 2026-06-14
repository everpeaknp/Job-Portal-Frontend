'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, ChevronLeft, ClipboardList, MapPin, Paperclip, Trash2 } from 'lucide-react';
import FormAccordionSection from '@/app/dashboard/FormAccordionSection';
import ScheduleFields from '@/components/post-task/ScheduleFields';
import LocationFields from '@/components/post-task/LocationFields';
import EmployerPostingBanner from '@/components/employers/EmployerPostingBanner';
import {
  dashboardErrorClass,
  dashboardFieldClass,
  dashboardLabelClass,
  dashboardSelectChevronStyle,
  dashboardSelectClass,
} from '@/lib/dashboardFormStyles';
import {
  BUDGET_MAX_NPR,
  BUDGET_MIN_NPR,
  CURRENCY_INPUT_PREFIX,
  formatNPR,
} from '@/lib/nepalLocale';
import { flattenCategoriesForSelect } from '@/lib/taskUtils';
import type { Category } from '@/types';
import type { EmployerPostingContext } from '@/lib/employerBusinessProfile';
import type { TaskData } from '@/components/post-task/TitleDateStep';

export type PostTaskFormErrors = Partial<
  Record<
    | 'title'
    | 'categoryId'
    | 'dateType'
    | 'specificDate'
    | 'beforeDate'
    | 'timeSlot'
    | 'location'
    | 'details'
    | 'budgetAmount',
    string
  >
>;

type PostTaskFormProps = {
  data: TaskData;
  updateData: (updates: Partial<TaskData>) => void;
  categories: Category[];
  categoriesLoaded: boolean;
  onBack: () => void;
  onSubmit: () => void | Promise<void>;
  isLoading?: boolean;
  showErrors?: boolean;
  errors?: PostTaskFormErrors;
  postingContext?: EmployerPostingContext | null;
  minBudget?: number;
  maxBudget?: number;
  title?: string;
  description?: string;
  backLabel?: string;
  submitLabel?: string;
  /** When true, breaks out of dashboard shell padding (same as other dashboard create forms). */
  embedded?: boolean;
};

export default function PostTaskForm({
  data,
  updateData,
  categories,
  categoriesLoaded,
  onBack,
  onSubmit,
  isLoading = false,
  showErrors = false,
  errors = {},
  postingContext,
  minBudget,
  maxBudget,
  title = 'Post a Task',
  description = 'Describe what you need done and get quotes from local taskers.',
  backLabel = 'Back',
  submitLabel = 'Get quotes',
  embedded = false,
}: PostTaskFormProps) {
  const min = typeof minBudget === 'number' ? minBudget : BUDGET_MIN_NPR;
  const max = typeof maxBudget === 'number' ? maxBudget : BUDGET_MAX_NPR;
  const categoryOptions = useMemo(
    () => flattenCategoriesForSelect(categories),
    [categories],
  );

  const [openSection, setOpenSection] = useState<string | null>('basic');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imagePreviews, setImagePreviews] = useState<{ name: string; url: string }[]>([]);

  useEffect(() => {
    const previews = (data.images || []).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setImagePreviews(previews);
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [data.images]);

  useEffect(() => {
    if (!showErrors) return;
    if (
      errors.title ||
      errors.categoryId ||
      errors.dateType ||
      errors.specificDate ||
      errors.beforeDate ||
      errors.timeSlot ||
      errors.budgetAmount
    ) {
      setOpenSection('basic');
      return;
    }
    if (errors.location || errors.details) {
      setOpenSection('details');
    }
  }, [showErrors, errors]);

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    void onSubmit();
  };

  const onPickImages = (files: FileList | null) => {
    if (!files) return;
    const picked = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (picked.length === 0) return;

    const next = [...(data.images || [])];
    for (const file of picked) {
      const exists = next.some(
        (existing) =>
          existing.name === file.name &&
          existing.size === file.size &&
          existing.lastModified === file.lastModified,
      );
      if (!exists) next.push(file);
    }
    updateData({ images: next });
  };

  const removeImage = (name: string) => {
    updateData({ images: (data.images || []).filter((file) => file.name !== name) });
  };

  const showFieldError = (key: keyof PostTaskFormErrors) =>
    showErrors && errors[key] ? errors[key] : null;

  return (
    <div
      className={
        embedded
          ? 'animate-in fade-in -mx-4 -my-6 min-h-screen select-none bg-[#f0efec] p-4 font-sans text-black duration-300 sm:-mx-6 sm:p-6 md:-mx-8 md:p-8 lg:-mx-10 lg:-my-10 lg:p-10'
          : 'min-h-screen select-none bg-[#f0efec] px-4 py-6 font-sans text-black sm:px-6 md:px-8 md:py-8'
      }
    >
      <div className="mx-auto mb-8 flex max-w-5xl flex-col gap-5 pl-1 md:flex-row md:items-end md:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-normal text-neutral-500 transition-colors hover:text-black"
          >
            <ChevronLeft className="h-4 w-4" />
            {backLabel}
          </button>
          <h1 className="text-[34px] font-normal leading-none tracking-tight text-neutral-900">
            {title}
          </h1>
          <p className="mt-2 text-[15px] font-normal tracking-tight text-neutral-500">{description}</p>
        </div>

        <button
          type="button"
          onClick={() => void onSubmit()}
          disabled={isLoading}
          className="inline-flex cursor-pointer items-center justify-center gap-2 self-start rounded-none bg-[#222222] px-6 py-4 text-sm font-normal text-white shadow-md transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 md:self-auto"
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Posting...
            </>
          ) : (
            <>
              {submitLabel}
              <ArrowUpRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8">
          {postingContext ? (
            <EmployerPostingBanner context={postingContext} className="mb-6" />
          ) : null}

          <FormAccordionSection
            title="Basic Information"
            icon={ClipboardList}
            description="Title, category, schedule, and budget"
            isOpen={openSection === 'basic'}
            onToggle={() => toggleSection('basic')}
          >
            <div>
              <label className={dashboardLabelClass}>Task title</label>
              <input
                value={data.title}
                onChange={(event) => updateData({ title: event.target.value })}
                placeholder="e.g. Help move my sofa"
                className={dashboardFieldClass}
              />
              {showFieldError('title') ? (
                <p className={dashboardErrorClass}>{showFieldError('title')}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={dashboardLabelClass}>Category</label>
                <select
                  value={data.categoryId}
                  onChange={(event) => {
                    const categoryId = event.target.value;
                    const match = categoryOptions.find((option) => option.id === categoryId);
                    updateData({
                      categoryId,
                      categoryName: match?.name ?? '',
                    });
                  }}
                  className={dashboardSelectClass}
                  style={dashboardSelectChevronStyle}
                  disabled={!categoriesLoaded}
                >
                  <option value="">
                    {categoriesLoaded ? 'Select a category' : 'Loading categories…'}
                  </option>
                  {categoryOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                {showFieldError('categoryId') ? (
                  <p className={dashboardErrorClass}>{showFieldError('categoryId')}</p>
                ) : null}
              </div>

              <div>
                <label className={dashboardLabelClass}>Budget</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                    {CURRENCY_INPUT_PREFIX}
                  </span>
                  <input
                    type="number"
                    min={min}
                    max={max}
                    value={data.budgetAmount || ''}
                    onChange={(event) =>
                      updateData({ budgetAmount: Number(event.target.value) || 0 })
                    }
                    placeholder="0"
                    className={`${dashboardFieldClass} pl-8`}
                  />
                </div>
                <p className="mt-1.5 text-xs font-normal text-neutral-400">
                  Between {formatNPR(min)} and {formatNPR(max)}
                </p>
                {showFieldError('budgetAmount') ? (
                  <p className={dashboardErrorClass}>{showFieldError('budgetAmount')}</p>
                ) : null}
              </div>
            </div>

            <ScheduleFields
              variant="dashboard"
              data={{
                dateType: data.dateType,
                specificDate: data.specificDate,
                beforeDate: data.beforeDate,
                timeOfDayRequired: data.timeOfDayRequired,
                timeSlot: data.timeSlot,
              }}
              onChange={updateData}
              showErrors={showErrors}
              dateError={
                showFieldError('dateType') ||
                showFieldError('specificDate') ||
                showFieldError('beforeDate') ||
                undefined
              }
              timeSlotError={showFieldError('timeSlot') ?? undefined}
            />
          </FormAccordionSection>

          <FormAccordionSection
            title="Task Details"
            icon={MapPin}
            description="Location and description"
            isOpen={openSection === 'details'}
            onToggle={() => toggleSection('details')}
          >
            <LocationFields
              variant="dashboard"
              data={{
                locationType: data.locationType,
                location: data.location,
                latitude: data.latitude,
                longitude: data.longitude,
              }}
              onChange={(updates) => {
                updateData({
                  location: updates.location,
                  latitude: updates.latitude,
                  longitude: updates.longitude,
                  ...(updates.locationType === 'remote' || updates.locationType === 'in-person'
                    ? { locationType: updates.locationType }
                    : {}),
                });
              }}
              showErrors={showErrors}
              locationError={showFieldError('location') ?? undefined}
            />

            <div>
              <label className={dashboardLabelClass}>What are the details?</label>
              <textarea
                value={data.details}
                onChange={(event) => updateData({ details: event.target.value })}
                placeholder="Write a summary of the key details — what's involved, any tools needed, access instructions, etc."
                rows={6}
                className={`${dashboardFieldClass} min-h-[140px] resize-y`}
              />
              {showFieldError('details') ? (
                <p className={dashboardErrorClass}>{showFieldError('details')}</p>
              ) : null}
            </div>
          </FormAccordionSection>

          <FormAccordionSection
            title="Upload Images"
            icon={Paperclip}
            description="Photos to help taskers understand the job (optional)"
            isOpen={openSection === 'attachments'}
            onToggle={() => toggleSection('attachments')}
          >
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                onPickImages(event.target.files);
                event.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex w-full cursor-pointer flex-col items-center justify-center rounded-none border border-dashed border-neutral-200 bg-[#fff5f2] px-6 py-10 text-sm font-normal text-neutral-700 transition-colors hover:bg-[#ffede8]"
            >
              Upload Images
            </button>
            <p className="text-xs font-normal text-neutral-400">JPG, PNG, WEBP, or GIF</p>
            {imagePreviews.length > 0 ? (
              <ul className="space-y-2">
                {imagePreviews.map((preview) => (
                  <li
                    key={preview.url}
                    className="flex items-center justify-between gap-3 rounded-none border border-neutral-100 bg-neutral-50 px-3 py-2 text-sm font-normal text-neutral-700"
                  >
                    <span className="truncate">{preview.name}</span>
                    <button
                      type="button"
                      onClick={() => removeImage(preview.name)}
                      className="shrink-0 rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-800"
                      aria-label={`Remove ${preview.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </FormAccordionSection>
        </div>
      </form>
    </div>
  );
}
