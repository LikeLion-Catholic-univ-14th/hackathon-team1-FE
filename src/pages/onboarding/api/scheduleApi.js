const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

const scheduleExtractEndpoint =
  import.meta.env.VITE_SCHEDULE_EXTRACT_API_URL ?? '/api/schedules/extract'

const scheduleListKeys = ['schedules', 'flights', 'items', 'results']

const pickValue = (source, keys) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source[key] !== null) {
      return String(source[key])
    }
  }

  return ''
}

const findScheduleList = (responseData) => {
  if (Array.isArray(responseData)) {
    return responseData
  }

  for (const key of scheduleListKeys) {
    if (Array.isArray(responseData?.[key])) {
      return responseData[key]
    }

    if (Array.isArray(responseData?.data?.[key])) {
      return responseData.data[key]
    }
  }

  if (Array.isArray(responseData?.data)) {
    return responseData.data
  }

  return null
}

export const normalizeSchedulesResponse = (responseData) => {
  const rawSchedules = findScheduleList(responseData)

  if (!Array.isArray(rawSchedules) || rawSchedules.length === 0) {
    throw new Error('No schedules found in response')
  }

  const schedules = rawSchedules.map((schedule, index) => ({
    id: pickValue(schedule, ['id', 'scheduleId']) || `schedule-${index + 1}`,
    date: pickValue(schedule, ['date', 'flightDate', 'departureDate']),
    departureTime: pickValue(schedule, [
      'departureTime',
      'departure_time',
      'startTime',
    ]),
    departureAirport: pickValue(schedule, [
      'departureAirport',
      'departure_airport',
      'origin',
      'from',
    ]),
    arrivalTime: pickValue(schedule, ['arrivalTime', 'arrival_time', 'endTime']),
    arrivalAirport: pickValue(schedule, [
      'arrivalAirport',
      'arrival_airport',
      'destination',
      'to',
    ]),
  }))

  const hasInvalidSchedule = schedules.some(
    (schedule) =>
      !schedule.date ||
      !schedule.departureTime ||
      !schedule.departureAirport ||
      !schedule.arrivalTime ||
      !schedule.arrivalAirport,
  )

  if (hasInvalidSchedule) {
    throw new Error('Invalid schedule response shape')
  }

  return schedules
}

// 🎬 시연용 — 파일명에 'fail' 또는 '실패'가 들어가면 인식 실패로 처리한다.
//    "사진이 흐려서 못 읽었을 때 → 직접 입력" 흐름을 보여주기 위한 장치.
//    실제 테스트에는 영향이 없다 (그런 이름을 안 쓰면 된다)
const isDemoFailureFile = (uploadableFiles) =>
  uploadableFiles.some((file) => /fail|실패/i.test(file.name ?? ''))

export const extractSchedulesFromFiles = async (files) => {
  const uploadableFiles = files
    .map((file) => file.sourceFile)
    .filter((file) => file instanceof File)

  if (uploadableFiles.length === 0) {
    throw new Error('No uploadable files')
  }

  // 🎬 시연용 — 파일명에 fail/실패 가 있으면 바로 인식 실패로 보낸다
  if (isDemoFailureFile(uploadableFiles)) {
    throw new Error('Demo: schedule extract failed')
  }

  const formData = new FormData()
  uploadableFiles.forEach((file) => {
    formData.append('image', file)
  })

  const response = await fetch(scheduleExtractEndpoint, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Schedule extract failed: ${response.status}`)
  }

  const responseData = await response.json()

  return normalizeSchedulesResponse(responseData)
}

// ── 등록 (POST /schedules) ──────────────────────────────────────────
// 화면이 들고 있는 모양      { date: '08/09', departureTime: '09:00', departureAirport: 'ICN', ... }
// 서버가 받는 ScheduleItem  { departureTime: '2026-08-09T09:00:00', departureAirport: 'ICN', ... }
// 날짜와 시각이 따로 놀아서 여기서 하나로 합친다.

const pad = (value) => String(value).padStart(2, '0')

// '08/09' 또는 '2026-08-09' → '2026-08-09'
const toIsoDate = (date) => {
  const text = String(date ?? '').trim()

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text
  }

  const matched = text.match(/(\d{1,2})[/.-](\d{1,2})/)

  if (!matched) {
    return null
  }

  // 화면에는 연도가 없다. 올해로 본다
  const year = new Date().getFullYear()

  return `${year}-${pad(matched[1])}-${pad(matched[2])}`
}

// '2026-08-09' 를 하루 뒤로
const nextDay = (isoDate) => {
  const moved = new Date(`${isoDate}T00:00:00`)
  moved.setDate(moved.getDate() + 1)

  return `${moved.getFullYear()}-${pad(moved.getMonth() + 1)}-${pad(moved.getDate())}`
}

const toScheduleItem = (schedule) => {
  const isoDate = toIsoDate(schedule.date)

  if (!isoDate) {
    throw new Error(`날짜를 읽을 수 없습니다: ${schedule.date}`)
  }

  // 도착이 출발보다 이르면 다음 날 도착으로 본다 (야간 비행)
  const isOvernight = schedule.arrivalTime < schedule.departureTime
  const arrivalDate = isOvernight ? nextDay(isoDate) : isoDate

  return {
    flightNumber: schedule.flightNumber ?? null,
    departureAirport: schedule.departureAirport,
    arrivalAirport: schedule.arrivalAirport,
    departureTime: `${isoDate}T${schedule.departureTime}:00`,
    arrivalTime: `${arrivalDate}T${schedule.arrivalTime}:00`,
    isQuickTurn: schedule.isQuickTurn ?? false,
  }
}

export const saveSchedules = async (schedules) => {
  const items = (schedules ?? []).map(toScheduleItem)

  if (items.length === 0) {
    throw new Error('저장할 일정이 없습니다')
  }

  const response = await fetch(`${apiBaseUrl}/schedules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schedules: items }),
  })

  if (!response.ok) {
    throw new Error(`일정 저장 실패: ${response.status}`)
  }

  return response.json()
}
