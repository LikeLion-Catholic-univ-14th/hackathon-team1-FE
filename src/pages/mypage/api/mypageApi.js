const MY_PAGE_ENDPOINT = import.meta.env.VITE_MYPAGE_API_URL ?? '/api/mypage'

const readString = (value, fallback = '') =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback

const readArray = (value, fallback = []) =>
  Array.isArray(value) ? value.filter(Boolean) : fallback

const readStringArray = (value, fallback = []) =>
  Array.isArray(value)
    ? value.map((item) => readString(item)).filter(Boolean)
    : readString(value)
      ? [readString(value)]
      : fallback

export function normalizeMyPageData(payload) {
  const source = payload?.data ?? payload

  if (!source || typeof source !== 'object') {
    throw new Error('마이페이지 응답 형식이 올바르지 않습니다.')
  }

  const profileSource = source.profile ?? source.user ?? source.member ?? {}
  const pouchSource =
    source.pouch ?? source.products ?? source.sunscreens ?? source.sunscreenList

  if (!profileSource || typeof profileSource !== 'object') {
    throw new Error('프로필 응답 형식이 올바르지 않습니다.')
  }

  if (!Array.isArray(pouchSource)) {
    throw new Error('파우치 응답 형식이 올바르지 않습니다.')
  }

  return {
    profile: {
      name: readString(profileSource.name),
      baseAirport: readString(
        profileSource.baseAirport ??
          profileSource.airport ??
          profileSource.airportCode,
      ),
      skinType: readStringArray(profileSource.skinType ?? profileSource.skinTypes),
      skinConcerns: readArray(
        profileSource.skinConcerns ?? profileSource.concerns,
      ),
      treatmentHistory: readString(profileSource.treatmentHistory),
      treatmentDetail: readString(profileSource.treatmentDetail),
      recentTreatment: Boolean(profileSource.recentTreatment),
    },
    pouch: pouchSource.map((item, index) => ({
      id: readString(item.id, `sunscreen-${index}`),
      productName: readString(item.productName ?? item.name, '선크림'),
      type: readString(item.type, '선크림'),
      blockingMethod: readString(
        item.blockingMethod ?? item.method,
        '유기자차',
      ),
      spf: readString(item.spf, '50+++'),
      pa: readString(item.pa, 'PA+'),
      icon: readString(item.icon),
    })),
  }
}

export async function getMyPage() {
  const response = await fetch(MY_PAGE_ENDPOINT, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('마이페이지 정보를 불러오지 못했습니다.')
  }

  const payload = await response.json()

  return normalizeMyPageData(payload)
}
