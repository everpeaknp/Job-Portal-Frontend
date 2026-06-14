import { mapTaskToPublicProject } from '@/lib/projectApi';
import { taskBudgetAmount } from '@/lib/taskFilters';
import {
  extractTaskList,
  formatTaskDisplayTitle,
  normalizeTaskForDisplay,
  resolveTaskCategoryName,
} from '@/lib/taskUtils';
import { taskService } from '@/services/task.service';
import type { Category, Task } from '@/types';

export async function fetchPublicTasks(
  params?: Record<string, string | number>,
): Promise<Task[]> {
  const response = await taskService.getTasks({
    listing_kind: 'task',
    page_size: 200,
    ...params,
  });
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to load tasks');
  }
  return extractTaskList(response.data).map(normalizeTaskForDisplay);
}

export function taskCategoryName(task: Task, categories?: Category[]): string {
  return resolveTaskCategoryName(task, categories);
}

function isPlaceholderTag(label: string): boolean {
  return label.trim().toLowerCase() === 'general';
}

/** Tags under task cards on /task — skills first, else category name. */
export function taskBrowseDisplayTags(task: Task, categories?: Category[]): string[] {
  const skills = taskSkills(task).filter((skill) => !isPlaceholderTag(skill));
  if (skills.length) return skills;
  const category = resolveTaskCategoryName(task, categories);
  if (category && !isPlaceholderTag(category)) return [category];
  return [];
}

export function taskSkills(task: Task): string[] {
  const project = mapTaskToPublicProject(task);
  return project.skills.filter((skill) => skill.trim().toLowerCase() !== 'general');
}

export function matchesTaskSearch(task: Task, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const project = mapTaskToPublicProject(task);
  return (
    project.title.toLowerCase().includes(q) ||
    project.companyName.toLowerCase().includes(q) ||
    project.category.toLowerCase().includes(q) ||
    project.description.toLowerCase().includes(q) ||
    project.skills.some((skill) => skill.toLowerCase().includes(q))
  );
}

export function matchesTaskLocationSearch(task: Task, location: string): boolean {
  const loc = location.trim().toLowerCase();
  if (!loc) return true;
  const project = mapTaskToPublicProject(task);
  const workLocation = project.location.toLowerCase();
  const displayLocation = (project.locationLabel || '').toLowerCase();
  return workLocation.includes(loc) || displayLocation.includes(loc);
}

export function formatTaskListDate(task: Task): string {
  if (!task.created_at) return 'Recently posted';
  const date = new Date(task.created_at);
  if (Number.isNaN(date.getTime())) return 'Recently posted';
  const diffMs = Date.now() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTaskOffersLabel(task: Task): string {
  const count = task.bid_count ?? task.bids_count ?? 0;
  if (count === 0) return 'No offers yet';
  if (count === 1) return '1 offer';
  return `${count} offers`;
}

export function formatTaskBudgetLabel(task: Task): string {
  const project = mapTaskToPublicProject(task);
  return project.budgetLabel;
}

export function formatTaskTypeLabel(task: Task): string {
  const project = mapTaskToPublicProject(task);
  return project.type === 'Hourly' ? 'Hourly rate' : 'Fixed price';
}

export function taskListTitle(task: Task): string {
  return formatTaskDisplayTitle(task.title || 'Untitled task');
}
