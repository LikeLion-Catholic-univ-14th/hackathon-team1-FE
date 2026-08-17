<<<<<<< HEAD
=======
import {
  hasOnboardingSunscreensStorage,
  readOnboardingProfile,
  readOnboardingSunscreens,
  saveOnboardingSunscreens,
} from '../../onboarding/storage/onboardingProfileStorage.js'
>>>>>>> origin/main
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

// 서버 응답이 오기 전에 쓰는 초기값.
// 예전에는 localStorage 값을 채웠지만, 서버가 원본이라 이제 빈 값을 쓴다
export function getFallbackMyPageData() {
  return {
    profile: { ...emptyMyPage.profile },
    pouch: [],
  }
}

// 서버가 원본이다. 실패하면 localStorage 로 가리지 않고 빈 값을 돌려준다.
// (가려버리면 연동이 깨진 걸 아무도 모르고, 다른 기기에서는 어차피 빈 화면이다)
export async function loadMyPageData() {
  try {
<<<<<<< HEAD
    return await getMyPage()
  } catch (error) {
    console.error('마이페이지 조회 실패', error)

    return emptyMyPage
=======
    const apiData = await getMyPage()

    // API 성공 시 localStorage도 동기화 (아이콘 일관성)
    if (Array.isArray(apiData.pouch) && apiData.pouch.length > 0) {
      saveOnboardingSunscreens({ products: apiData.pouch })
    }

    return apiData
  } catch {
    return fallbackData
>>>>>>> origin/main
  }
}
