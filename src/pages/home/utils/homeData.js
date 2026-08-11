import { readOnboardingProfile } from '../../onboarding/storage/onboardingProfileStorage.js'
import { getHome } from '../api/homeApi.js'
import { mockHomeData } from '../mocks/mockHome.js'

const airportLocationMap = {
  ICN: '인천국제공항',
  GMP: '김포국제공항',
}

const readString = (value, fallback = '') =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback

function mergeHomeData(data) {
  const baseAirport = readString(data.user?.baseAirport, mockHomeData.user.baseAirport)
  const locationFallback = airportLocationMap[baseAirport] ?? baseAirport

  return {
    ...mockHomeData,
    ...data,
    user: {
      ...mockHomeData.user,
      ...data.user,
      name: readString(data.user?.name, mockHomeData.user.name),
      baseAirport,
      location: readString(
        data.user?.location,
        locationFallback || mockHomeData.user.location,
      ),
      date: readString(data.user?.date, mockHomeData.user.date),
      currentTime: readString(data.user?.currentTime, mockHomeData.user.currentTime),
    },
  }
}

export function getFallbackHomeData() {
  const onboardingProfile = readOnboardingProfile()

  if (!onboardingProfile) {
    return mockHomeData
  }

  const baseAirport = readString(onboardingProfile.baseAirport)

  return mergeHomeData({
    user: {
      name: readString(onboardingProfile.name),
      baseAirport,
      location: airportLocationMap[baseAirport] ?? baseAirport,
    },
  })
}

export async function loadHomeData() {
  try {
    const homeData = await getHome()
    return mergeHomeData(homeData)
  } catch {
    return getFallbackHomeData()
  }
}
