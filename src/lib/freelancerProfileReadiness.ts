import { parseSkillsFromApi } from '@/lib/dashboardProfileSkills';
import { formatShortLocation } from '@/lib/publicProfile';
import type { UserDirectoryEntry } from '@/services/user.service';
import type { PortfolioItem } from '@/types';
import type { PublicProfileReview, PublicUserProfile } from '@/types/publicProfile';

export type FreelancerProfileReadinessContext = {
  reviewCount?: number;
  portfolioCount?: number;
};

function hasText(value?: string | null): boolean {
  const trimmed = value?.trim();
  return Boolean(trimmed && trimmed !== 'Select');
}

export function isFreelancerPublicProfileConfigured(
  profile: Pick<
    PublicUserProfile,
    | 'bio'
    | 'tagline'
    | 'profile_image'
    | 'hourly_rate'
    | 'tasks_completed'
    | 'total_reviews'
    | 'city'
    | 'state'
    | 'country'
    | 'location_display'
    | 'specialization'
    | 'skills'
  >,
  context: FreelancerProfileReadinessContext = {},
): boolean {
  if (hasText(profile.bio) || hasText(profile.tagline)) return true;
  if (hasText(profile.profile_image)) return true;
  if (Number(profile.hourly_rate ?? 0) > 0) return true;
  if (Number(profile.tasks_completed ?? 0) > 0) return true;

  const reviews = Number(profile.total_reviews ?? 0) || (context.reviewCount ?? 0);
  if (reviews > 0) return true;
  if ((context.portfolioCount ?? 0) > 0) return true;

  if (hasText(formatShortLocation(profile)) && formatShortLocation(profile) !== '—') {
    return true;
  }
  if (hasText(profile.specialization)) return true;

  const parsed = parseSkillsFromApi(profile.skills ?? []);
  if (parsed.skillRows.some((row) => hasText(row.skill))) return true;
  if (parsed.education.length > 0) return true;
  if (parsed.experience.length > 0) return true;
  if (parsed.languages.some((row) => hasText(row.language) && row.language !== 'Select')) {
    return true;
  }
  if (parsed.transport.length > 0) return true;

  return false;
}

export function isDirectoryEntryProfileConfigured(entry: UserDirectoryEntry): boolean {
  return isFreelancerPublicProfileConfigured(
    {
      bio: entry.bio,
      tagline: entry.tagline,
      profile_image: entry.profile_image,
      hourly_rate: entry.hourly_rate,
      tasks_completed: entry.tasks_completed,
      total_reviews: entry.total_reviews,
      city: entry.city,
      state: entry.state,
      country: entry.country,
      location_display: entry.location_display,
      specialization: entry.specialization,
      skills: undefined,
    },
    {},
  ) || (entry.skill_tags?.some((tag) => hasText(tag)) ?? false);
}

export function countConfiguredFromReviews(
  profile: PublicUserProfile,
  reviews: PublicProfileReview[],
  portfolio: PortfolioItem[],
): boolean {
  return isFreelancerPublicProfileConfigured(profile, {
    reviewCount: reviews.length,
    portfolioCount: portfolio.length,
  });
}
