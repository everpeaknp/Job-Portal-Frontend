'use client';

import { type ReactNode, type Ref } from 'react';
import type { FreelancerCvPreviewData } from '@/app/dashboard/FreelancerCvPreview';
import { CV_PRINT_CSS } from '@/lib/cvPrintStyles';

type FreelancerCvDocumentProps = {
  data: FreelancerCvPreviewData;
  variant?: 'print' | 'embedded';
  className?: string;
  innerRef?: Ref<HTMLDivElement>;
};

function isFilledSkill(row: { skill: string; point: string }): boolean {
  return Boolean(row.skill && row.skill !== 'Select' && row.skill !== 'Other…');
}

function isFilledLanguage(row: { language: string; level: string }): boolean {
  return Boolean(row.language && row.language !== 'Select');
}

function CvSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="cv-section">
      <h4 className="cv-section-title">{title}</h4>
      {children}
    </section>
  );
}

function contactParts(data: FreelancerCvPreviewData): string[] {
  return [data.email, data.phone, data.location].map((part) => part?.trim()).filter(Boolean) as string[];
}

export default function FreelancerCvDocument({
  data,
  variant = 'print',
  className = '',
  innerRef,
}: FreelancerCvDocumentProps) {
  const skills = data.skills.filter(isFilledSkill).map((row) => row.skill);
  const languages = data.languages.filter(isFilledLanguage);
  const displayName = data.fullName.trim() || 'Your name';
  const subtitle =
    data.tagline.trim() ||
    (data.specialization !== 'Select' ? data.specialization.trim() : '');
  const contacts = contactParts(data);
  const sheetClass =
    variant === 'embedded' ? 'cv-a4-sheet cv-a4-sheet--embedded' : 'cv-a4-sheet';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CV_PRINT_CSS }} />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .cv-a4-sheet--embedded {
              width: 100%;
              max-width: 100%;
              min-height: 0;
              margin: 0;
              border: 1px solid #e5e5e5;
              border-radius: 0.75rem;
              overflow: hidden;
            }
          `,
        }}
      />
      <div ref={innerRef} className={`${sheetClass} ${className}`.trim()} data-cv-a4>
        <div className="cv-a4-inner">
          <header className="cv-header">
            {data.avatar ? (
              <img src={data.avatar} alt="" className="cv-photo" referrerPolicy="no-referrer" />
            ) : (
              <div className="cv-photo-placeholder" aria-hidden />
            )}

            <div className="min-w-0 flex-1">
              <h3 className="cv-name">{displayName}</h3>
              {subtitle ? <p className="cv-subtitle">{subtitle}</p> : null}
              {contacts.length > 0 ? (
                <p className="cv-contact">{contacts.join('  ·  ')}</p>
              ) : null}
            </div>
          </header>

          {data.description.trim() ? (
            <CvSection title="Professional summary">
              <p className="cv-summary">{data.description.trim()}</p>
            </CvSection>
          ) : null}

          {data.experience.length > 0 ? (
            <CvSection title="Experience">
              {data.experience.map((entry) => (
                <div key={entry.id ?? `${entry.title}-${entry.company}`} className="cv-entry">
                  <div className="cv-entry-head">
                    <h5 className="cv-entry-title">{entry.title}</h5>
                    <span className="cv-entry-date">{entry.yearRange}</span>
                  </div>
                  <p className="cv-entry-org">{entry.company}</p>
                  {entry.description ? (
                    <p className="cv-entry-desc">{entry.description}</p>
                  ) : null}
                </div>
              ))}
            </CvSection>
          ) : null}

          {data.education.length > 0 ? (
            <CvSection title="Education">
              {data.education.map((entry) => (
                <div key={entry.id ?? `${entry.degree}-${entry.institution}`} className="cv-entry">
                  <div className="cv-entry-head">
                    <h5 className="cv-entry-title">{entry.degree}</h5>
                    <span className="cv-entry-date">{entry.yearRange}</span>
                  </div>
                  <p className="cv-entry-org">{entry.institution}</p>
                  {entry.description ? (
                    <p className="cv-entry-desc">{entry.description}</p>
                  ) : null}
                </div>
              ))}
            </CvSection>
          ) : null}

          {skills.length > 0 ? (
            <CvSection title="Skills">
              <p className="cv-summary">{skills.join(' · ')}</p>
            </CvSection>
          ) : null}

          {languages.length > 0 ? (
            <CvSection title="Languages">
              <div className="cv-lang-grid">
                {languages.map((row, index) => (
                  <div key={`${row.language}-${index}`} className="cv-lang-row">
                    <span>{row.language}</span>
                    {row.level !== 'Select' ? (
                      <span className="cv-lang-level">{row.level}</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </CvSection>
          ) : null}

          {data.awards.length > 0 ? (
            <CvSection title="Awards & certifications">
              {data.awards.map((entry) => (
                <div key={entry.id ?? `${entry.title}-${entry.issuer}`} className="cv-entry">
                  <div className="cv-entry-head">
                    <h5 className="cv-entry-title">{entry.title}</h5>
                    <span className="cv-entry-date">{entry.yearRange}</span>
                  </div>
                  <p className="cv-entry-org">{entry.issuer}</p>
                  {entry.description ? (
                    <p className="cv-entry-desc">{entry.description}</p>
                  ) : null}
                </div>
              ))}
            </CvSection>
          ) : null}
        </div>
      </div>
    </>
  );
}
