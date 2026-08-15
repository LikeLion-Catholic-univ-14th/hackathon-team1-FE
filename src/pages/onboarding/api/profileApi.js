const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''
const USER_ID = 1

// ── Enum 매핑 (프론트 한글 → 서버 영문) ──────────────────────────────

const skinTypeMap = {
  건성: 'DRY',
  지성: 'OILY',
  복합성: 'COMBINATION',
  수부지: 'DEHYDRATED',
  민감성: 'SENSITIVE',
}

const skinConcernMap = {
  기미: 'BLEMISH',
  잡티: 'SPOT',
  여드름: 'ACNE',
  홍조: 'REDNESS',
  건조: 'DRYNESS',
}

const baseAirportMap = {
  ICN: 'INCHEON',
  GMP: 'GIMPO',
  인천: 'INCHEON',
  김포: 'GIMPO',
}

// 역방향 매핑 (서버 → 프론트)
export const skinTypeReverseMap = Object.fromEntries(
  Object.entries(skinTypeMap).map(([k, v]) => [v, k]),
)

export const skinConcernReverseMap = Object.fromEntries(
  Object.entries(skinConcernMap).map(([k, v]) => [v, k]),
)

export const baseAirportReverseMap = {
  INCHEON: 'ICN',
  GIMPO: 'GMP',
}

// ── 변환 유틸 ──────────────────────────────────────────────────────

const toEnumArray = (values, map) =>
  (Array.isArray(values) ? values : [])
    .map((v) => map[v] ?? v)
    .filter(Boolean)

const toBaseAirportEnum = (value) =>
  baseAirportMap[value] ?? baseAirportMap.ICN ?? 'INCHEON'

// ── API 호출 ──────────────────────────────────────────────────────

export async function saveProfile(profile) {
  const body = {
    name: profile.name?.trim() ?? '',
    baseAirport: toBaseAirportEnum(profile.baseAirport),
    skinTypes: toEnumArray(
      Array.isArray(profile.skinType) ? profile.skinType : [profile.skinType],
      skinTypeMap,
    ),
    skinConcerns: toEnumArray(profile.skinConcerns, skinConcernMap),
    procedure: {
      hasProcedureHistory: profile.treatmentHistory === '있음',
      procedureDetails: profile.treatmentDetail?.trim() ?? '',
      procedureWithinOneMonth: Boolean(profile.recentTreatment),
    },
  }

  const response = await fetch(`${apiBaseUrl}/users/${USER_ID}/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`프로필 저장 실패: ${response.status}`)
  }
}
