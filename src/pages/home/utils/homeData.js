import { readOnboardingProfile } from '../../onboarding/storage/onboardingProfileStorage.js'
import { getHome } from '../api/homeApi.js'
import { mockHomeData } from '../mocks/mockHome.js'

const airportLocationMap = {
  ICN: '인천국제공항',
  GMP: '김포국제공항',
}

const readString = (value, fallback = '') =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback

const normalizeSolutionDays = (data) => {
  const sourceDays = Array.isArray(data.solutionDays)
    ? data.solutionDays
    : Array.isArray(data.dailySolutions)
      ? data.dailySolutions
      : []

  if (sourceDays.length > 0) {
    return sourceDays
      .map((day, index) => ({
        id: readString(day.id, `solution-day-${index}`),
        date: readString(day.date),
        title: readString(day.title),
        offset: typeof day.offset === 'number' ? day.offset : index,
        isToday: Boolean(day.isToday),
        selectedProductName: readString(day.selectedProductName),
        solutions: Array.isArray(day.solutions) ? day.solutions : [],
      }))
      .filter((day) => day.solutions.length > 0)
  }

  const solutions = Array.isArray(data.solutions) ? data.solutions : []

  if (solutions.length > 0) {
    return [
      {
        id: 'solution-day-today',
        title: '오늘의 솔루션',
        offset: 0,
        isToday: true,
        solutions,
      },
    ]
  }

  return mockHomeData.solutionDays
}

function mergeHomeData(data) {
  const baseAirport = readString(data.user?.baseAirport, mockHomeData.user.baseAirport)
  const locationFallback = airportLocationMap[baseAirport] ?? baseAirport
  const solutionDays = normalizeSolutionDays(data)
  const todaySolutionDay =
    solutionDays.find((day) => day.isToday || day.offset === 0) ?? solutionDays[0]

  return {
    ...mockHomeData,
    ...data,
    solutionDays,
    solutions: todaySolutionDay?.solutions ?? mockHomeData.solutions,
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
