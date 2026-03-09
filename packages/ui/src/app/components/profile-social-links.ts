import type { ProfileData } from "./cms-data";

export type ProfileSocialKey = "twitter" | "instagram" | "linkedin";

const DEFAULT_SOCIAL_LABELS: Record<ProfileSocialKey, string> = {
  twitter: "Twitter",
  instagram: "Instagram",
  linkedin: "LinkedIn",
};

const ALL_SOCIAL_KEYS: ProfileSocialKey[] = ["twitter", "instagram", "linkedin"];

function getSocialUrl(profile: ProfileData, key: ProfileSocialKey) {
  return profile[key];
}

function getSocialLabel(profile: ProfileData, key: ProfileSocialKey) {
  const labelKey = `${key}Label` as const;
  return profile[labelKey].trim() || DEFAULT_SOCIAL_LABELS[key];
}

export function getProfileSocialLinks(
  profile: ProfileData,
  keys: ProfileSocialKey[] = ALL_SOCIAL_KEYS,
) {
  return keys
    .map((key) => {
      const url = getSocialUrl(profile, key).trim();
      return {
        key,
        label: getSocialLabel(profile, key),
        url,
      };
    })
    .filter((item) => Boolean(item.url));
}
