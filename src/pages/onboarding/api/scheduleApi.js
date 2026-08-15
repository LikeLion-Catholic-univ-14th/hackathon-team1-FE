import { mockSchedules } from '../mocks/mockSchedules.js'

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

// 서버가 아직 안 열려 있어 추출이 실패하면 목데이터로 대체한다.
// .env 에 VITE_USE_MOCK_EXTRACT=false 를 넣으면 이 대체를 끌 수 있다.
const useMockFallback = import.meta.env.VITE_USE_MOCK_EXTRACT !== 'false'

// 🎬 시연용 — 파일명에 'fail' 또는 '실패'가 들어가면 인식 실패로 처리한다.
//    "사진이 흐려서 못 읽었을 때 → 직접 입력" 흐름을 보여주기 위한 장치.
//    서버 연동이 끝나면 이 함수와 호출부를 지우면 된다.
const isDemoFailureFile = (uploadableFiles) =>
  uploadableFiles.some((file) => /fail|실패/i.test(file.name ?? ''))

const withMockIds = () =>
  mockSchedules.map((schedule, index) => ({
    ...schedule,
    id: `${schedule.id ?? 'mock-schedule'}-${Date.now()}-${index}`,
  }))

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
    formData.append('files', file)
  })

  try {
    const response = await fetch(scheduleExtractEndpoint, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Schedule extract failed: ${response.status}`)
    }

    const responseData = await response.json()

    return normalizeSchedulesResponse(responseData)
  } catch (error) {
    if (!useMockFallback) {
      throw error
    }

    console.warn('[schedule] 추출 API 실패 — 목데이터로 대체합니다.', error)

    return withMockIds()
  }
}
