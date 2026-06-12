'use client';

import { useEffect, useState } from 'react';
import { UserRound } from 'lucide-react';
import type { FreelancerCvPreviewData } from '@/app/dashboard/FreelancerCvPreview';
import FreelancerCvDetailsView from '@/components/proposals/FreelancerCvDetailsView';
import {
  ProposalDetailPanel,
  ProposalFileLink,
  ProposalLoadingState,
  ProposalProse,
  ProposalSection,
} from '@/components/proposals/ProposalDetailUi';
import {
  buildFreelancerCvDataFromBid,
  buildFreelancerCvDataFromUser,
} from '@/lib/buildFreelancerCvData';
import { fetchApplicantProfile } from '@/lib/fetchApplicantProfile';
import { formatNPR } from '@/lib/nepalLocale';
import { getMediaUrl } from '@/lib/utils';
import type { Bid } from '@/types';

type JobProposalApplicantPanelProps = {
  bid: Bid;
};

function attachmentLabel(url: string, index: number): string {
  try {
    const name = new URL(url, 'http://localhost').pathname.split('/').pop();
    if (name) return decodeURIComponent(name);
  } catch {
    // ignore
  }
  return `Attachment ${index + 1}`;
}

export default function JobProposalApplicantPanel({ bid }: JobProposalApplicantPanelProps) {
  const [cvData, setCvData] = useState<FreelancerCvPreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const taskerId = bid.tasker?.id;

    const finish = (data: FreelancerCvPreviewData) => {
      if (!cancelled) {
        setCvData(data);
        setLoading(false);
      }
    };

    if (!taskerId) {
      finish(buildFreelancerCvDataFromBid(bid));
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    void fetchApplicantProfile(bid.tasker)
      .then((profile) => {
        if (profile) {
          finish(buildFreelancerCvDataFromUser(profile, bid.tasker));
          return;
        }
        finish(buildFreelancerCvDataFromBid(bid));
      })
      .catch(() => {
        finish(buildFreelancerCvDataFromBid(bid));
      });

    return () => {
      cancelled = true;
    };
  }, [bid]);

  return (
    <ProposalDetailPanel
      title="Applicant details"
      description="Profile information submitted with this job application."
      icon={UserRound}
    >
      {loading ? (
        <ProposalLoadingState message="Loading applicant profile…" />
      ) : cvData ? (
        <FreelancerCvDetailsView
          data={cvData}
          expectedSalary={
            Number(bid.amount) > 0 ? formatNPR(Number(bid.amount)) : undefined
          }
        />
      ) : null}

      {bid.proposal?.trim() ? (
        <ProposalSection title="Application message" description="Submitted with this proposal">
          <ProposalProse>{bid.proposal.trim()}</ProposalProse>
        </ProposalSection>
      ) : null}

      {bid.cover_letter?.trim() ? (
        <ProposalSection title="Cover letter">
          <ProposalProse>{bid.cover_letter.trim()}</ProposalProse>
        </ProposalSection>
      ) : null}

      {bid.attachments && bid.attachments.length > 0 ? (
        <ProposalSection title="Uploaded CV" description="Documents attached to this application">
          <ul className="space-y-2">
            {bid.attachments.map((url, index) => (
              <li key={url}>
                <ProposalFileLink
                  href={getMediaUrl(url)}
                  label={attachmentLabel(url, index)}
                />
              </li>
            ))}
          </ul>
        </ProposalSection>
      ) : null}
    </ProposalDetailPanel>
  );
}
