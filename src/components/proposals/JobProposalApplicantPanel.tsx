'use client';

import type { Bid } from '@/types';
import ProposalApplicantPanel from './ProposalApplicantPanel';

export default function JobProposalApplicantPanel({ bid }: { bid: Bid }) {
  return <ProposalApplicantPanel bid={bid} variant="job" />;
}
