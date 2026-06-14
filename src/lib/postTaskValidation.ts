import { z } from 'zod';
import type { TaskData } from '@/components/post-task/TitleDateStep';
import {
  BUDGET_MAX_NPR,
  BUDGET_MIN_NPR,
  BUDGET_VALIDATION_MESSAGE,
} from '@/lib/nepalLocale';
import type { PostTaskFormErrors } from '@/components/post-task/PostTaskForm';

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

export function createPostTaskValidator(budgetLimits?: { min: number; max: number } | null) {
  const min = budgetLimits?.min ?? BUDGET_MIN_NPR;
  const max = budgetLimits?.max ?? BUDGET_MAX_NPR;

  const schema = z
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
      locationType: z.enum(['in-person', 'remote']),
      location: z.string(),
      details: z.string().trim().min(25, 'Must be at least 25 characters'),
      budgetAmount: z
        .number({ invalid_type_error: BUDGET_VALIDATION_MESSAGE })
        .min(min, BUDGET_VALIDATION_MESSAGE)
        .max(max, BUDGET_VALIDATION_MESSAGE),
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
      if (value.locationType === 'in-person' && !value.location.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['location'],
          message: 'Please enter a location',
        });
      }
    });

  return {
    validate(data: TaskData) {
      const result = schema.safeParse(data);
      if (result.success) {
        return { success: true as const, errors: {} as PostTaskFormErrors };
      }
      return { success: false as const, errors: buildFormErrors(result.error.issues) };
    },
  };
}
