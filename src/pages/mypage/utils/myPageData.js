import {
  hasOnboardingSunscreensStorage,
  readOnboardingProfile,
  readOnboardingSunscreens,
} from '../../onboarding/storage/onboardingProfileStorage.js'
import { getMyPage } from '../api/mypageApi.js'
import { mockMyPage } from '../mocks/mockMyPage.js'

export function getFallbackMyPageData() {
  const onboardingProfile = readOnboardingProfile()
  const onboardingSunscreens = readOnboardingSunscreens()
  const hasStoredOnboardingSunscreens = hasOnboardingSunscreensStorage()

  if (!onboardingProfile && !hasStoredOnboardingSunscreens) {
    return mockMyPage
  }

  return {
    ...mockMyPage,
    profile: onboardingProfile
      ? {
          ...mockMyPage.profile,
          ...onboardingProfile,
          skinConcerns:
            onboardingProfile.skinConcerns.length > 0
              ? onboardingProfile.skinConcerns
              : mockMyPage.profile.skinConcerns,
        }
      : mockMyPage.profile,
    pouch: hasStoredOnboardingSunscreens
      ? onboardingSunscreens ?? []
      : mockMyPage.pouch,
  }
}

export async function loadMyPageData() {
  const fallbackData = getFallbackMyPageData()
  const shouldKeepStoredEmptyPouch =
    hasOnboardingSunscreensStorage() &&
    Array.isArray(fallbackData.pouch) &&
    fallbackData.pouch.length === 0

  try {
    const apiData = await getMyPage()

    if (shouldKeepStoredEmptyPouch) {
      return {
        ...apiData,
        profile: fallbackData.profile,
        pouch: [],
      }
    }

    return apiData
  } catch {
    return fallbackData
  }
}
