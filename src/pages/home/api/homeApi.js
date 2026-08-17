import { getSunscreenIcon } from '../../../utils/sunscreenIcon.js'
import {
  filterTypeReverseMap,
  productTypeReverseMap,
  paReverseMap,
} from '../../onboarding/api/sunscreenApi.js'

const HOME_ENDPOINT = import.meta.env.VITE_HOME_API_URL ?? '/api/home'

const readString = (value, fallback = '') =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback

const formatLocation = (location) => {
  if (typeof location === 'string') {
    return readString(location)
  }

  if (!location || typeof location !== 'object') {
    return ''
  }

  const city = readString(location.city)
  const country = readString(location.country)

  if (city && country) {
    return `${city}, ${country}`
  }

  return city || country
}

const normalizeProduct = (product, index) => ({
  id: String(product.productId ?? `product-${index}`),
  name: readString(product.name),
  type: productTypeReverseMap[product.type] ?? readString(product.type, '선크림'),
  method: filterTypeReverseMap[product.filterType] ?? readString(product.type, ''),
  spf: typeof product.spf === 'number' ? `${product.spf}` : readString(String(product.spf ?? '')),
  icon: getSunscreenIcon(product.productId ?? index),
  recommended: Boolean(product.recommended),
})

const normalizeSolutions = (solutions) => {
  if (!Array.isArray(solutions) || solutions.length === 0) {
    return []
  }

  const iconMap = { BEFORE: 'sun', DURING: 'plane', AFTER: 'moon' }

  return solutions.map((sol, index) => ({
    id: `solution-${index}`,
    icon: iconMap[sol.phase] ?? ['sun', 'plane', 'moon'][index % 3],
    timing: sol.phase === 'BEFORE' ? '외출 전' : sol.phase === 'DURING' ? '외출 중' : '복귀 후',
    title: readString(sol.title),
    description: readString(sol.description),
  }))
}

export function normalizeHomeData(payload) {
  const source = payload?.data ?? payload

  if (!source || typeof source !== 'object') {
    throw new Error('홈 응답 형식이 올바르지 않습니다.')
  }

  // TodayResponse 구조에 맞게 정규화
  const mode = readString(source.mode)
  const userSource = source.user ?? {}
  const locationSource = source.location
  const location = formatLocation(locationSource)
  const currentTime = readString(source.currentTime)
  const uvSummarySource = source.uvSummary ?? {}
  const sunProtectionSource = source.sunProtection ?? {}

  // 선크림 제품 정규화
  const products = Array.isArray(sunProtectionSource.products)
    ? sunProtectionSource.products.map(normalizeProduct)
    : []

  // UV 요약 정규화
  const uvSummary = {
    title: '오늘 자외선 환산',
    updatedAt: '',
    city: readString(uvSummarySource.location),
    comparison: uvSummarySource.koreaComparison
      ? `= 서울 8월 한낮의 ${uvSummarySource.koreaComparison}배`
      : '',
    value: uvSummarySource.uvIndex ?? 0,
    badges: [
      uvSummarySource.flightExposureMinutes
        ? `밖에서 ${uvSummarySource.flightExposureMinutes}분 = 서울 ${uvSummarySource.koreaEquivalentMinutes ?? 0}분`
        : '',
      uvSummarySource.weather
        ? `${uvSummarySource.weather.condition === 'CLEAR' ? '맑음' : uvSummarySource.weather.condition ?? ''} · ${uvSummarySource.weather.temperature ?? ''}°C`
        : '',
    ].filter(Boolean),
  }

  // 솔루션 정규화
  const solutions = normalizeSolutions(source.solutions)

  // sunscreenTip 정규화
  const sunscreenTip = {
    tags: Array.isArray(sunProtectionSource.tags) ? sunProtectionSource.tags : [],
    text: readString(sunProtectionSource.message),
  }

  return {
    mode,
    user: {
      name: readString(userSource.name),
      position: readString(userSource.position),
      baseAirport: '',
      location,
      date: '',
      currentTime,
      hasScheduleLocation: Boolean(location && currentTime),
    },
    uvSummary,
    uvGraph: uvSummarySource.uvGraph
      ? { data: uvSummarySource.uvGraph }
      : null,
    sunscreens: products,
    sunscreenTip,
    solutions,
    solutionDays: solutions.length > 0
      ? [{
          id: 'solution-day-today',
          title: '오늘의 솔루션',
          offset: 0,
          isToday: true,
          solutions,
        }]
      : [],
    outdoor: {
      title: '피부 충전 중 ...',
      description: '외출 시, 버튼을 켜서\n맞춤 자외선 처방을 다시 받아보세요.',
    },
  }
}

export async function getHome() {
  const response = await fetch(HOME_ENDPOINT, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('홈 정보를 불러오지 못했습니다.')
  }

  const payload = await response.json()

  return normalizeHomeData(payload)
}
