/***
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import PostTaskForm, { type PostTaskFormErrors } from '@/components/post-task/PostTaskForm';
import { TaskData } from '@/components/post-task/TitleDateStep';
import { useTaskStore } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import { taskService } from '@/services/task.service';
import { rulesService } from '@/services/rules.service';
import {
  BUDGET_MAX_NPR,
  BUDGET_MIN_NPR,
  BUDGET_VALIDATION_MESSAGE,
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  withNepalGeocodeQuery,
} from '@/lib/nepalLocale';
import { scheduleToDueDateIso } from '@/lib/scheduleUtils';
import { formatTimeSlotRequirement } from '@/lib/timeSlot';
import { consumeSimilarTaskPrefill } from '@/lib/similarTask';
import { flattenCategoriesForSelect } from '@/lib/taskUtils';
import { getEmployerPostingContext } from '@/lib/employerBusinessProfile';

function buildFormErrors(issues: z.ZodIssue[]): PostTaskFormErrors {
  const map: PostTaskFormErrors = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !map[key as keyof PostTaskFormErrors]) {
      map[key as keyof PostTaskFormErrors] = issue.message;
    }
  }
  return map;
}

export default function PostTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isCustomer, user } = useAuth();
  const { createTask, isLoading, fetchCategories, categories, categoriesLoaded } = useTaskStore();

  const [showErrors, setShowErrors] = useState(false);
  const [taskData, setTaskData] = useState<TaskData>({
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
  });

  const [budgetLimits, setBudgetLimits] = useState<{ min: number; max: number } | null>(null);
  const postingContext = isCustomer ? getEmployerPostingContext(user) : null;

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

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
        } else {
          setBudgetLimits(null);
        }
      })
      .catch(() => {
        if (!cancelled) setBudgetLimits(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const fromSimilar = searchParams.get('from') === 'similar';
    if (fromSimilar) {
      const prefill = consumeSimilarTaskPrefill();
      if (prefill) {
        setTaskData((prev) => ({
          ...prev,
          ...prefill,
          images: [],
        }));
        return;
      }
    }

    const title = searchParams.get('title');
    if (title && title.trim()) {
      setTaskData((prev) => (prev.title ? prev : { ...prev, title: title.trim() }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!categoriesLoaded) return;
    const categoryParam = searchParams.get('category')?.trim();
    if (!categoryParam) return;

    setTaskData((prev) => {
      if (prev.categoryId) return prev;
      const match = flattenCategoriesForSelect(categories).find(
        (category) =>
          category.name.toLowerCase() === categoryParam.toLowerCase() ||
          category.id === categoryParam,
      );
      if (!match) {
        return { ...prev, categoryName: categoryParam };
      }
      return {
        ...prev,
        categoryId: match.id,
        categoryName: match.name,
      };
    });
  }, [categoriesLoaded, categories, searchParams]);

  const updateTaskData = (updates: Partial<TaskData>) => {
    setTaskData((prev) => ({ ...prev, ...updates }));
  };

  const validateTaskData = useCallback(
    (data: TaskData) => {
      const titleDateSchema = z
        .object({
          title: z.string().trim().min(10, 'Must be at least 10 characters'),
          categoryId: z.string().trim().min(1, 'Please select a category'),
          dateType: z.enum(['specific', 'before', 'both', 'flexible'], {
            errorMap: () => ({ message: 'Please select when you need this done' }),
          }),
          specificDate: z.string(),
          beforeDate: z.string(),
          timeOfDayRequired: z.boolean(),
          timeSlot: z.enum(['morning', 'midday', 'afternoon', 'evening']).nullable(),
        })
        .superRefine((value, ctx) => {
          if (value.dateType === 'specific' && !value.specificDate) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['specificDate'],
              message: 'Please choose a date',
            });
          }
          if (value.dateType === 'before' && !value.beforeDate) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['beforeDate'],
              message: 'Please choose a date',
            });
          }
          if (value.dateType === 'both') {
            if (!value.specificDate) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['specificDate'],
                message: 'Please choose an on date',
              });
            }
            if (!value.beforeDate) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['beforeDate'],
                message: 'Please choose a before date',
              });
            }
          }
          if (value.timeOfDayRequired && !value.timeSlot) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['timeSlot'],
              message: 'Please select a time of day',
            });
          }
        });

      const locationSchema = z
        .object({
          locationType: z.enum(['in-person', 'remote']),
          location: z.string(),
        })
        .superRefine((value, ctx) => {
          if (value.locationType === 'in-person' && !value.location.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['location'],
              message: 'Please enter a location',
            });
          }
        });

      const detailsSchema = z.object({
        details: z.string().trim().min(25, 'Must be at least 25 characters'),
      });

      const budgetSchema = z.object({
        budgetAmount: z
          .number({ invalid_type_error: BUDGET_VALIDATION_MESSAGE })
          .min(budgetLimits?.min ?? BUDGET_MIN_NPR, BUDGET_VALIDATION_MESSAGE)
          .max(budgetLimits?.max ?? BUDGET_MAX_NPR, BUDGET_VALIDATION_MESSAGE),
      });

      const results = [
        titleDateSchema.safeParse(data),
        locationSchema.safeParse(data),
        detailsSchema.safeParse(data),
        budgetSchema.safeParse(data),
      ];

      const issues = results.flatMap((result) =>
        result.success ? [] : result.error.issues,
      );
      return {
        success: issues.length === 0,
        errors: buildFormErrors(issues),
      };
    },
    [budgetLimits],
  );

  const formErrors = useMemo(() => {
    if (!showErrors) return {};
    return validateTaskData(taskData).errors;
  }, [showErrors, taskData, validateTaskData]);

  const getPostTaskErrorMessage = (error: unknown, fallback = 'Failed to post task') => {
    const extractString = (candidate: unknown): string | null => {
      if (!candidate) return null;
      if (typeof candidate === 'string') return candidate.trim() || null;
      if (typeof candidate === 'number' || typeof candidate === 'boolean') return String(candidate);
      if (typeof candidate === 'object') {
        const record = candidate as Record<string, unknown>;
        if (typeof record.message === 'string' && record.message.trim()) return record.message.trim();
        if (typeof record.detail === 'string' && record.detail.trim()) return record.detail.trim();
        if (Array.isArray(candidate)) {
          for (const item of candidate) {
            const nested = extractString(item);
            if (nested) return nested;
          }
        }
        for (const key of Object.keys(record)) {
          const nested = extractString(record[key]);
          if (nested) return nested;
        }
      }
      return null;
    };

    if (!error) return fallback;
    if (typeof error === 'string') return error;
    const fromError = extractString(error);
    if (fromError) return fromError;
    return fallback;
  };

  const handleSubmit = async () => {
    setShowErrors(true);
    const validation = validateTaskData(taskData);
    if (!validation.success) {
      toast.error('Please complete the required fields.');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please sign in to post a task');
      router.push('/signin?redirect=/post-task');
      return;
    }

    try {
      const apiTaskData: Record<string, unknown> = {
        title: taskData.title.trim().slice(0, 255),
        description: taskData.details.trim(),
        budget_amount: Number(taskData.budgetAmount).toFixed(2),
        budget_currency: DEFAULT_CURRENCY,
        budget_type: taskData.budgetType === 'total' ? 'fixed' : 'hourly',
        location_type: taskData.locationType === 'in-person' ? 'physical' : 'remote',
        work_type: taskData.locationType === 'in-person' ? 'in_person' : 'remote',
        urgency: 'medium',
        is_public: true,
        allow_bids: true,
        listing_kind: 'task',
        tags: [],
      };

      if (taskData.categoryId) {
        apiTaskData.category = taskData.categoryId;
      }

      if (taskData.locationType === 'in-person') {
        const rawLocation = taskData.location.trim();
        apiTaskData.address = rawLocation;
        const cityCandidate = rawLocation.includes(',')
          ? rawLocation
              .split(',')
              .map((part) => part.trim())
              .filter(Boolean)
              .slice(-1)[0] || rawLocation
          : rawLocation;
        apiTaskData.city = cityCandidate.slice(0, 100);
        apiTaskData.country = DEFAULT_COUNTRY;

        const toFixed6 = (value: number) => Number(value.toFixed(6));

        if (taskData.latitude && taskData.longitude) {
          apiTaskData.latitude = toFixed6(taskData.latitude);
          apiTaskData.longitude = toFixed6(taskData.longitude);
        } else {
          try {
            const geocodeResponse = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&countrycodes=np&q=${encodeURIComponent(withNepalGeocodeQuery(taskData.location))}&limit=1`,
              {
                headers: {
                  'Accept-Language': 'en',
                },
              },
            );

            if (geocodeResponse.ok) {
              const geocodeData = await geocodeResponse.json();
              if (geocodeData?.length > 0) {
                apiTaskData.latitude = toFixed6(parseFloat(geocodeData[0].lat));
                apiTaskData.longitude = toFixed6(parseFloat(geocodeData[0].lon));
              }
            }
          } catch {
            // Continue without coordinates.
          }
        }
      }

      const dueDateIso = scheduleToDueDateIso(
        taskData.dateType,
        taskData.specificDate,
        taskData.beforeDate,
      );
      if (dueDateIso) {
        apiTaskData.due_date = dueDateIso;
      }

      if (taskData.timeOfDayRequired && taskData.timeSlot) {
        apiTaskData.requirements = [formatTimeSlotRequirement(taskData.timeSlot)];
      }

      const createdTask = await createTask(apiTaskData);
      const createdTaskId = String((createdTask as { id?: string })?.id || '');

      if (taskData.images?.length && !createdTaskId) {
        toast.warning(
          'Task posted, but images could not be uploaded. Try editing the task to add them.',
        );
      } else if (createdTaskId && taskData.images.length > 0) {
        const images = taskData.images.slice(0, 10);
        const uploadResults = await Promise.allSettled(
          images.map((file) => taskService.uploadAttachment(createdTaskId, file)),
        );
        const failedCount = uploadResults.filter(
          (uploadResult) =>
            uploadResult.status === 'rejected' ||
            (uploadResult.status === 'fulfilled' && !uploadResult.value.success),
        ).length;
        if (failedCount > 0) {
          toast.warning(
            failedCount === images.length
              ? 'Task posted, but images could not be uploaded. Edit the task to add them again.'
              : `Task posted, but ${failedCount} image(s) failed to upload.`,
          );
        }
      }

      const target =
        (createdTask as { slug?: string; id?: string })?.slug ||
        (createdTask as { slug?: string; id?: string })?.id;
      toast.success('Task posted successfully!');
      if (target) {
        router.push(`/task/${target}`);
      } else {
        router.push('/tasker-dashboard');
      }
    } catch (error: unknown) {
      const fieldToMessage: Record<string, string> = {
        title: 'title',
        category: 'categoryId',
        due_date: 'dateType',
        address: 'location',
        city: 'location',
        location_type: 'location',
        work_type: 'location',
        latitude: 'location',
        longitude: 'location',
        description: 'details',
        budget_amount: 'budgetAmount',
      };

      const fieldErrors = (error as { errors?: Record<string, string[]> })?.errors;
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        const [firstField] = Object.keys(fieldErrors);
        const firstMsg = fieldErrors[firstField]?.[0] || 'Invalid value';
        toast.error(`${firstField.replace(/_/g, ' ')}: ${firstMsg}`);
        if (fieldToMessage[firstField]) {
          setShowErrors(true);
        }
        return;
      }

      const errorMessage = getPostTaskErrorMessage(error, 'Failed to post task');
      const status = (error as { status?: number })?.status;
      const isThrottled = status === 429 || /throttled/i.test(errorMessage);
      if (status === 401) {
        toast.error('Please sign in to post a task');
        router.push('/signin?redirect=/post-task');
      } else if (status === 403) {
        toast.error(
          errorMessage && !/request failed/i.test(errorMessage)
            ? errorMessage
            : 'You do not have permission to post this task.',
        );
      } else if (isThrottled) {
        toast.warning('Task creation is rate limited. Please wait and try again later.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/discover');
    }
  }, [router]);

  return (
    <div className="mobile-bottom-nav-offset min-h-screen bg-[#f0efec] font-sans text-black">
      <Navbar />
      <main>
        <PostTaskForm
          data={taskData}
          updateData={updateTaskData}
          categories={categories}
          categoriesLoaded={categoriesLoaded}
          onBack={handleBack}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          showErrors={showErrors}
          errors={formErrors}
          postingContext={postingContext}
          minBudget={budgetLimits?.min}
          maxBudget={budgetLimits?.max}
        />
      </main>
      <Footer />
    </div>
  );
}
