import { format } from 'date-fns';
import type { Review } from '@/types';
import { reviewerDisplayName } from '@/lib/publicProfile';
import type { EmployerReviewDto } from '@/services/employer.service';

export type ProfileReviewRow = {
  id: string;
  reviewerName: string;
  reviewerRole: string;
  rating: number;
  date: string;
  comment: string;
  likes: number;
  dislikes: number;
  userVoted?: 'like' | 'dislike';
  isFlagged?: boolean;
};

function formatReviewDate(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return format(date, 'MMMM d, yyyy');
}

function mapUserVote(userVote?: string | null): 'like' | 'dislike' | undefined {
  if (userVote === 'helpful') return 'like';
  if (userVote === 'not_helpful') return 'dislike';
  return undefined;
}

export function mapApiReviewToProfileRow(
  review: Review,
  defaultRole = 'Client',
): ProfileReviewRow {
  const extended = review as Review & {
    helpful_count?: number;
    not_helpful_count?: number;
    user_vote?: string | null;
    is_reported?: boolean;
  };

  return {
    id: String(review.id),
    reviewerName: reviewerDisplayName(review.reviewer),
    reviewerRole: review.task_title?.trim() || defaultRole,
    rating: Number(review.rating) || 5,
    date: formatReviewDate(review.created_at),
    comment: (review.comment || '').trim(),
    likes: Number(extended.helpful_count ?? 0),
    dislikes: Number(extended.not_helpful_count ?? 0),
    userVoted: mapUserVote(extended.user_vote),
    isFlagged: Boolean(extended.is_reported),
  };
}

export function mapEmployerReviewDtoToProfileRow(review: EmployerReviewDto): ProfileReviewRow {
  const name =
    review.reviewer_name?.trim() ||
    (review.reviewer && typeof review.reviewer === 'object'
      ? review.reviewer.full_name?.trim()
      : '') ||
    'Freelancer';

  const extended = review as EmployerReviewDto & {
    helpful_count?: number;
    not_helpful_count?: number;
    user_vote?: string | null;
    is_reported?: boolean;
    task_title?: string;
  };

  return {
    id: review.id,
    reviewerName: name,
    reviewerRole: extended.task_title?.trim() || 'Freelancer',
    rating: review.rating ?? 0,
    date: formatReviewDate(review.created_at),
    comment: review.comment?.trim() || '',
    likes: Number(extended.helpful_count ?? 0),
    dislikes: Number(extended.not_helpful_count ?? 0),
    userVoted: mapUserVote(extended.user_vote),
    isFlagged: Boolean(extended.is_reported),
  };
}

export function applyHelpfulVoteToRow(
  row: ProfileReviewRow,
  apiReview: Review,
): ProfileReviewRow {
  const mapped = mapApiReviewToProfileRow(apiReview, row.reviewerRole);
  return { ...row, ...mapped };
}

export function parseEmployerUserId(employerId: string): string | null {
  if (employerId.startsWith('emp-user-')) {
    return employerId.slice('emp-user-'.length);
  }
  if (/^[0-9a-f-]{36}$/i.test(employerId)) {
    return employerId;
  }
  return null;
}
