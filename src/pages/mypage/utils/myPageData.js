import {
  hasOnboardingSunscreensStorage,
  readOnboardingProfile,
  readOnboardingSunscreens,
} from '../../onboarding/storage/onboardingProfileStorage.js'
import { getMyPage } from '../api/mypageApi.js'

const emptyMyPage = {
  profile: {
    name: '',
    baseAirport: '',
    skinType: [],
    skinConcerns: [],
    treatmentHistory: '',
    treatmentDetail: '',
    recentTreatment: false,
  },
  pouch: [],
}

export function getFallbackMyPageData() {
  const onboardingProfile = readOnboardingProfile()
  const onboardingSunscreens = readOnboardingSunscreens()
  const hasStoredOnboardingSunscreens = hasOnboardingSunscreensStorage()

  return {
    profile: onboardingProfile
      ? { ...emptyMyPage.profile, ...onboardingProfile }
      : emptyMyPage.profile,
    pouch: hasStoredOnboardingSunscreens
      ? onboardingSunscreens ?? []
      : emptyMyPage.pouch,
  }
}

export async function loadMyPageData() {
  const fallbackData = getFallbackMyPageData()

  try {
    const apiData = await getMyPage()
    return apiData
  } catch {
    return fallbackData
  }
}
