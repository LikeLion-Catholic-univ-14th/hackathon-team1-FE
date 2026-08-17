const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

const scheduleExtractEndpoint =
  import.meta.env.VITE_SCHEDULE_EXTRACT_API_URL ?? `${apiBaseUrl}/schedules/extract`

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

  const schedules = rawSchedules.map((schedule, index) => {
    const departureTime = pickValue(schedule, [
      'departureTime',
      'departure_time',
      'startTime',
    ])
    const arrivalTime = pickValue(schedule, ['arrivalTime', 'arrival_time', 'endTime'])

    // date 추출: 서버가 '2026-08-09T09:00:00' 형태로 주면 앞부분에서 MM/DD 추출
    let date = pickValue(schedule, ['date', 'flightDate', 'departureDate'])
    if (!date && departureTime) {
      const match = departureTime.match(/(\d{4})-(\d{2})-(\d{2})/)
      if (match) {
        date = `${match[2]}/${match[3]}`
      }
    }

    // 시간 추출: '2026-08-09T09:00:00' → '09:00'
    const extractTime = (value) => {
      if (!value) return ''
      const timeMatch = value.match(/T(\d{2}:\d{2})/)
      if (timeMatch) return timeMatch[1]
      const shortMatch = value.match(/(\d{2}:\d{2})/)
      if (shortMatch) return shortMatch[1]
      return value
    }

    return {
      id: pickValue(schedule, ['id', 'scheduleId']) || `schedule-${index + 1}`,
      date,
      departureTime: extractTime(departureTime),
      departureAirport: pickValue(schedule, [
        'departureAirport',
        'departure_airport',
        'origin',
        'from',
      ]),
      arrivalTime: extractTime(arrivalTime),
      arrivalAirport: pickValue(schedule, [
        'arrivalAirport',
        'arrival_airport',
        'destination',
        'to',
      ]),
      flightNumber: pickValue(schedule, ['flightNumber', 'flight_number']),
      isQuickTurn: Boolean(schedule.isQuickTurn),
    }
  })

  const hasInvalidSchedule = schedules.some(
    (schedule) =>
      !schedule.departureAirport ||
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

  // 명세서: multipart/form-data, 필드명은 'image', 한 번에 한 장.
  // 여러 장이면 한 장씩 보내고 결과를 이어 붙인다
  const extractOne = async (file) => {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(scheduleExtractEndpoint, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')

      console.error('[일정 인식] 서버 응답', response.status, detail)

      throw new Error(`Schedule extract failed: ${response.status} ${detail}`)
    }

    return normalizeSchedulesResponse(await response.json())
  }

  const results = []

  for (const file of uploadableFiles) {
    results.push(...(await extractOne(file)))
  }

  // 여러 장을 합치면 id 가 겹칠 수 있어 다시 매긴다
  return results.map((schedule, index) => ({
    ...schedule,
    id: `${schedule.id ?? 'schedule'}-${index + 1}`,
  }))
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
    // 직접 입력 화면에는 편명 칸이 없다. 빈 문자열로 보내면 된다고 백엔드 확인함
    flightNumber: schedule.flightNumber ?? '',
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

  const payload = { schedules: items }

  // 무엇을 보냈는지 콘솔에서 바로 볼 수 있게 남긴다
  console.log('[일정 저장] 보내는 값', JSON.stringify(payload, null, 2))

  const response = await fetch(`${apiBaseUrl}/schedules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    // 서버가 왜 거절했는지 본문에 적혀 있다
    const detail = await response.text().catch(() => '')

    console.error('[일정 저장] 서버 응답', response.status, detail)

    throw new Error(`일정 저장 실패: ${response.status} ${detail}`)
  }

  // 200 인데 본문이 비어 있을 수도 있다
  const text = await response.text()

  return text ? JSON.parse(text) : null
}
