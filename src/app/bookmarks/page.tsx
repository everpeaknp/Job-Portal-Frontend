'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Bookmark,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import TaskCard from '@/components/task/TaskCard';
import { TaskCardSkeleton } from '@/components/task/TaskBrowseSkeletons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  landingBody,
  landingHeadlineSm,
  landingBodyMuted,
} from '@/components/LangingHome/landingTypography';
import { buildBrowseTaskCardProps } from '@/lib/browseTaskCard';
import { haversineKm, taskBudgetAmount, taskCreatedAtMs } from '@/lib/taskFilters';
import { extractTaskList } from '@/lib/taskUtils';
import { KATHMANDU_CENTER, requestUserGeolocation } from '@/lib/userGeolocation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { taskService } from '@/services/task.service';
import type { Task } from '@/types';

const USER_CENTER: [number, number] = [KATHMANDU_CENTER.lat, KATHMANDU_CENTER.lng];
const BOOKMARK_CARD_CLASS = 'h-full min-h-[252px]';

type SortOption = 'newest' | 'closest' | 'budget_high' | 'budget_low' | 'title';

function taskDistanceKm(task: Task, userLat: number, userLng: number): number {
  const lat = Number(task.latitude);
  const lng = Number(task.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return Infinity;
  return haversineKm(userLat, userLng, lat, lng);
}

function sortBookmarks(
  tasks: Task[],
  sortBy: SortOption,
  userCenter: [number, number] | null,
): Task[] {
  const sorted = [...tasks];
  switch (sortBy) {
    case 'budget_high':
      sorted.sort((a, b) => taskBudgetAmount(b) - taskBudgetAmount(a));
      break;
    case 'budget_low':
      sorted.sort((a, b) => taskBudgetAmount(a) - taskBudgetAmount(b));
      break;
    case 'title':
      sorted.sort((a, b) =>
        (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }),
      );
      break;
    case 'closest': {
      const [userLat, userLng] = userCenter ?? [KATHMANDU_CENTER.lat, KATHMANDU_CENTER.lng];
      sorted.sort(
        (a, b) => taskDistanceKm(a, userLat, userLng) - taskDistanceKm(b, userLat, userLng),
      );
      break;
    }
    case 'newest':
    default:
      sorted.sort((a, b) => taskCreatedAtMs(b) - taskCreatedAtMs(a));
      break;
  }
  return sorted;
}

function filterBookmarks(tasks: Task[], query: string): Task[] {
  const q = query.trim().toLowerCase();
  if (!q) return tasks;
  return tasks.filter(
    (t) =>
      (t.title || '').toLowerCase().includes(q) ||
      (t.city || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q),
  );
}

export default function BookmarksPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [userCenter, setUserCenter] = useState<[number, number] | null>(null);

  const cardUserCenter: [number, number] = userCenter ?? USER_CENTER;

  const loadBookmarks = useCallback(async (opts?: { silent?: boolean }) => {
    if (opts?.silent) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await taskService.getBookmarkedTasks();
      if (res.success && res.data) {
        setTasks(extractTaskList(res.data));
      } else {
        setTasks([]);
      }
    } catch {
      setTasks([]);
      toast.error('Could not load bookmarks. Try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) void loadBookmarks();
    if (!authLoading && !isAuthenticated) setLoading(false);
  }, [authLoading, isAuthenticated, loadBookmarks]);

  const displayedTasks = useMemo(
    () => sortBookmarks(filterBookmarks(tasks, searchQuery), sortBy, userCenter),
    [tasks, searchQuery, sortBy, userCenter],
  );

  const handleSortChange = async (value: string) => {
    const next = value as SortOption;
    if (next === 'closest') {
      let center = userCenter;
      if (!center) {
        const coords = await requestUserGeolocation();
        if (!coords) {
          toast.error(
            'Location access is needed for nearest sort. Enable location in your browser.',
          );
          return;
        }
        center = [coords.lat, coords.lng];
        setUserCenter(center);
      }
      setSortBy('closest');
      return;
    }
    setSortBy(next);
  };

  return (
    <div className={cn(landingBody, 'min-h-screen bg-slate-100 antialiased')}>
      <Navbar />

      {isAuthenticated && (
        <section className="sticky top-14 z-[9998] w-full overflow-visible rounded-b-3xl border-b border-gray-200 bg-white sm:top-16">
            <div className="mx-auto max-w-7xl px-3 pb-3 pt-3 sm:px-4 md:px-6 lg:px-8">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
                <h1 className={cn(landingHeadlineSm, 'shrink-0 text-lg text-[#03113c] sm:text-xl')}>
                  My bookmarks
                  {!loading && (
                    <span className={cn(landingHeadlineSm, 'ml-2 text-sm font-bold text-gray-400')}>
                      ({tasks.length})
                    </span>
                  )}
                </h1>
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <div className="relative min-w-0 flex-1 sm:max-w-sm lg:max-w-md">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search saved tasks…"
                      className={cn(
                        landingHeadlineSm,
                        'h-10 w-full rounded-lg border border-transparent bg-slate-100 pl-10 pr-3 text-sm font-semibold outline-none transition placeholder:font-semibold placeholder:text-gray-400 focus:border-[#005fff]/40 focus:bg-slate-50 focus:ring-2 focus:ring-inset focus:ring-[#005fff]/25 focus:ring-offset-0',
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={sortBy} onValueChange={(v) => void handleSortChange(v)}>
                      <SelectTrigger
                        className={cn(
                          landingHeadlineSm,
                          'h-10 w-full min-w-[10.5rem] rounded-lg border border-transparent bg-slate-100 text-sm font-semibold shadow-none focus:border-[#005fff]/40 focus:ring-2 focus:ring-inset focus:ring-[#005fff]/25 focus:ring-offset-0 data-[state=open]:border-[#005fff]/40 data-[state=open]:ring-2 data-[state=open]:ring-inset data-[state=open]:ring-[#005fff]/25 sm:w-[10.5rem]',
                        )}
                      >
                        <SelectValue placeholder="Sort" />
                      </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest saved</SelectItem>
                      <SelectItem value="closest">Nearest</SelectItem>
                      <SelectItem value="budget_high">Highest budget</SelectItem>
                      <SelectItem value="budget_low">Lowest budget</SelectItem>
                      <SelectItem value="title">Title A–Z</SelectItem>
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={() => void loadBookmarks({ silent: true })}
                    disabled={refreshing || loading}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-gray-600 transition hover:bg-slate-200 hover:text-[#005fff] disabled:opacity-50"
                    aria-label="Refresh bookmarks"
                  >
                    <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
                  </button>
                  </div>
                </div>
              </div>
            </div>
        </section>
      )}

      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-4 md:px-6 lg:px-8">
        {!authLoading && !isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm"
          >
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#005fff]/10 text-[#005fff]">
              <Bookmark className="h-7 w-7" />
            </span>
            <h2 className={cn(landingHeadlineSm, 'text-xl text-[#000d45]')}>Sign in to see bookmarks</h2>
            <p className={cn(landingBodyMuted, 'mt-2 text-sm')}>
              Save tasks while browsing, then pick up where you left off.
            </p>
            <Link
              href="/signin?redirect=/bookmarks"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#005fff] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0047ff]"
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}

        {isAuthenticated && loading && (
          <div
            className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-busy
            aria-label="Loading bookmarks"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <TaskCardSkeleton key={i} className={BOOKMARK_CARD_CLASS} />
            ))}
          </div>
        )}

        {isAuthenticated && !loading && tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto flex max-w-lg flex-col items-center rounded-3xl border border-dashed border-gray-300 bg-white px-8 py-16 text-center"
          >
            <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Sparkles className="h-8 w-8 text-[#005fff]" />
            </span>
            <h2 className={cn(landingHeadlineSm, 'text-xl text-[#000d45]')}>Nothing saved yet</h2>
            <p className={cn(landingBodyMuted, 'mt-2 max-w-sm text-sm leading-relaxed')}>
              Open any task and tap the bookmark icon on the details page. Your shortlist will live
              here.
            </p>
            <Link
              href="/task"
              className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#005fff] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0047ff]"
            >
              Explore tasks
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}

        {isAuthenticated && !loading && tasks.length > 0 && displayedTasks.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
            <p className="font-medium text-gray-700">No bookmarks match your search</p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-3 text-sm font-semibold text-[#005fff] hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {isAuthenticated && !loading && displayedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            <p className="text-sm text-gray-500">
              Showing {displayedTasks.length} of {tasks.length} saved{' '}
              {tasks.length === 1 ? 'task' : 'tasks'}
            </p>
            <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayedTasks.map((task, index) => {
                const cardProps = buildBrowseTaskCardProps(task, cardUserCenter);
                const taskSlug = task.slug || String(task.id);

                return (
                  <motion.div
                    key={task.id}
                    className="h-full"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.24) }}
                  >
                    <TaskCard
                      {...cardProps}
                      showOffersOnly
                      className={BOOKMARK_CARD_CLASS}
                      onClick={() => router.push(`/task/${encodeURIComponent(taskSlug)}`)}
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
