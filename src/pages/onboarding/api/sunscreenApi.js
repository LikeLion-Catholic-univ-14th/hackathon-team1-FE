const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''
const USER_ID = 1

// ── Enum 매핑 (프론트 한글 → 서버 영문) ──────────────────────────────

const filterTypeMap = {
  무기자차: 'PHYSICAL',
  유기자차: 'ORGANIC',
  혼합자차: 'MIXED',
}

const productTypeMap = {
  선크림: 'CREAM',
  선스틱: 'STICK',
  선스프레이: 'SPRAY',
}

const paMap = {
  'PA+': 'PA_PLUS',
  'PA++': 'PA_PLUS_PLUS',
  'PA+++': 'PA_PLUS_PLUS_PLUS',
  'PA++++': 'PA_PLUS_PLUS_PLUS_PLUS',
}

// 역방향 매핑 (서버 → 프론트)
export const filterTypeReverseMap = Object.fromEntries(
  Object.entries(filterTypeMap).map(([k, v]) => [v, k]),
)

export const productTypeReverseMap = Object.fromEntries(
  Object.entries(productTypeMap).map(([k, v]) => [v, k]),
)

export const paReverseMap = Object.fromEntries(
  Object.entries(paMap).map(([k, v]) => [v, k]),
)

// ── 변환 ──────────────────────────────────────────────────────────

const toSunscreenItem = (product) => ({
  brand: product.brand?.trim() ?? '',
  name: (product.productName ?? product.name ?? '').trim(),
  filterType: filterTypeMap[product.blockingMethod ?? product.method] ?? 'ORGANIC',
  productType: productTypeMap[product.type] ?? 'CREAM',
  spf: (product.spf ?? '50').replace(/[^0-9+]/g, '') || '50',
  pa: paMap[product.pa] ?? 'PA_PLUS',
})

// ── API 호출 ──────────────────────────────────────────────────────

export async function saveSunscreens(products) {
  const sunscreens = (Array.isArray(products) ? products : []).map(toSunscreenItem)

  if (sunscreens.length === 0) {
    return
  }

  const response = await fetch(`${apiBaseUrl}/users/${USER_ID}/sunscreen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sunscreens }),
  })

  if (!response.ok) {
    throw new Error(`선크림 저장 실패: ${response.status}`)
  }
}
