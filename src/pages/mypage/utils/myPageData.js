import {
  hasOnboardingSunscreensStorage,
  readOnboardingProfile,
  readOnboardingSunscreens,
  saveOnboardingSunscreens,
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

    // API 성공 시 localStorage도 동기화 (아이콘 일관성)
    if (Array.isArray(apiData.pouch) && apiData.pouch.length > 0) {
      saveOnboardingSunscreens({ products: apiData.pouch })
    }

    return apiData
  } catch {
    return fallbackData
  }
}
