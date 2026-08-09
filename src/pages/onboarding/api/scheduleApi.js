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

export const extractSchedulesFromFiles = async (files) => {
  const uploadableFiles = files
    .map((file) => file.sourceFile)
    .filter((file) => file instanceof File)

  if (uploadableFiles.length === 0) {
    throw new Error('No uploadable files')
  }

  const formData = new FormData()
  uploadableFiles.forEach((file) => {
    formData.append('files', file)
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
