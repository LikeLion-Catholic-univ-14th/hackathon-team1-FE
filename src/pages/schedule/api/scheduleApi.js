// 서버가 배포되면 VITE_API_BASE_URL 만 채우면 동작한다.
// 현재 스웨거는 daily 응답이 평평한 구조(route/riskLevel/uvDetail)라
// 화면이 쓰는 departureInfo / arrivalInfo 형태로 여기서 변환한다.
// 백엔드 DTO가 바뀌면 이 파일만 고치면 되고 컴포넌트는 안 건드려도 된다.
import { airportToCity, parseRoute } from '../utils/schedule.js'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

const request = async (path, options) => {
  const response = await fetch(`${apiBaseUrl}${path}`, options)

  if (!response.ok) {
    throw new Error(`${path} failed: ${response.status}`)
  }

  return response.json()
}

// 평평한 응답 → 화면용 카드 형태
export const normalizeDaily = (raw) => {
  if (!raw) {
    return null
  }

  // 백엔드가 departureInfo/arrivalInfo 를 주기 시작하면 그대로 사용
  if (raw.departureInfo) {
    return raw
  }

  const { from, to } = parseRoute(raw.route)
  const outing = raw.outing ?? raw.isOuting ?? true

  const makeSide = (code, timeDifference) => ({
    cityName: airportToCity(code),
    displayDate: raw.date,
    timeDifference,
    outing,
    riskLevel: raw.riskLevel ?? 'CAUTION',
    uvDetail: raw.uvDetail ?? { warningMessage: '', graph: [] },
  })

  return {
    ...raw,
    departureAirport: raw.departureAirport ?? from ?? null,
    arrivalAirport: raw.arrivalAirport ?? to ?? null,
    departureInfo: makeSide(from, null),
    arrivalInfo: to && to !== from ? makeSide(to, null) : null,
  }
}

export const fetchCalendar = (month) =>
  request(`/schedules/calendar?month=${month}`)

export const fetchDailyDetail = (date) =>
  request(`/schedules/daily?date=${date}`).then(normalizeDaily)

export const patchOuting = (scheduleId, outing) =>
  request(`/schedules/${scheduleId}/outing`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ outing }),
  }).then(normalizeDaily)

export const extractSchedules = (file) => {
  const formData = new FormData()
  formData.append('image', file)

  return request('/schedules/extract', { method: 'POST', body: formData })
}

export const createSchedules = (schedules) =>
  request('/schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schedules }),
  })
