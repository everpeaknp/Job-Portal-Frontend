'use client';

import type { Job } from './jobListData';

interface JobSkillsRequiredProps {
  job: Job;
}

function getDisplaySkills(job: Job): string[] {
  return job.skills.map((skill) => skill.trim()).filter((skill) => skill && skill !== 'General');
}

export default function JobSkillsRequired({ job }: JobSkillsRequiredProps) {
  const skills = getDisplaySkills(job);
  if (!skills.length) return null;

  return (
    <section className="border-t border-neutral-200 pt-10">
      <h2 className="mb-5 text-xl font-normal tracking-tight text-black sm:text-2xl">
        Skills Required
      </h2>
      <div className="flex flex-wrap gap-3">
        {skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-[#ffede8] px-5 py-2.5 text-sm font-normal tracking-tight text-black"
          >
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}
