import {
  skinTypeReverseMap,
  skinConcernReverseMap,
  baseAirportReverseMap,
} from '../../onboarding/api/profileApi.js'
import {
  filterTypeReverseMap,
  productTypeReverseMap,
  paReverseMap,
} from '../../onboarding/api/sunscreenApi.js'
import sunscreenIcon01 from '../../../assets/sunscreen/sunscreen-icon-01.svg'
import sunscreenIcon02 from '../../../assets/sunscreen/sunscreen-icon-02.svg'
import sunscreenIcon03 from '../../../assets/sunscreen/sunscreen-icon-03.svg'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''
const MY_PAGE_ENDPOINT = import.meta.env.VITE_MYPAGE_API_URL ?? `${apiBaseUrl}/users/profile`

const sunscreenIcons = [sunscreenIcon01, sunscreenIcon02, sunscreenIcon03]

const readString = (value, fallback = '') =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback

const toKoreanSkinTypes = (types) =>
  (Array.isArray(types) ? types : [])
    .map((t) => skinTypeReverseMap[t] ?? t)
    .filter(Boolean)

const toKoreanSkinConcerns = (concerns) =>
  (Array.isArray(concerns) ? concerns : [])
    .map((c) => skinConcernReverseMap[c] ?? c)
    .filter(Boolean)

const toKoreanBaseAirport = (value) =>
  baseAirportReverseMap[value] ?? value ?? ''

// 한글 → 서버 enum
const skinTypeToEnum = Object.fromEntries(
  Object.entries(skinTypeReverseMap).map(([k, v]) => [v, k]),
)
const skinConcernToEnum = Object.fromEntries(
  Object.entries(skinConcernReverseMap).map(([k, v]) => [v, k]),
)
const baseAirportToEnum = {
  ICN: 'INCHEON',
  GMP: 'GIMPO',
  인천: 'INCHEON',
  김포: 'GIMPO',
}
const filterTypeToEnum = Object.fromEntries(
  Object.entries(filterTypeReverseMap).map(([k, v]) => [v, k]),
)
const productTypeToEnum = Object.fromEntries(
  Object.entries(productTypeReverseMap).map(([k, v]) => [v, k]),
)
const paToEnum = Object.fromEntries(
  Object.entries(paReverseMap).map(([k, v]) => [v, k]),
)

// ── GET /users/profile ────────────────────────────────────────────

export function normalizeMyPageData(payload) {
  const source = payload?.data ?? payload

  if (!source || typeof source !== 'object') {
    throw new Error('마이페이지 응답 형식이 올바르지 않습니다.')
  }

  const profileSource = source
  const pouchSource = source.pouch ?? source.products ?? source.sunscreens ?? []

  return {
    profile: {
      name: readString(profileSource.name),
      baseAirport: toKoreanBaseAirport(profileSource.baseAirport),
      skinType: toKoreanSkinTypes(profileSource.skinTypes ?? profileSource.skinType),
      skinConcerns: toKoreanSkinConcerns(profileSource.skinConcerns ?? profileSource.concerns ?? []),
      treatmentHistory: profileSource.procedureHistory?.hasHistory ? '있음' : '없음',
      treatmentDetail: readString(profileSource.procedureHistory?.detail),
      recentTreatment: Boolean(profileSource.procedureHistory?.recentOneMonth ?? profileSource.procedureHistory?.isRecentOneMonth),
    },
    pouch: (Array.isArray(pouchSource) ? pouchSource : []).map((item, index) => ({
      id: String(item.productId ?? item.id ?? `sunscreen-${index}`),
      productName: readString(item.name ?? item.productName, '선크림'),
      type: productTypeReverseMap[item.productType] ?? readString(item.type, '선크림'),
      blockingMethod: filterTypeReverseMap[item.filterType] ?? readString(item.blockingMethod ?? item.method, ''),
      spf: readString(item.spf, '50'),
      pa: paReverseMap[item.pa] ?? readString(item.pa, 'PA+'),
      icon: sunscreenIcons[index % sunscreenIcons.length],
    })),
  }
}

export async function getMyPage() {
  const response = await fetch(MY_PAGE_ENDPOINT, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error('마이페이지 정보를 불러오지 못했습니다.')
  }

  const payload = await response.json()
  return normalizeMyPageData(payload)
}

// ── PUT /users/profile ────────────────────────────────────────────

export async function updateProfile(profile) {
  const body = {
    name: (profile.name ?? '').trim(),
    baseAirport: baseAirportToEnum[profile.baseAirport] ?? 'INCHEON',
    skinType: (Array.isArray(profile.skinType) ? profile.skinType : [profile.skinType])
      .map((t) => skinTypeToEnum[t] ?? t)
      .filter(Boolean)
      .join(','),
    skinConcerns: (profile.skinConcerns ?? [])
      .map((c) => skinConcernToEnum[c] ?? c)
      .filter(Boolean),
    procedureHistory: {
      hasHistory: profile.treatmentHistory === '있음',
      detail: (profile.treatmentDetail ?? '').trim(),
      recentOneMonth: Boolean(profile.recentTreatment),
    },
  }

  const response = await fetch(`${apiBaseUrl}/users/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`프로필 수정 실패: ${response.status}`)
  }
}

// ── DELETE /users/pouch/{productId} ───────────────────────────────

export async function deletePouchItem(productId) {
  const response = await fetch(`${apiBaseUrl}/users/pouch/${productId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`파우치 삭제 실패: ${response.status}`)
  }
}

// ── PUT /users/pouch/{productId} ──────────────────────────────────

export async function updatePouchItem(productId, product) {
  const body = {
    brand: (product.brand ?? '').trim(),
    name: (product.productName ?? product.name ?? '').trim(),
    productType: productTypeToEnum[product.type] ?? 'CREAM',
    filterType: filterTypeToEnum[product.blockingMethod] ?? 'ORGANIC',
    spf: (product.spf ?? '50').replace(/[^0-9+]/g, '') || '50',
    pa: paToEnum[product.pa] ?? 'PA_PLUS',
  }

  const response = await fetch(`${apiBaseUrl}/users/pouch/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`파우치 수정 실패: ${response.status}`)
  }
}

// ── GET /users/procedures ─────────────────────────────────────────

export async function getProcedures() {
  const response = await fetch(`${apiBaseUrl}/users/procedures`, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`시술 이력 조회 실패: ${response.status}`)
  }

  const payload = await response.json()
  const items = Array.isArray(payload) ? payload : payload?.data ?? []

  return items.map((item) => ({
    id: String(item.procedureId ?? item.id ?? ''),
    name: readString(item.name),
    recent: Boolean(item.recentOneMonth),
  }))
}

// ── POST /users/procedures ────────────────────────────────────────

export async function addProcedure(name, recentOneMonth = false) {
  const response = await fetch(`${apiBaseUrl}/users/procedures`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, recentOneMonth }),
  })

  if (!response.ok) {
    throw new Error(`시술 이력 추가 실패: ${response.status}`)
  }
}

// ── DELETE /users/procedures/{procedureId} ────────────────────────

export async function deleteProcedure(procedureId) {
  const response = await fetch(`${apiBaseUrl}/users/procedures/${procedureId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`시술 이력 삭제 실패: ${response.status}`)
  }
}
