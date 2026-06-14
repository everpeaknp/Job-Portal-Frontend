import type { TaskData } from '@/components/post-task/TitleDateStep';
import {
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  withNepalGeocodeQuery,
} from '@/lib/nepalLocale';
import { scheduleToDueDateIso } from '@/lib/scheduleUtils';
import { formatTimeSlotRequirement } from '@/lib/timeSlot';

export type PostTaskApiPayload = Record<string, unknown>;

export function buildPostTaskApiPayload(
  taskData: TaskData,
  categoryId?: string,
): PostTaskApiPayload {
  const apiTaskData: PostTaskApiPayload = {
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

  if (categoryId || taskData.categoryId) {
    apiTaskData.category = categoryId || taskData.categoryId;
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

    if (taskData.latitude && taskData.longitude) {
      const toFixed6 = (value: number) => Number(value.toFixed(6));
      apiTaskData.latitude = toFixed6(taskData.latitude);
      apiTaskData.longitude = toFixed6(taskData.longitude);
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

  return apiTaskData;
}

export async function geocodePostTaskLocation(location: string): Promise<{
  latitude?: number;
  longitude?: number;
}> {
  const rawLocation = location.trim();
  if (!rawLocation) return {};

  try {
    const geocodeResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&countrycodes=np&q=${encodeURIComponent(withNepalGeocodeQuery(rawLocation))}&limit=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      },
    );

    if (!geocodeResponse.ok) return {};

    const geocodeData = await geocodeResponse.json();
    if (!geocodeData?.length) return {};

    const toFixed6 = (value: number) => Number(value.toFixed(6));
    return {
      latitude: toFixed6(parseFloat(geocodeData[0].lat)),
      longitude: toFixed6(parseFloat(geocodeData[0].lon)),
    };
  } catch {
    return {};
  }
}

export async function enrichPostTaskPayloadWithGeocode(
  taskData: TaskData,
  payload: PostTaskApiPayload,
): Promise<PostTaskApiPayload> {
  if (taskData.locationType !== 'in-person') return payload;
  if (payload.latitude && payload.longitude) return payload;

  const coords = await geocodePostTaskLocation(taskData.location);
  if (!coords.latitude || !coords.longitude) return payload;

  return {
    ...payload,
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
}
