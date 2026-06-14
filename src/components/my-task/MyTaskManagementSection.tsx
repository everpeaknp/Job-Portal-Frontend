'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { Ban, ChevronLeft, Edit, Trash2 } from 'lucide-react';

export type MyTaskManagementActions = {
  canEdit: boolean;
  canDelete: boolean;
  canCancel: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
  deleting?: boolean;
  cancelling?: boolean;
};

interface MyTaskManagementSectionProps {
  actions: MyTaskManagementActions;
}

export default function MyTaskManagementSection({ actions }: MyTaskManagementSectionProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    canEdit,
    canDelete,
    canCancel,
    onEdit,
    onDelete,
    onCancel,
    deleting = false,
    cancelling = false,
  } = actions;

  const hasActions = canEdit || canDelete || canCancel;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!hasActions) return null;

  return (
    <section className="mt-12 border-t border-neutral-200 pt-10">
      <div ref={containerRef} className="space-y-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50/80 px-5 py-4 text-left transition-colors hover:bg-neutral-50"
        >
          <span className="text-sm font-normal text-black">Manage task</span>
          <ChevronLeft
            className={`h-4 w-4 text-neutral-500 transition-transform ${open ? '-rotate-90' : 'rotate-90'}`}
          />
        </button>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-1 rounded-xl border border-neutral-200 bg-white p-2">
                {canEdit ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onEdit();
                    }}
                    disabled={deleting || cancelling}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-normal text-black transition-colors hover:bg-neutral-50 disabled:opacity-50"
                  >
                    <Edit className="h-4 w-4 shrink-0 text-neutral-500" />
                    Edit task
                  </button>
                ) : null}
                {canCancel ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      void onCancel();
                    }}
                    disabled={deleting || cancelling}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-normal text-black transition-colors hover:bg-neutral-50 disabled:opacity-50"
                  >
                    <Ban className="h-4 w-4 shrink-0 text-neutral-500" />
                    {cancelling ? 'Cancelling…' : 'Cancel task'}
                  </button>
                ) : null}
                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      void onDelete();
                    }}
                    disabled={deleting || cancelling}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-normal text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4 shrink-0" />
                    {deleting ? 'Deleting…' : 'Delete task'}
                  </button>
                ) : null}
                <Link
                  href="/cancellation-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-normal text-neutral-500 transition-colors hover:bg-neutral-50"
                >
                  Cancellation policy
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
