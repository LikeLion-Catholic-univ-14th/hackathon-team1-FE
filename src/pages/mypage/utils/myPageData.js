import {
  readOnboardingProfile,
  readOnboardingSunscreens,
} from '../../onboarding/storage/onboardingProfileStorage.js'
import { getMyPage } from '../api/mypageApi.js'
import { mockMyPage } from '../mocks/mockMyPage.js'

export function getFallbackMyPageData() {
  const onboardingProfile = readOnboardingProfile()
  const onboardingSunscreens = readOnboardingSunscreens()

  if (!onboardingProfile && !onboardingSunscreens) {
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
    pouch: onboardingSunscreens ?? mockMyPage.pouch,
  }
}

export async function loadMyPageData() {
  try {
    return await getMyPage()
  } catch {
    return getFallbackMyPageData()
  }
}
