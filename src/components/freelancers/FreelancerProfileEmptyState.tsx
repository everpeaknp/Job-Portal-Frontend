'use client';

import Link from 'next/link';
import { ArrowUpRight, UserCircle2 } from 'lucide-react';

type FreelancerProfileEmptyStateProps = {
  name: string;
  username?: string;
  isOwnProfile?: boolean;
};

export default function FreelancerProfileEmptyState({
  name,
  username,
  isOwnProfile = false,
}: FreelancerProfileEmptyStateProps) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-24 text-center sm:px-6">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#FEF0EA] text-[#E29578]">
        <UserCircle2 className="h-10 w-10" strokeWidth={1.5} />
      </div>
      <h1 className="text-2xl font-normal tracking-tight text-neutral-900">{name}</h1>
      {username ? (
        <p className="mt-1 text-sm text-neutral-500">@{username}</p>
      ) : null}
      <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-neutral-600">
        {isOwnProfile
          ? 'Your public freelancer profile is not set up yet. Add a bio, skills, rate, or photo from your dashboard to appear here.'
          : 'This freelancer has not set up their public profile yet. Check back later or browse other talent.'}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {isOwnProfile ? (
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 rounded-xl bg-[#52C47F] px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Complete your profile
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        ) : null}
        <Link
          href="/freelancers"
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50"
        >
          Browse freelancers
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
