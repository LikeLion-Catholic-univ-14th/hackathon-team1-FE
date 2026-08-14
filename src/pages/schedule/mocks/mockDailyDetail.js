// GET /schedules/daily?date=YYYY-MM-DD
// 현재 배포된 스웨거는 평평한 구조(route / riskLevel / uvDetail)지만
// 시안은 출발지·도착지 카드 2장이 필요해 departureInfo / arrivalInfo 형태로 둔다.
// 백엔드 DTO 수정이 반영되면 api/scheduleApi.js 의 normalize 함수만 고치면 된다.

const makeGraph = (peak) => [
  { time: '00:00', uvValue: 0 },
  { time: '03:00', uvValue: 0 },
  { time: '06:00', uvValue: Math.round(peak * 0.15) },
  { time: '09:00', uvValue: Math.round(peak * 0.55) },
  { time: '12:00', uvValue: peak },
  { time: '15:00', uvValue: Math.round(peak * 0.65) },
  { time: '18:00', uvValue: Math.round(peak * 0.18) },
  { time: '21:00', uvValue: 0 },
  { time: '24:00', uvValue: 0 },
]

// 비행 당일 — 출발지 + 도착지 카드 2장
const flightDay = {
  scheduleId: 105,
  date: '2026-08-09',
  flightNumber: 'KE121',
  departureAirport: 'ICN',
  arrivalAirport: 'SYD',
  departureTime: '2026-08-09T09:00:00',
  arrivalTime: '2026-08-09T13:00:00',
  departureInfo: {
    cityName: '인천',
    displayDate: '8월 9일 (일)',
    timeDifference: null,
    outing: true,
    riskLevel: 'DANGER',
    uvDetail: {
      warningMessage: '09–17시 자외선 주의 — SPF 50+ 권장',
      graph: makeGraph(11),
    },
  },
  arrivalInfo: {
    cityName: '시드니',
    displayDate: '8월 9일 (일) · 한국 +1시간',
    timeDifference: '한국 +1시간',
    outing: true,
    riskLevel: 'CAUTION',
    uvDetail: {
      warningMessage: '09–17시 자외선 주의 — SPF 50+ 권장',
      graph: makeGraph(8),
    },
  },
}

// 레이오버 체류일 — 머무는 도시 카드 1장
const layoverDay = {
  scheduleId: 104,
  date: '2026-08-08',
  flightNumber: null,
  departureAirport: null,
  arrivalAirport: null,
  departureTime: null,
  arrivalTime: null,
  departureInfo: {
    cityName: '시드니',
    displayDate: '8월 8일 (토) · 한국 +1시간',
    timeDifference: '한국 +1시간',
    outing: true,
    riskLevel: 'CAUTION',
    uvDetail: {
      warningMessage: '09–17시 자외선 주의 — SPF 50+ 권장',
      graph: makeGraph(8),
    },
  },
  arrivalInfo: null,
}

// 실내(외출 off) — 그래프는 그대로, 등급만 안전
const indoorDay = {
  scheduleId: 106,
  date: '2026-08-11',
  flightNumber: null,
  departureAirport: null,
  arrivalAirport: null,
  departureTime: null,
  arrivalTime: null,
  departureInfo: {
    cityName: '인천',
    displayDate: '8월 11일 (화)',
    timeDifference: null,
    outing: false,
    riskLevel: 'SAFE',
    uvDetail: {
      warningMessage: '실내 위주라 자외선 노출이 적어요',
      graph: makeGraph(6),
    },
  },
  arrivalInfo: null,
}

// 비행 없는 대기일 — 국내 UV 그래프만 (백엔드 수정 반영 예정)
const standbyDay = {
  scheduleId: null,
  date: '2026-08-05',
  flightNumber: null,
  departureAirport: null,
  arrivalAirport: null,
  departureTime: null,
  arrivalTime: null,
  departureInfo: {
    cityName: '인천',
    displayDate: '8월 5일 (수)',
    timeDifference: null,
    outing: true,
    riskLevel: 'SAFE',
    uvDetail: {
      warningMessage: '자외선 약함 — 톤업 선크림으로 충분해요',
      graph: makeGraph(5),
    },
  },
  arrivalInfo: null,
}

const byDate = {
  '2026-08-09': flightDay,
  '2026-08-08': layoverDay,
  '2026-08-11': indoorDay,
}

// 실제로는 백엔드가 displayDate 를 완성해서 준다. 목데이터용 임시 포맷터
const WEEK = ['일', '월', '화', '수', '목', '금', '토']

const toDisplayDate = (date) => {
  const [year, month, day] = date.split('-').map(Number)
  const weekday = WEEK[new Date(year, month - 1, day).getDay()]
  return `${month}월 ${day}일 (${weekday})`
}

export const mockDailyDetail = flightDay

// 날짜를 눌렀을 때 그날 데이터를 돌려준다. 없으면 대기일 형태로 생성
export const getMockDaily = (date) => {
  if (byDate[date]) {
    return byDate[date]
  }

  return {
    ...standbyDay,
    date,
    departureInfo: {
      ...standbyDay.departureInfo,
      displayDate: toDisplayDate(date),
    },
  }
}
