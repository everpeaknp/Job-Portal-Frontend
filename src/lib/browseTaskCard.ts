import { formatTaskLocationShort } from '@/lib/nepalLocale';
import { getStraightDistanceLabel } from '@/hooks/useRoadDistanceLabel';
import { taskBudgetAmount } from '@/lib/taskFilters';
import { formatTaskDisplayTitle } from '@/lib/taskUtils';
import { getMediaUrl } from '@/lib/utils';
import type { Task } from '@/types';

export function toTaskCoord(raw: unknown): number {
  if (raw === null || raw === undefined || raw === '') return NaN;
  if (typeof raw === 'number') return raw;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function hasTaskCoordinates(task: Task): boolean {
  const lat = toTaskCoord(task.latitude);
  const lng = toTaskCoord(task.longitude);
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

function resolvePoster(task: Task) {
  const nested =
    (task.poster && typeof task.poster === 'object' ? task.poster : null) ||
    (task.owner && typeof task.owner === 'object' ? task.owner : null);

  if (nested) {
    const name =
      `${nested.first_name || ''} ${nested.last_name || ''}`.trim() ||
      nested.full_name ||
      'Unknown';
    return {
      name,
      avatar: getMediaUrl(nested.profile_image),
      rating: nested.average_rating || 0,
      verified: Boolean(nested.is_verified_tasker),
    };
  }

  return {
    name: task.owner_name || 'Unknown',
    avatar: getMediaUrl(task.owner_image),
    rating: task.owner_rating || 0,
    verified: Boolean(task.owner_is_verified),
  };
}

function formatTaskStatusLabel(status: string): string {
  switch (status) {
    case 'open':
      return 'Open';
    case 'draft':
      return 'Draft';
    case 'assigned':
      return 'Assigned';
    case 'in_progress':
      return 'In progress';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'disputed':
      return 'Disputed';
    default:
      return status.replace(/_/g, ' ');
  }
}

export function buildBrowseTaskCardProps(
  task: Task,
  userCenter: [number, number]
) {
  const poster = resolvePoster(task);
  const offerCount = task.bid_count ?? task.bids_count ?? 0;
  const coordinates = hasTaskCoordinates(task)
    ? ([toTaskCoord(task.latitude), toTaskCoord(task.longitude)] as [number, number])
    : null;

  return {
    title: formatTaskDisplayTitle(task.title || 'Untitled Task'),
    status: task.status || 'open',
    statusLabel: formatTaskStatusLabel(task.status || 'open'),
    location: formatTaskLocationShort(task),
    coordinates,
    userCenter,
    distanceLabel: getStraightDistanceLabel(userCenter, coordinates),
    price: taskBudgetAmount(task),
    dueDate: task.due_date ?? null,
    timeLabel: task.flexible_date ? 'Anytime' : 'Anytime',
    offerCount,
    user: {
      name: poster.name,
      avatar: poster.avatar,
      rating: poster.rating,
      verified: poster.verified,
    },
  };
}
