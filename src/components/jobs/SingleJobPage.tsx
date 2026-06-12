'use client';

import { useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import JobAbout from './JobAbout';
import JobKeyResponsibilities from './JobKeyResponsibilities';
import JobSkillsRequired from './JobSkillsRequired';
import JobProfileHero from './JobProfileHero';
import JobRelatedJobs from './JobRelatedJobs';
import JobSendApplication from './JobSendApplication';
import JobShareSaveActions from './JobShareSaveActions';
import JobWorkExperience from './JobWorkExperience';
import type { Job } from './jobListData';

export const APPLY_JOB_SECTION_ID = 'apply-for-job';

interface SingleJobPageProps {
  job: Job;
  relatedJobs?: Job[];
}

export default function SingleJobPage({ job, relatedJobs }: SingleJobPageProps) {
  const applySectionRef = useRef<HTMLDivElement>(null);

  const scrollToApply = useCallback(() => {
    applySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      const field = document.getElementById('job-offer-amount');
      if (field instanceof HTMLElement) {
        field.focus({ preventScroll: true });
      }
    }, 450);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || window.location.hash !== `#${APPLY_JOB_SECTION_ID}`) {
      return;
    }
    window.requestAnimationFrame(() => {
      scrollToApply();
    });
  }, [scrollToApply]);

  return (
    <div className="select-none bg-white pb-12 pt-8 font-normal text-black antialiased [&_button]:font-normal [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_label]:font-normal [&_p]:font-normal [&_span]:font-normal">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex justify-end">
          <JobShareSaveActions job={job} />
        </div>

        <JobProfileHero job={job} onApply={scrollToApply} />

        <div className="mx-auto w-full max-w-3xl">
          <JobAbout job={job} />
          <div className="mt-12">
            <JobSkillsRequired job={job} />
          </div>
          <JobKeyResponsibilities job={job} />
          <JobWorkExperience job={job} onApply={scrollToApply} />
          <div
            id={APPLY_JOB_SECTION_ID}
            ref={applySectionRef}
            className="mt-12 scroll-mt-28"
          >
            <JobSendApplication job={job} />
          </div>
          <JobRelatedJobs job={job} relatedJobs={relatedJobs} />

          <div className="mt-14 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-sm font-normal text-neutral-500">
              Browse more opportunities on the full jobs directory.
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 text-sm font-normal text-black transition-opacity hover:opacity-80"
            >
              Back to all jobs
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
