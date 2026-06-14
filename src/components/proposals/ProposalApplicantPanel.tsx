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

type ProposalApplicantPanelVariant = 'job' | 'offer';

type ProposalApplicantPanelProps = {
  bid: Bid;
  variant?: ProposalApplicantPanelVariant;
};

const PANEL_COPY: Record<
  ProposalApplicantPanelVariant,
  {
    title: string;
    description: string;
    amountLabel: string;
    messageTitle: string;
    messageDescription: string;
    attachmentsTitle: string;
    attachmentsDescription: string;
    loadingMessage: string;
  }
> = {
  job: {
    title: 'Applicant details',
    description: 'Profile information submitted with this job application.',
    amountLabel: 'Expected salary',
    messageTitle: 'Application message',
    messageDescription: 'Submitted with this proposal',
    attachmentsTitle: 'Uploaded CV',
    attachmentsDescription: 'Documents attached to this application',
    loadingMessage: 'Loading applicant profile…',
  },
  offer: {
    title: 'Freelancer profile',
    description: 'Profile information and offer from this tasker.',
    amountLabel: 'Offer amount',
    messageTitle: 'Proposal',
    messageDescription: 'Submitted with this offer',
    attachmentsTitle: 'Attachments',
    attachmentsDescription: 'Documents attached to this offer',
    loadingMessage: 'Loading freelancer profile…',
  },
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

export default function ProposalApplicantPanel({
  bid,
  variant = 'job',
}: ProposalApplicantPanelProps) {
  const copy = PANEL_COPY[variant];
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
      title={copy.title}
      description={copy.description}
      icon={UserRound}
    >
      {loading ? (
        <ProposalLoadingState message={copy.loadingMessage} />
      ) : cvData ? (
        <FreelancerCvDetailsView
          data={cvData}
          expectedSalary={
            Number(bid.amount) > 0 ? formatNPR(Number(bid.amount)) : undefined
          }
          offerAmountLabel={copy.amountLabel}
        />
      ) : null}

      {bid.proposal?.trim() ? (
        <ProposalSection title={copy.messageTitle} description={copy.messageDescription}>
          <ProposalProse>{bid.proposal.trim()}</ProposalProse>
        </ProposalSection>
      ) : null}

      {bid.cover_letter?.trim() ? (
        <ProposalSection title="Cover letter">
          <ProposalProse>{bid.cover_letter.trim()}</ProposalProse>
        </ProposalSection>
      ) : null}

      {bid.attachments && bid.attachments.length > 0 ? (
        <ProposalSection title={copy.attachmentsTitle} description={copy.attachmentsDescription}>
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
