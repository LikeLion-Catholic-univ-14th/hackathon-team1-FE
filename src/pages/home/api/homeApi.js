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

export function normalizeHomeData(payload) {
  const source = payload?.data ?? payload

  if (!source || typeof source !== 'object') {
    throw new Error('홈 응답 형식이 올바르지 않습니다.')
  }

  const userSource = source.user ?? source.profile ?? source.member ?? {}
  const locationSource =
    source.location ??
    source.destinationLocation ??
    source.destination?.location ??
    source.schedule?.location ??
    source.flight?.location ??
    userSource.location ??
    userSource.city
  const currentTime = readString(
    source.currentTime ??
      source.localTime ??
      source.schedule?.currentTime ??
      source.schedule?.localTime ??
      source.flight?.currentTime ??
      source.flight?.localTime ??
      userSource.currentTime ??
      userSource.localTime,
  )
  const location = formatLocation(locationSource)

  if (!userSource || typeof userSource !== 'object') {
    throw new Error('홈 사용자 응답 형식이 올바르지 않습니다.')
  }

  return {
    ...source,
    user: {
      ...source.user,
      name: readString(userSource.name),
      baseAirport: readString(
        userSource.baseAirport ?? userSource.airport ?? userSource.airportCode,
      ),
      location,
      date: readString(userSource.date),
      currentTime,
      hasScheduleLocation: Boolean(location && currentTime),
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
