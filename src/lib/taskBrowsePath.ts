/** Public task list browse page. Task detail pages stay at `/task/[slug]`. */
export const TASK_BROWSE_PATH = '/task';

/** Task map browse page (list + map). */
export const TASK_MAP_PATH = '/taskmap';

export function taskBrowsePathWithQuery(category?: string | null): string {
  if (!category?.trim()) return TASK_BROWSE_PATH;
  return `${TASK_BROWSE_PATH}?category=${encodeURIComponent(category.trim())}`;
}

/** @deprecated Prefer taskBrowsePathWithQuery — kept for existing imports. */
export function taskMapPathWithQuery(category?: string | null): string {
  return taskBrowsePathWithQuery(category);
}
