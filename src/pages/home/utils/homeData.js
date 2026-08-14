import {
  hasOnboardingSunscreensStorage,
  readOnboardingProfile,
  readOnboardingSunscreens,
} from '../../onboarding/storage/onboardingProfileStorage.js'
import { getHome } from '../api/homeApi.js'
import { mockHomeData } from '../mocks/mockHome.js'

const baseAirportLocationMap = {
  ICN: '인천, 대한민국',
  GMP: '김포, 대한민국',
  인천: '인천, 대한민국',
  김포: '김포, 대한민국',
}

const readString = (value, fallback = '') =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback

const weekdayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

const getTodayDateLabel = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekday = weekdayNames[now.getDay()]
  return `${year}년 ${month}월 ${day}일 ${weekday}`
}

const getCurrentTimeLabel = (timezone) => {
  try {
    const now = new Date()
    const hours = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone ?? 'Asia/Seoul',
    }).format(now)
    return `${hours} 기준`
  } catch {
    const now = new Date()
    const h = String(now.getHours()).padStart(2, '0')
    const m = String(now.getMinutes()).padStart(2, '0')
    return `${h}:${m} 기준`
  }
}

const getKoreaCurrentTime = () => {
  try {
    const formattedTime = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Seoul',
    }).format(new Date())

    return `현지 ${formattedTime}`
  } catch {
    return '현지 10:24 AM'
  }
}

const formatDisplayCurrentTime = (value) => {
  const time = readString(value)

  if (!time) {
    return ''
  }

  return time.startsWith('현지 ') ? time : `현지 ${time}`
}

const getBaseAirportFallbackLocation = (baseAirport) =>
  baseAirportLocationMap[baseAirport] ?? baseAirportLocationMap.ICN

const hasUsableScheduleLocation = (user) =>
  Boolean(readString(user?.location) && readString(user?.currentTime) && user?.hasScheduleLocation)

const readStoredHomeSunscreens = () =>
  hasOnboardingSunscreensStorage()
    ? normalizeStoredSunscreensForHome(readOnboardingSunscreens() ?? [])
    : null

const normalizeStoredSunscreensForHome = (sunscreens) =>
  Array.isArray(sunscreens)
    ? sunscreens
        .map((sunscreen, index) => ({
          id: readString(sunscreen.id, `onboarding-home-sunscreen-${index}`),
          name: readString(sunscreen.productName ?? sunscreen.name),
          type: readString(sunscreen.type),
          method: readString(sunscreen.blockingMethod ?? sunscreen.method),
          spf: readString(sunscreen.spf),
          pa: readString(sunscreen.pa),
          icon: readString(sunscreen.icon, mockHomeData.sunscreens[index % mockHomeData.sunscreens.length]?.icon),
          recommended:
            typeof sunscreen.recommended === 'boolean'
              ? sunscreen.recommended
              : true,
        }))
        .filter((sunscreen) => sunscreen.name)
    : []

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
  const onboardingProfile = readOnboardingProfile()
  const fallbackBaseAirport = readString(
    onboardingProfile?.baseAirport,
    baseAirport || mockHomeData.user.baseAirport || 'ICN',
  )
  const hasScheduleLocation = hasUsableScheduleLocation(data.user)
  const solutionDays = normalizeSolutionDays(data)
  const todaySolutionDay =
    solutionDays.find((day) => day.isToday || day.offset === 0) ?? solutionDays[0]

  return {
    ...mockHomeData,
    ...data,
    solutionDays,
    solutions: todaySolutionDay?.solutions ?? mockHomeData.solutions,
    uvSummary: {
      ...mockHomeData.uvSummary,
      ...data.uvSummary,
      updatedAt: readString(data.uvSummary?.updatedAt, getCurrentTimeLabel()),
    },
    user: {
      ...mockHomeData.user,
      ...data.user,
      name: readString(data.user?.name, mockHomeData.user.name),
      baseAirport,
      location: hasScheduleLocation
        ? readString(data.user?.location)
        : getBaseAirportFallbackLocation(fallbackBaseAirport),
      date: readString(data.user?.date, getTodayDateLabel()),
      currentTime: hasScheduleLocation
        ? formatDisplayCurrentTime(data.user?.currentTime)
        : getKoreaCurrentTime(),
      hasScheduleLocation,
    },
  }
}

export function getFallbackHomeData() {
  const onboardingProfile = readOnboardingProfile()
  const storedSunscreens = readStoredHomeSunscreens()

  if (!onboardingProfile && storedSunscreens === null) {
    return mockHomeData
  }

  const baseAirport = readString(onboardingProfile?.baseAirport)

  return mergeHomeData({
    user: {
      name: readString(onboardingProfile?.name),
      baseAirport,
    },
    ...(storedSunscreens !== null ? { sunscreens: storedSunscreens } : {}),
  })
}

export async function loadHomeData() {
  const fallbackData = getFallbackHomeData()
  const storedSunscreens = readStoredHomeSunscreens()

  try {
    const homeData = await getHome()
    const mergedHomeData = mergeHomeData(homeData)

    if (storedSunscreens !== null) {
      return {
        ...mergedHomeData,
        sunscreens: storedSunscreens,
      }
    }

    return mergedHomeData
  } catch {
    return fallbackData
  }
}
