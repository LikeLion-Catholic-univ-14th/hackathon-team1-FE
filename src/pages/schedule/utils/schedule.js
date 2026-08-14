// 데모 기준일. 실제 배포 시 new Date() 기반으로 교체
export const TODAY = '2026-08-14'

// 'YYYY-MM-DD' 문자열은 그냥 비교해도 날짜 순서가 맞는다
export const isFuture = (date) => date > TODAY

// 백엔드 필드명이 isOuting / outing / mode 로 갈려 있어 모두 받는다
export const readOuting = (info) => {
  if (typeof info?.outing === 'boolean') {
    return info.outing
  }

  if (typeof info?.isOuting === 'boolean') {
    return info.isOuting
  }

  if (typeof info?.mode === 'string') {
    return info.mode === 'OUTING'
  }

  return true
}

// 캘린더 점 등급. mode가 INDOOR면 실내, 아니면 riskLevel 기준
export const readDayLevel = (day) => {
  if (!day) {
    return null
  }

  if (day.mode === 'INDOOR' || day.status === 'INDOOR') {
    return 'INDOOR'
  }

  return day.riskLevel ?? day.status ?? null
}

import airports from '../../../components/common/schedule/airports.json'

// 주요 노선은 도시명을 직접 둔다.
// airports.json 은 도시명이 아니라 공항명이라 그대로 쓰면
// SYD → "킹스포트 스미스 공항" 처럼 시안과 달라진다.
const AIRPORT_CITY = {
  ICN: '인천',
  GMP: '김포',
  SYD: '시드니',
  MEL: '멜버른',
  BNE: '브리즈번',
  NRT: '도쿄',
  HND: '도쿄',
  KIX: '오사카',
  PEK: '베이징',
  PVG: '상하이',
  HKG: '홍콩',
  BKK: '방콕',
  SIN: '싱가포르',
  CDG: '파리',
  LHR: '런던',
  FRA: '프랑크푸르트',
  FCO: '로마',
  MAD: '마드리드',
  DXB: '두바이',
  AUH: '아부다비',
  HNL: '호놀룰루',
  LAX: '로스앤젤레스',
  JFK: '뉴욕',
  SFO: '샌프란시스코',
  YVR: '밴쿠버',
}

// 코드로 빠르게 찾기 위한 표
const airportByCode = {}
airports.forEach((airport) => {
  airportByCode[airport.code] = airport.name
})

// "인천 국제공항" → "인천"
const stripAirportSuffix = (name) =>
  name
    .replace(/(국제)?공항.*$/, '')
    .replace(/지역$/, '')
    .trim()

export const airportToCity = (code) => {
  if (!code) {
    return ''
  }

  if (AIRPORT_CITY[code]) {
    return AIRPORT_CITY[code]
  }

  const name = airportByCode[code]

  if (name) {
    return stripAirportSuffix(name) || name
  }

  return code
}

// "ICN → SYD" → { from: 'ICN', to: 'SYD' }
export const parseRoute = (route) => {
  const [from, to] = (route ?? '').split(/[→\->]+/).map((part) => part.trim())
  return { from, to }
}

// "2026-08-09T09:00:00" → "09:00"
export const readTime = (isoString) => (isoString ?? '').slice(11, 16)

// "2026-08-09" → "08/09"
export const readShortDate = (date) => (date ?? '').slice(5).replace('-', '/')
