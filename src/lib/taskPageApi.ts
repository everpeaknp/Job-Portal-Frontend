import type { Project } from '@/components/projects/projectListData';
import { mapTaskToPublicProject } from '@/lib/projectApi';
import type { Task } from '@/types';

export function mapTaskToTaskPageView(task: Task): Project {
  return mapTaskToPublicProject(task);
}

export function getTaskDetailPath(task: Pick<Task, 'slug' | 'id'>): string {
  const slug = task.slug?.trim();
  if (slug) return `/task/${encodeURIComponent(slug)}`;
  return `/task/${encodeURIComponent(task.id)}`;
}
