'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import ProjectProfileHero from '@/components/projects/ProjectProfileHero';
import ProjectAttachments from '@/components/projects/ProjectAttachments';
import ProjectGallery from '@/components/projects/ProjectGallery';
import ProjectSkillsRequired from '@/components/projects/ProjectSkillsRequired';
import TaskReviewsSection from '@/components/reviews/TaskReviewsSection';
import { TASK_BROWSE_PATH } from '@/lib/taskBrowsePath';
import { mapTaskToTaskPageView, getTaskDetailPath } from '@/lib/taskPageApi';
import { isListingOpenForBids } from '@/lib/taskUtils';
import type { Task } from '@/types';
import TaskAbout from './TaskAbout';
import TaskMakeOffer from './TaskMakeOffer';
import TaskMoreOptions from './TaskMoreOptions';
import TaskOffers from './TaskOffers';
import TaskCancellationPolicy from './TaskCancellationPolicy';
import TaskQuestions from './TaskQuestions';
import TaskShareSaveActions from './TaskShareSaveActions';
import TaskSidebar, { type SidebarPrimaryAction } from './TaskSidebar';
import TaskStatusTimeline from '@/components/common/TaskStatusTimeline';
import type { MyTaskManagementActions } from '@/components/my-task/MyTaskManagementSection';
import MyTaskManagementSection from '@/components/my-task/MyTaskManagementSection';

export const MAKE_OFFER_SECTION_ID = 'make-an-offer';

export type { SidebarPrimaryAction };

interface SingleTaskPageProps {
  task: Task;
  onTaskUpdated?: () => void;
  variant?: 'page' | 'overlay';
  onClose?: () => void;
  onPostSimilar?: () => void;
  onSetUpAlerts?: () => void;
  onRaiseDispute?: () => void;
  onReport?: () => void;
  canRaiseDispute?: boolean;
  /** Custom sidebar primary button; `null` hides it. */
  sidebarPrimaryAction?: SidebarPrimaryAction | null;
  hideMakeOffer?: boolean;
  enableWalletGate?: boolean;
  managementActions?: MyTaskManagementActions;
  backLink?: { href: string; label: string };
  footerHint?: string;
}

function hasMeaningfulSkills(skills: string[]): boolean {
  return skills.some((skill) => skill.trim() && skill.trim().toLowerCase() !== 'general');
}

export default function SingleTaskPage({
  task,
  onTaskUpdated,
  variant = 'page',
  onClose,
  onPostSimilar,
  onSetUpAlerts,
  onRaiseDispute,
  onReport,
  canRaiseDispute = false,
  sidebarPrimaryAction,
  hideMakeOffer = false,
  enableWalletGate = false,
  managementActions,
  backLink,
  footerHint,
}: SingleTaskPageProps) {
  const isOverlay = variant === 'overlay';
  const project = useMemo(() => mapTaskToTaskPageView(task), [task]);
  const [offerRefreshKey, setOfferRefreshKey] = useState(0);
  const makeOfferRef = useRef<HTMLDivElement>(null);
  const initialOfferCount = task.bid_count ?? task.bids_count ?? 0;

  const scrollToMakeOffer = useCallback(() => {
    makeOfferRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      const field = document.getElementById('task-offer-amount');
      if (field instanceof HTMLElement) {
        field.focus({ preventScroll: true });
      }
    }, 450);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || window.location.hash !== `#${MAKE_OFFER_SECTION_ID}`) {
      return;
    }
    window.requestAnimationFrame(() => {
      scrollToMakeOffer();
    });
  }, [scrollToMakeOffer]);

  const handleOfferRefresh = useCallback(() => {
    setOfferRefreshKey((key) => key + 1);
    onTaskUpdated?.();
  }, [onTaskUpdated]);

  const showMoreOptions =
    Boolean(onPostSimilar && onSetUpAlerts && onRaiseDispute && onReport);

  const listingOpen = isListingOpenForBids(task.status, task.is_open);
  const resolvedSidebarPrimaryAction =
    sidebarPrimaryAction !== undefined
      ? sidebarPrimaryAction
      : listingOpen
        ? undefined
        : null;

  return (
    <div className="select-none bg-white pb-12 pt-8 font-normal text-black antialiased [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_p]:font-normal [&_span]:font-normal [&_button]:font-normal [&_label]:font-normal">
      <div className={`mx-auto w-full max-w-7xl ${isOverlay ? 'px-4 py-2 sm:px-6' : 'px-4 sm:px-6 lg:px-8'}`}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <TaskStatusTimeline status={task.status || 'open'} />
          <TaskShareSaveActions task={task} onBookmarkChange={() => onTaskUpdated?.()} />
        </div>

        <ProjectProfileHero project={project} />

        <div className="mt-10 grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <TaskAbout project={project} />

            {hasMeaningfulSkills(project.skills) ? (
              <div className="mt-12">
                <ProjectSkillsRequired project={project} />
              </div>
            ) : null}

            <ProjectAttachments project={project} />
            <ProjectGallery project={project} />

            <div className="mt-12">
              <TaskOffers
                project={project}
                taskStatus={task.status}
                initialOfferCount={initialOfferCount}
                refreshKey={offerRefreshKey}
                onOfferAccepted={handleOfferRefresh}
                enableWalletGate={enableWalletGate}
              />
            </div>

            {!hideMakeOffer ? (
              <div
                id={MAKE_OFFER_SECTION_ID}
                ref={makeOfferRef}
                className="mt-12 scroll-mt-28"
              >
                <TaskMakeOffer project={project} onSubmitted={handleOfferRefresh} />
              </div>
            ) : null}

            <TaskQuestions project={project} />

            {task.status === 'completed' ? (
              <div className="mt-12 border-t border-neutral-200 pt-10">
                <TaskReviewsSection task={task} />
              </div>
            ) : null}

            <TaskCancellationPolicy />

            {managementActions ? (
              <MyTaskManagementSection actions={managementActions} />
            ) : null}

            {showMoreOptions ? (
              <TaskMoreOptions
                canRaiseDispute={canRaiseDispute}
                onPostSimilar={onPostSimilar!}
                onSetUpAlerts={onSetUpAlerts!}
                onRaiseDispute={onRaiseDispute!}
                onReport={onReport!}
              />
            ) : null}
          </div>

          <TaskSidebar
            task={task}
            project={project}
            onMakeOffer={scrollToMakeOffer}
            primaryAction={resolvedSidebarPrimaryAction}
          />
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-normal text-neutral-500">
            {footerHint ??
              (isOverlay
                ? 'Browse more tasks on the task map.'
                : 'Browse more tasks on the full task directory.')}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {isOverlay && onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-normal text-black transition-opacity hover:opacity-80"
              >
                Close
                <ArrowUpRight className="h-4 w-4 rotate-45" />
              </button>
            ) : null}
            {isOverlay ? (
              <Link
                href={getTaskDetailPath(task)}
                className="inline-flex items-center gap-1.5 text-sm font-normal text-[#52C47F] transition-opacity hover:opacity-80"
              >
                Open full page
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            ) : null}
            <Link
              href={backLink?.href ?? TASK_BROWSE_PATH}
              className="inline-flex items-center gap-1.5 text-sm font-normal text-black transition-opacity hover:opacity-80"
            >
              {backLink?.label ?? 'Back to all tasks'}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
