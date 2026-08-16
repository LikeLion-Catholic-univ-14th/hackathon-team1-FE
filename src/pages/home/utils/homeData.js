import {
  hasOnboardingSunscreensStorage,
  readOnboardingProfile,
  readOnboardingSunscreens,
} from '../../onboarding/storage/onboardingProfileStorage.js'
import { getHome } from '../api/homeApi.js'
import { getSunscreenIcon } from '../../../utils/sunscreenIcon.js'

const baseAirportLocationMap = {
  ICN: '인천, 대한민국',
  GMP: '김포, 대한민국',
  INCHEON: '인천, 대한민국',
  GIMPO: '김포, 대한민국',
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

const getCurrentTimeLabel = () => {
  try {
    const now = new Date()
    const hours = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Seoul',
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
    return ''
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
          icon: readString(sunscreen.icon, getSunscreenIcon(sunscreen.id ?? index)),
          recommended:
            typeof sunscreen.recommended === 'boolean'
              ? sunscreen.recommended
              : index === 0,
        }))
        .filter((sunscreen) => sunscreen.name)
    : []

const readStoredHomeSunscreens = () =>
  hasOnboardingSunscreensStorage()
    ? normalizeStoredSunscreensForHome(readOnboardingSunscreens() ?? [])
    : null

// 빈 상태 기본값
const emptyHomeData = {
  mode: '',
  user: {
    name: '',
    baseAirport: '',
    location: '',
    date: getTodayDateLabel(),
    currentTime: getKoreaCurrentTime(),
    hasScheduleLocation: false,
  },
  uvSummary: {
    title: '오늘 자외선 환산',
    updatedAt: getCurrentTimeLabel(),
    city: '',
    comparison: '',
    value: 0,
    badges: [],
  },
  uvGraph: null,
  sunscreens: [],
  sunscreenTip: { tags: [], text: '' },
  solutions: [],
  solutionDays: [],
  outdoor: {
    title: '피부 충전 중 ...',
    description: '외출 시, 버튼을 켜서\n맞춤 자외선 처방을 다시 받아보세요.',
  },
}

function mergeHomeData(data) {
  const onboardingProfile = readOnboardingProfile()
  const baseAirport = readString(
    data.user?.baseAirport || onboardingProfile?.baseAirport,
    'ICN',
  )
  const hasScheduleLocation = Boolean(
    readString(data.user?.location) && readString(data.user?.currentTime) && data.user?.hasScheduleLocation,
  )

  return {
    ...emptyHomeData,
    ...data,
    uvSummary: {
      ...emptyHomeData.uvSummary,
      ...data.uvSummary,
      updatedAt: readString(data.uvSummary?.updatedAt, getCurrentTimeLabel()),
    },
    user: {
      ...emptyHomeData.user,
      ...data.user,
      name: readString(data.user?.name, onboardingProfile?.name ?? ''),
      baseAirport,
      location: hasScheduleLocation
        ? readString(data.user?.location)
        : getBaseAirportFallbackLocation(baseAirport),
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

  return mergeHomeData({
    user: {
      name: readString(onboardingProfile?.name),
      baseAirport: readString(onboardingProfile?.baseAirport),
    },
    sunscreens: storedSunscreens ?? [],
  })
}

export async function loadHomeData() {
  const fallbackData = getFallbackHomeData()
  const storedSunscreens = readStoredHomeSunscreens()

  try {
    const homeData = await getHome()
    const mergedHomeData = mergeHomeData(homeData)

    // localStorage에 선크림이 있으면 그걸 우선 사용 (온보딩 직후)
    if (storedSunscreens !== null && storedSunscreens.length > 0) {
      return {
        ...mergedHomeData,
        sunscreens: storedSunscreens,
      }
    }

    // API에서 선크림이 왔으면 사용
    if (mergedHomeData.sunscreens.length > 0) {
      return mergedHomeData
    }

    // 둘 다 없으면 fallback
    return {
      ...mergedHomeData,
      sunscreens: fallbackData.sunscreens,
    }
  } catch {
    return fallbackData
  }
}
