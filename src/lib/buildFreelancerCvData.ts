import type { FreelancerCvPreviewData } from '@/app/dashboard/FreelancerCvPreview';
import { getVerifiedLicenceBadges } from '@/components/users/PublicLicenceBadges';
import { parseSkillsFromApi } from '@/lib/dashboardProfileSkills';
import type { ApplicantProfileSource } from '@/lib/fetchApplicantProfile';
import { getMediaUrl } from '@/lib/utils';
import type { Bid } from '@/types';

type ProfileSource = ApplicantProfileSource;

function displayNameFromUser(user: ProfileSource, fallback = 'Applicant'): string {
  const full = user.full_name?.trim()
    || [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return full || fallback;
}

export function buildFreelancerCvDataFromUser(
  profile: ProfileSource,
  tasker?: Bid['tasker'],
): FreelancerCvPreviewData {
  const parsed = parseSkillsFromApi(profile.skills ?? []);
  const fullName = displayNameFromUser(profile, taskerNameFromBid(tasker));
  const phone =
    profile.phone_number?.trim() ||
    profile.phone?.trim() ||
    tasker?.phone_number?.trim() ||
    '';

  const location =
    profile.city?.trim() ||
    profile.location_display?.trim() ||
    tasker?.city?.trim() ||
    '';
  const avatar = profile.profile_image
    ? getMediaUrl(profile.profile_image)
    : tasker?.profile_image
      ? getMediaUrl(tasker.profile_image)
      : '';

  return {
    fullName,
    tagline: profile.tagline?.trim() || '',
    email: profile.email?.trim() || tasker?.email?.trim() || '',
    phone,
    location,
    avatar,
    description: profile.bio?.trim() || '',
    hourlyRate: '',
    specialization: parsed.specialization !== 'Select' ? parsed.specialization : '',
    profileType: '',
    skills: parsed.skillRows,
    languages: parsed.languages,
    education: parsed.education,
    experience: parsed.experience,
    awards: parsed.awards,
    transport:
      parsed.transport.length > 0
        ? parsed.transport
        : (profile.transportation_tags ?? []).filter(Boolean),
    licenceBadges: getVerifiedLicenceBadges(profile.badges),
  };
}

export function buildFreelancerCvDataFromBid(bid: Bid): FreelancerCvPreviewData {
  const tasker = bid.tasker;
  return buildFreelancerCvDataFromUser(
    {
      first_name: tasker?.first_name,
      last_name: tasker?.last_name,
      full_name: tasker?.full_name,
      email: tasker?.email,
      profile_image: tasker?.profile_image,
      bio: tasker?.bio,
      tagline: tasker?.tagline,
      city: tasker?.city,
      phone_number: tasker?.phone_number,
      skills: [],
    },
    tasker,
  );
}

function taskerNameFromBid(tasker?: Bid['tasker']): string {
  if (!tasker) return 'Applicant';
  const full = [tasker.first_name, tasker.last_name].filter(Boolean).join(' ').trim();
  return full || tasker.username || tasker.email || 'Applicant';
}

export function resolveBidListingKind(bid: Bid): string | null {
  if (bid.task_listing_kind) return bid.task_listing_kind;
  const task = bid.task;
  if (task && typeof task === 'object' && 'listing_kind' in task) {
    const kind = (task as { listing_kind?: string | null }).listing_kind;
    return kind ?? null;
  }
  return null;
}
