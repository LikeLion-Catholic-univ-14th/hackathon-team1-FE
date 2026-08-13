export const ONBOARDING_PROFILE_STORAGE_KEY = 'sst:onboarding:profile'
export const ONBOARDING_SUNSCREEN_STORAGE_KEY = 'sst:onboarding:sunscreen'

const airportCodeMap = {
  인천: 'ICN',
  김포: 'GMP',
}

const readText = (value) =>
  typeof value === 'string' && value.trim() ? value.trim() : ''

const readTextArray = (value) =>
  Array.isArray(value)
    ? value.map(readText).filter(Boolean)
    : readText(value)
      ? [readText(value)]
      : []

const buildSpfLabel = (spf, pa) => {
  const spfText = readText(spf)
  const paSuffix = readText(pa).replace(/^PA/, '')

  if (!spfText) {
    return ''
  }

  if (!paSuffix || spfText.includes('+')) {
    return spfText
  }

  return `${spfText}${paSuffix}`
}

export function normalizeStoredOnboardingProfile(profile) {
  const baseAirport = readText(profile?.baseAirport)

  return {
    name: readText(profile?.name),
    baseAirport: airportCodeMap[baseAirport] ?? baseAirport,
    skinType: readTextArray(profile?.skinType),
    skinConcerns: Array.isArray(profile?.skinConcerns)
      ? profile.skinConcerns.filter(Boolean)
      : [],
    treatmentHistory: readText(profile?.treatmentHistory),
    treatmentDetail: readText(profile?.treatmentDetail),
    recentTreatment: Boolean(profile?.recentTreatment),
  }
}

export function saveOnboardingProfile(profile) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }

  const storedProfile = normalizeStoredOnboardingProfile(profile)

  window.localStorage.setItem(
    ONBOARDING_PROFILE_STORAGE_KEY,
    JSON.stringify(storedProfile),
  )
}

export function readOnboardingProfile() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null
  }

  try {
    const rawProfile = window.localStorage.getItem(ONBOARDING_PROFILE_STORAGE_KEY)

    if (!rawProfile) {
      return null
    }

    const profile = normalizeStoredOnboardingProfile(JSON.parse(rawProfile))
    const hasProfileData =
      profile.name ||
      profile.baseAirport ||
      profile.skinType.length > 0 ||
      profile.skinConcerns.length > 0 ||
      profile.treatmentHistory ||
      profile.treatmentDetail ||
      profile.recentTreatment

    return hasProfileData ? profile : null
  } catch {
    return null
  }
}

export function normalizeStoredOnboardingSunscreens(sunscreen) {
  const products = Array.isArray(sunscreen?.products)
    ? sunscreen.products
    : Array.isArray(sunscreen)
      ? sunscreen
      : []

  return products
    .map((product, index) => ({
      id: readText(product?.id) || `onboarding-sunscreen-${index}`,
      productName: readText(product?.productName ?? product?.name),
      type: readText(product?.type),
      blockingMethod: readText(product?.blockingMethod ?? product?.method),
      spf: buildSpfLabel(product?.spf, product?.pa),
      pa: readText(product?.pa),
      icon: readText(product?.icon),
    }))
    .filter(
      (product) =>
        product.productName ||
        product.type ||
        product.blockingMethod ||
        product.spf ||
        product.pa ||
        product.icon,
    )
}

export function saveOnboardingSunscreens(sunscreen) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }

  const storedSunscreens = normalizeStoredOnboardingSunscreens(sunscreen)

  window.localStorage.setItem(
    ONBOARDING_SUNSCREEN_STORAGE_KEY,
    JSON.stringify(storedSunscreens),
  )
}

export function readOnboardingSunscreens() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null
  }

  try {
    const rawSunscreens = window.localStorage.getItem(
      ONBOARDING_SUNSCREEN_STORAGE_KEY,
    )

    if (!rawSunscreens) {
      return null
    }

    const sunscreens = normalizeStoredOnboardingSunscreens(
      JSON.parse(rawSunscreens),
    )

    return sunscreens
  } catch {
    return null
  }
}

export function hasOnboardingSunscreensStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false
  }

  return window.localStorage.getItem(ONBOARDING_SUNSCREEN_STORAGE_KEY) !== null
}
