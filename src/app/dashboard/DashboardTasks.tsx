'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { fetchMyListingTasks, mapTaskToDashboardTask } from '@/lib/dashboardListingApi';
import { taskService } from '@/services/task.service';
import { useAuthStore } from '@/store';
import { getDashboardCreateHref, getDashboardEditHref } from './dashboardTabs';
import TaskTable from './TaskTable';
import type { Project } from './types';
import DeleteConfirmModal from './DeleteConfirmModal';

type TaskStatus = Project['status'];

const STATUS_TABS: TaskStatus[] = ['Active', 'Pending', 'Ongoing', 'Completed', 'Canceled'];

export default function DashboardTasks() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [tasks, setTasks] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<TaskStatus>('Active');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    if (!isAuthenticated) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      const rows = await fetchMyListingTasks('task');
      setTasks(rows.map(mapTaskToDashboardTask));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load tasks';
      toast.error(message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (pathname === '/dashboard/task') {
      void loadTasks();
    }
  }, [pathname, loadTasks, isAuthenticated]);

  const filteredTasks = useMemo(
    () => tasks.filter((task) => task.status === activeSubTab),
    [tasks, activeSubTab],
  );

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedTasks = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return filteredTasks.slice(start, start + itemsPerPage);
  }, [filteredTasks, activePage, itemsPerPage]);

  const pageButtonClass = (page: number) =>
    `flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full text-sm font-normal transition-all ${
      activePage === page
        ? 'bg-[#52C47F] font-semibold text-white shadow-sm'
        : 'bg-transparent text-black hover:text-[#52C47F]'
    }`;

  const openCreatePage = () => {
    router.push(getDashboardCreateHref('task'));
  };

  const openEditPage = (task: Project) => {
    if (!task.taskSlug) {
      toast.error('This task cannot be edited yet');
      return;
    }
    router.push(getDashboardEditHref('task', task.taskSlug));
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const slug = deleteTarget.taskSlug ?? deleteTarget.id;

    try {
      const response = await taskService.deleteTask(slug);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete task');
      }
      setTasks((prev) => prev.filter((task) => task.id !== deleteTarget.id));
      toast.success('Task deleted');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete task';
      toast.error(message);
    } finally {
      setDeleteTarget(null);
    }
  };

  const subTabClass = (tab: TaskStatus) =>
    `relative cursor-pointer pb-4 text-[15px] font-normal tracking-tight transition-all outline-none ${
      activeSubTab === tab
        ? 'font-medium text-black after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:w-full after:bg-black'
        : 'text-neutral-400 hover:text-neutral-900'
    }`;

  return (
    <div className="animate-in fade-in -mx-4 -my-6 min-h-screen select-none bg-[#f0efec] p-4 font-sans text-black duration-300 sm:-mx-6 sm:p-6 md:-mx-8 md:p-8">
      <div className="mx-auto mb-8 flex max-w-7xl flex-col gap-5 pl-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[34px] font-normal leading-none tracking-tight text-neutral-900">
            Manage Tasks
          </h1>
          <p className="mt-2 text-[15px] font-normal tracking-tight text-neutral-500">
            Post local tasks and review quotes from taskers.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreatePage}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#222222] px-6 py-4 text-sm font-medium text-white shadow-md transition-all hover:bg-neutral-800 active:scale-[0.99]"
        >
          <Plus className="h-4 w-4" />
          <span>Post New Task</span>
        </button>
      </div>

      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-neutral-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8">
        <div className="mb-8 flex items-center justify-between border-b border-neutral-100">
          <div className="flex flex-wrap gap-6 sm:gap-8">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveSubTab(tab);
                  setCurrentPage(1);
                }}
                className={subTabClass(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-neutral-400">Loading tasks…</div>
        ) : (
          <TaskTable
            tasks={paginatedTasks}
            activeSubTab={activeSubTab}
            onEdit={openEditPage}
            onDelete={(id) => {
              const target = tasks.find((task) => task.id === id) ?? null;
              setDeleteTarget(target);
            }}
            onAddClick={openCreatePage}
          />
        )}

        {!loading && filteredTasks.length > 0 ? (
          <div className="mt-8 flex select-none flex-col items-center justify-center gap-4 border-t border-neutral-100 pt-10 font-sans">
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={activePage === 1}
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.01)] transition-all hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronLeft className="h-5 w-5 text-black" strokeWidth={1.5} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={pageButtonClass(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={activePage === totalPages}
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.01)] transition-all hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronRight className="h-5 w-5 text-black" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <DeleteConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
        title="Delete task?"
        description="This will permanently remove the task from your dashboard."
      />
    </div>
  );
}
