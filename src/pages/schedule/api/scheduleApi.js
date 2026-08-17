// api-docs (1).json 기준 — schedule-controller / daily-outing-controller
//
// 서버 응답과 화면이 쓰는 모양이 다른 부분은 여기서 맞춘다.
// 컴포넌트는 이 파일이 만들어 주는 모양만 알면 되고, 백엔드 DTO 가 바뀌어도
// 이 파일만 고치면 된다.
//
// 서버 LocationInfo = { airportCode, riskLevel, uvDetail }
// 화면이 필요한 것   = { cityName, displayDate, timeDifference, outing, riskLevel, uvDetail }
//   cityName    → airportCode 로 만든다 (airports.json)
//   displayDate → date 로 만든다
//   timeDifference → 서버에 없음. 백엔드 추가 필요 (지금은 null → 화면에서 숨김)
import { airportToCity, parseRoute, toDisplayDate } from '../utils/schedule.js'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

const request = async (path, options) => {
  const response = await fetch(`${apiBaseUrl}${path}`, options)

  if (!response.ok) {
    throw new Error(`${path} failed: ${response.status}`)
  }

  return response.json()
}

// GET /schedules/calendar?month=YYYY-MM
// → { month, hasScheduleHistory, days: [{ date, scheduleId, status }] }
export const fetchCalendar = (month) =>
  request(`/schedules/calendar?month=${month}`)

// 시차 → "한국 +1시간"
// 백엔드 koreaTimeDifference 의 형태를 아직 못 봐서 세 가지를 모두 받는다.
//   숫자 1        → "한국 +1시간"
//   문자열 "+1"   → "한국 +1시간"
//   문장 "한국 +1시간" → 그대로
const formatTimeDifference = (value) => {
  if (value == null || value === '') {
    return null
  }

  if (typeof value === 'number') {
    // 인천·김포처럼 시차가 없으면 아예 표시하지 않는다
    return value === 0 ? null : `한국 ${value > 0 ? '+' : '-'}${Math.abs(value)}시간`
  }

  const text = String(value).trim()

  // 숫자를 뽑아서 0 이면 표시하지 않는다 ("0시간", "+0", "한국 0시간" 모두)
  const hours = Number(text.replace(/[^0-9+-.]/g, ''))

  if (!Number.isNaN(hours) && hours === 0) {
    return null
  }

  // 이미 완성된 문장이면 그대로 쓴다
  if (text.includes('한국')) {
    return text
  }

  if (Number.isNaN(hours)) {
    return text
  }

  return `한국 ${hours > 0 ? '+' : '-'}${Math.abs(hours)}시간`
}

// 서버 LocationInfo → 화면용 카드 한 장
const toCard = (info, fallbackCode, date, outing) => {
  if (!info) {
    return null
  }

  // 필드명이 koreaTimeDifference / timeDifference 어느 쪽으로 와도 받는다
  const timeDifference = formatTimeDifference(
    info.koreaTimeDifference ?? info.timeDifference,
  )

  // 시안: "8월 9일 (일) · 한국 +1시간" — 시차가 없으면 날짜만
  const dateText = toDisplayDate(date)

  return {
    ...info,
    cityName: airportToCity(info.airportCode ?? fallbackCode),
    displayDate: timeDifference ? `${dateText} · ${timeDifference}` : dateText,
    timeDifference,
    outing,
    riskLevel: info.riskLevel ?? 'CAUTION',
    uvDetail: info.uvDetail ?? { warningMessage: '', graph: [] },
  }
}

// GET /schedules/daily 응답 → 화면용
export const normalizeDaily = (raw, date) => {
  if (!raw) {
    return null
  }

  const day = raw.date ?? date
  const { from, to } = parseRoute(raw.route)
  const outing = raw.isOuting ?? raw.outing ?? true

  const departureCode = raw.departureInfo?.airportCode ?? from ?? null
  const arrivalCode = raw.arrivalInfo?.airportCode ?? to ?? null

  return {
    ...raw,
    date: day,
    // 비행 정보 바가 쓰는 값들
    departureAirport: departureCode,
    arrivalAirport: arrivalCode,
    // 비행 시각. 응답 최상위에 오는 게 기본이고,
    // LocationInfo 안에 담겨 오는 경우도 대비해 둔다
    flightNumber: raw.flightNumber ?? null,
    departureTime:
      raw.departureTime ?? raw.departureInfo?.departureTime ?? null,
    arrivalTime: raw.arrivalTime ?? raw.arrivalInfo?.arrivalTime ?? null,
    departureInfo: toCard(raw.departureInfo, from, day, outing),
    arrivalInfo: toCard(raw.arrivalInfo, to, day, outing),
  }
}

// GET /schedules/daily?date=YYYY-MM-DD
export const fetchDailyDetail = (date) =>
  request(`/schedules/daily?date=${date}`).then((raw) =>
    normalizeDaily(raw, date),
  )

// 외출 토글 — /daily-outing 하나로 통일한다.
// 백엔드 안내: /schedules/{id}/outing 은 일정이 있는 날만 되지만
//              /daily-outing 은 일정 유무와 상관없이 날짜만으로 다 된다
// 응답은 { date, isOuting } 뿐이라, 화면을 갱신하려면 daily 를 다시 불러야 한다
export const patchOuting = (date, outing) =>
  request(`/daily-outing?date=${date}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ outing }),
  })

// POST /schedules
export const createSchedules = (schedules) =>
  request('/schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schedules }),
  })

// PATCH /schedules/{scheduleId}
export const updateSchedule = (scheduleId, schedule) =>
  request(`/schedules/${scheduleId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(schedule),
  })
