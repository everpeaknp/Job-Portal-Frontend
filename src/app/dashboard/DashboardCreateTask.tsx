'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import PostTaskForm from '@/components/post-task/PostTaskForm';
import type { TaskData } from '@/components/post-task/TitleDateStep';
import { rulesService } from '@/services/rules.service';
import { createPostTaskValidator } from '@/lib/postTaskValidation';
import type { EmployerPostingContext } from '@/lib/employerBusinessProfile';
import type { Category } from '@/types';

const EMPTY_TASK_DATA: TaskData = {
  title: '',
  categoryId: '',
  categoryName: '',
  dateType: '',
  specificDate: '',
  beforeDate: '',
  timeOfDayRequired: false,
  timeSlot: null,
  location: '',
  locationType: 'in-person',
  latitude: undefined,
  longitude: undefined,
  details: '',
  budgetType: 'total',
  budgetAmount: 0,
  images: [],
};

type DashboardCreateTaskProps = {
  mode?: 'create' | 'edit';
  initialData?: Partial<TaskData>;
  postingContext?: EmployerPostingContext | null;
  categories?: Category[];
  categoriesLoaded?: boolean;
  isLoading?: boolean;
  onBack: () => void;
  onSubmit: (data: TaskData) => void | Promise<void>;
};

export default function DashboardCreateTask({
  mode = 'create',
  initialData,
  postingContext,
  categories = [],
  categoriesLoaded = false,
  isLoading = false,
  onBack,
  onSubmit,
}: DashboardCreateTaskProps) {
  const isEdit = mode === 'edit';
  const [taskData, setTaskData] = useState<TaskData>(() => ({
    ...EMPTY_TASK_DATA,
    ...initialData,
  }));
  const [showErrors, setShowErrors] = useState(false);
  const [budgetLimits, setBudgetLimits] = useState<{ min: number; max: number } | null>(null);

  useEffect(() => {
    setTaskData((prev) => ({
      ...EMPTY_TASK_DATA,
      ...initialData,
      images: initialData?.images ?? prev.images ?? [],
    }));
  }, [initialData]);

  useEffect(() => {
    let cancelled = false;
    rulesService
      .getPublicLimits()
      .then((res) => {
        if (cancelled) return;
        const min = res.data?.task_budget?.min;
        const max = res.data?.task_budget?.max;
        if (typeof min === 'number' && typeof max === 'number') {
          setBudgetLimits({ min, max });
        }
      })
      .catch(() => {
        if (!cancelled) setBudgetLimits(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const validator = useMemo(() => createPostTaskValidator(budgetLimits), [budgetLimits]);

  const formErrors = useMemo(() => {
    if (!showErrors) return {};
    return validator.validate(taskData).errors;
  }, [showErrors, taskData, validator]);

  const handleSubmit = async () => {
    setShowErrors(true);
    const validation = validator.validate(taskData);
    if (!validation.success) {
      toast.error('Please complete the required fields.');
      return;
    }
    await onSubmit(taskData);
  };

  return (
    <PostTaskForm
      data={taskData}
      updateData={(updates) => setTaskData((prev) => ({ ...prev, ...updates }))}
      categories={categories}
      categoriesLoaded={categoriesLoaded}
      onBack={onBack}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      showErrors={showErrors}
      errors={formErrors}
      postingContext={postingContext}
      minBudget={budgetLimits?.min}
      maxBudget={budgetLimits?.max}
      title={isEdit ? 'Edit Task' : 'Post a Task'}
      description={
        isEdit
          ? 'Update your task details and save changes.'
          : 'Describe what you need done and get quotes from local taskers.'
      }
      backLabel="Back to tasks"
      submitLabel={isEdit ? 'Save Changes' : 'Get quotes'}
      embedded
    />
  );
}
