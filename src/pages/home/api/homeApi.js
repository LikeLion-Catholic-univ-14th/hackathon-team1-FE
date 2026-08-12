const HOME_ENDPOINT = import.meta.env.VITE_HOME_API_URL ?? '/api/home'

const readString = (value, fallback = '') =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback

export function normalizeHomeData(payload) {
  const source = payload?.data ?? payload

  if (!source || typeof source !== 'object') {
    throw new Error('홈 응답 형식이 올바르지 않습니다.')
  }

  const userSource = source.user ?? source.profile ?? source.member ?? {}

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
      location: readString(userSource.location ?? userSource.city),
      date: readString(userSource.date),
      currentTime: readString(userSource.currentTime ?? userSource.localTime),
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
