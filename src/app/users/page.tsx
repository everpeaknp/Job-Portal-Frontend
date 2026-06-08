'use client';

import { Suspense } from 'react';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import UserDirectory from '@/components/users/UserDirectory';
import { UserDirectoryGridSkeleton } from '@/components/users/UserDirectorySkeletons';

function UsersDirectoryFallback() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <section className="w-full rounded-b-3xl border-b border-gray-200 bg-white">
        <div className="w-full px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
          <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="lg:col-span-3 animate-pulse">
                <div className="mb-1.5 h-3 w-16 rounded bg-gray-200" />
                <div className="h-10 w-full rounded-lg bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <main className="w-full px-4 py-6 sm:px-6 lg:px-10">
        <UserDirectoryGridSkeleton count={8} />
      </main>
      <Footer />
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<UsersDirectoryFallback />}>
      <UserDirectory />
    </Suspense>
  );
}
