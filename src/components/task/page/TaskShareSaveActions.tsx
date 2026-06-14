'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getTaskDetailPath } from '@/lib/taskPageApi';
import { taskService } from '@/services/task.service';
import type { Task } from '@/types';

interface TaskShareSaveActionsProps {
  task: Task;
  onBookmarkChange?: (bookmarked: boolean) => void;
}

const circleClass =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 transition-colors group-hover:border-neutral-300';

export default function TaskShareSaveActions({
  task,
  onBookmarkChange,
}: TaskShareSaveActionsProps) {
  const [isSaved, setIsSaved] = useState(Boolean(task.is_bookmarked));
  const [saveLoading, setSaveLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  const slug = task.slug?.trim() || task.id;

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${getTaskDetailPath(task)}`;
  }, [task]);

  const handleShare = async () => {
    if (!shareUrl) return;

    setShareLoading(true);
    const shareTitle = task.title;
    const shareText = `Check out this task: ${shareTitle}`;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success('Share dialog opened');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Task link copied to clipboard');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Task link copied to clipboard');
      } catch {
        toast.error('Could not share this task');
      }
    } finally {
      setShareLoading(false);
    }
  };

  const handleSave = async () => {
    if (!slug) return;

    setSaveLoading(true);
    try {
      const nextSaved = !isSaved;
      const response = nextSaved
        ? await taskService.bookmarkTask(slug)
        : await taskService.unbookmarkTask(slug);

      if (!response.success) {
        toast.error(response.message || 'Could not update bookmark');
        return;
      }

      setIsSaved(nextSaved);
      onBookmarkChange?.(nextSaved);
      toast.success(nextSaved ? 'Task saved' : 'Removed from saved tasks');
    } catch {
      toast.error('Could not update bookmark');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-8">
      <button
        type="button"
        onClick={() => void handleShare()}
        disabled={shareLoading}
        className="group flex cursor-pointer items-center gap-2.5 outline-none transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Share task"
      >
        <span className={circleClass}>
          {shareLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
          )}
        </span>
        <span className="text-sm font-normal text-neutral-900">Share</span>
      </button>

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saveLoading}
        className="group flex cursor-pointer items-center gap-2.5 outline-none transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={isSaved ? 'Remove saved task' : 'Save task'}
        aria-pressed={isSaved}
      >
        <span className={circleClass}>
          {saveLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart
              className={`h-4 w-4 ${isSaved ? 'fill-neutral-900 text-neutral-900' : ''}`}
              strokeWidth={1.5}
            />
          )}
        </span>
        <span className="text-sm font-normal text-neutral-900">Save</span>
      </button>
    </div>
  );
}
