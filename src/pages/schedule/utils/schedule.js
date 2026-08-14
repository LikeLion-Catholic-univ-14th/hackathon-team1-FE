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

const AIRPORT_CITY = {
  ICN: '인천',
  GMP: '김포',
  SYD: '시드니',
  NRT: '도쿄',
  HND: '도쿄',
  CDG: '파리',
  DXB: '두바이',
  HNL: '호놀룰루',
  BNE: '브리즈번',
  LAX: '로스앤젤레스',
}

export const airportToCity = (code) => AIRPORT_CITY[code] ?? code

// "ICN → SYD" → { from: 'ICN', to: 'SYD' }
export const parseRoute = (route) => {
  const [from, to] = (route ?? '').split(/[→\->]+/).map((part) => part.trim())
  return { from, to }
}

// "2026-08-09T09:00:00" → "09:00"
export const readTime = (isoString) => (isoString ?? '').slice(11, 16)

// "2026-08-09" → "08/09"
export const readShortDate = (date) => (date ?? '').slice(5).replace('-', '/')
