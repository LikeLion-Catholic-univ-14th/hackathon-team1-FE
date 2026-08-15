import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBar from '../../components/common/StatusBar.jsx'
import { saveOnboardingProfile } from '../onboarding/storage/onboardingProfileStorage.js'
import { updateProfile } from './api/mypageApi.js'
import {
  getFallbackMyPageData,
  loadMyPageData,
} from './utils/myPageData.js'

const stageClass =
  'flex min-h-svh w-full items-start justify-center bg-[#bdbdbd] p-6 max-[520px]:bg-[#f5f7fb] max-[520px]:p-0'
const screenClass =
  'h-[874px] min-h-[874px] w-[402px] overflow-x-hidden overflow-y-auto bg-[#f5f7fb] text-left font-[SF_Pro] text-[#1d2b44] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[520px]:h-svh max-[520px]:min-h-svh max-[520px]:w-full'
const headingFontClass =
  "font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"

const airportOptions = [
  { label: '인천', value: 'ICN' },
  { label: '김포', value: 'GMP' },
]
const skinTypeOptions = ['건성', '지성', '복합성', '수부지', '민감성']
const skinConcernOptions = ['기미', '잡티', '여드름', '홍조', '건조']
const treatmentOptions = ['없음', '있음']

const airportMap = {
  인천: 'ICN',
  김포: 'GMP',
  ICN: 'ICN',
  GMP: 'GMP',
}

const toSelectionArray = (value) =>
  Array.isArray(value) ? value.filter(Boolean) : value ? [value] : []

const normalizeProfile = (profile) => ({
  name: profile?.name ?? '',
  baseAirport: airportMap[profile?.baseAirport] ?? 'ICN',
  skinType:
    toSelectionArray(profile?.skinType).length > 0
      ? toSelectionArray(profile?.skinType)
      : ['복합성'],
  skinConcerns:
    Array.isArray(profile?.skinConcerns) && profile.skinConcerns.length > 0
      ? profile.skinConcerns
      : ['기미', '건조'],
  treatmentHistory: profile?.treatmentHistory ?? '없음',
  treatmentDetail: profile?.treatmentDetail ?? '',
  recentTreatment: Boolean(profile?.recentTreatment),
})

const getProfileSnapshot = (profile) =>
  JSON.stringify({
    ...profile,
    name: profile.name.trim(),
    skinType: toSelectionArray(profile.skinType).sort(),
    skinConcerns: [...profile.skinConcerns].sort(),
  })

function BackButton({ onClick }) {
  return (
    <button
      className="absolute left-[24px] flex h-8 w-8 items-center justify-center border-0 bg-transparent p-0"
      type="button"
      aria-label="마이페이지로 돌아가기"
      onClick={onClick}
    >
      <span
        className="h-[10px] w-[10px] rotate-45 border-b-[2.4px] border-l-[2.4px] border-[#1d2b44]"
        aria-hidden="true"
      />
    </button>
  )
}

function OptionButton({ children, selected, onClick }) {
  return (
    <button
      className={`inline-flex h-[39px] items-center justify-center rounded-full border-[1.276px] px-[14px] text-[13px] font-bold leading-[15px] transition-colors ${headingFontClass} ${
        selected
          ? 'border-[#f5a623] bg-[#fff8eb] text-[#f5a623]'
          : 'border-[#eceef2] bg-white text-[#8a9eb8]'
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function FieldLabel({ children }) {
  return (
    <span
      className={`mb-[11px] block text-[14px] font-bold leading-[15px] text-[#8a9eb8] ${headingFontClass}`}
    >
      {children}
    </span>
  )
}

function ProfileEdit() {
  const navigate = useNavigate()
  const fallbackProfile = useMemo(
    () => normalizeProfile(getFallbackMyPageData().profile),
    [],
  )
  const [initialProfile, setInitialProfile] = useState(fallbackProfile)
  const [form, setForm] = useState(fallbackProfile)

  useEffect(() => {
    let ignore = false

    loadMyPageData().then((data) => {
      if (!ignore) {
        const nextProfile = normalizeProfile(data.profile)
        setInitialProfile(nextProfile)
        setForm(nextProfile)
      }
    })

    return () => {
      ignore = true
    }
  }, [])

  const isDirty = getProfileSnapshot(form) !== getProfileSnapshot(initialProfile)
  const isValid =
    form.name.trim() &&
    form.baseAirport &&
    toSelectionArray(form.skinType).length > 0 &&
    form.skinConcerns.length > 0 &&
    form.treatmentHistory
  const canSubmit = Boolean(isDirty && isValid)

  const updateField = (field, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }))
  }

  const toggleConcern = (concern) => {
    setForm((prevForm) => {
      const hasConcern = prevForm.skinConcerns.includes(concern)

      return {
        ...prevForm,
        skinConcerns: hasConcern
          ? prevForm.skinConcerns.filter((item) => item !== concern)
          : [...prevForm.skinConcerns, concern],
      }
    })
  }

  const toggleSkinType = (type) => {
    setForm((prevForm) => {
      const selectedSkinTypes = toSelectionArray(prevForm.skinType)
      const hasType = selectedSkinTypes.includes(type)

      return {
        ...prevForm,
        skinType: hasType
          ? selectedSkinTypes.filter((item) => item !== type)
          : [...selectedSkinTypes, type],
      }
    })
  }

  const handleSubmit = () => {
    if (!canSubmit) {
      return
    }

    const updatedProfile = {
      ...form,
      name: form.name.trim(),
    }

    saveOnboardingProfile(updatedProfile)
    updateProfile(updatedProfile).catch(() => {})
    navigate('/mypage')
  }

  return (
    <div className={stageClass}>
      <section className={screenClass}>
        <StatusBar className="bg-transparent" />

        <header className="relative flex h-[60px] items-center justify-center bg-white">
          <BackButton onClick={() => navigate('/mypage')} />
          <h1
            className={`m-0 text-[17px] font-bold leading-6 tracking-[-0.4px] ${headingFontClass}`}
          >
            내 정보 수정
          </h1>
        </header>

        <main className="px-6 pb-10 pt-[34px]">
          <section className="box-border rounded-[22px] bg-white px-[22px] pb-[20px] pt-[28px] shadow-[0_4px_18px_0_rgba(29,43,68,0.06)]">
            <label className="mb-[26px] block">
              <FieldLabel>이름</FieldLabel>
              <input
                className={`box-border h-[34px] w-full border-0 border-b-[1.276px] bg-transparent px-0 pb-4 font-[SF_Pro] text-[15px] font-normal leading-normal tracking-[-0.64px] text-[#1d2b44] outline-none transition-colors ${
                  form.name !== initialProfile.name
                    ? 'border-[#f5a623]'
                    : 'border-[#eceef2] focus:border-[#f5a623]'
                }`}
                type="text"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
              />
            </label>

            <div className="mb-[25px]">
              <FieldLabel>베이스 공항</FieldLabel>
              <div className="flex gap-[10px]">
                {airportOptions.map((airport) => (
                  <OptionButton
                    key={airport.value}
                    selected={form.baseAirport === airport.value}
                    onClick={() => updateField('baseAirport', airport.value)}
                  >
                    {airport.label}
                  </OptionButton>
                ))}
              </div>
            </div>

            <div className="mb-[25px]">
              <FieldLabel>피부 타입</FieldLabel>
              <div className="flex flex-wrap gap-[8px]">
                {skinTypeOptions.map((type) => (
                  <OptionButton
                    key={type}
                    selected={toSelectionArray(form.skinType).includes(type)}
                    onClick={() => toggleSkinType(type)}
                  >
                    {type}
                  </OptionButton>
                ))}
              </div>
            </div>

            <div className="mb-[25px]">
              <FieldLabel>피부 고민</FieldLabel>
              <div className="flex flex-wrap gap-[8px]">
                {skinConcernOptions.map((concern) => (
                  <OptionButton
                    key={concern}
                    selected={form.skinConcerns.includes(concern)}
                    onClick={() => toggleConcern(concern)}
                  >
                    {concern}
                  </OptionButton>
                ))}
              </div>
            </div>

            <div className="mb-[23px]">
              <FieldLabel>시술 이력</FieldLabel>
              <div className="flex gap-[8px]">
                {treatmentOptions.map((option) => (
                  <OptionButton
                    key={option}
                    selected={form.treatmentHistory === option}
                    onClick={() => updateField('treatmentHistory', option)}
                  >
                    {option}
                  </OptionButton>
                ))}
              </div>

              {form.treatmentHistory === '있음' && (
                <div className="mt-[14px] flex items-center gap-[12px]">
                  <input
                    className={`box-border h-[40px] flex-1 rounded-[10px] border-[1.276px] bg-white px-[14px] font-[SF_Pro] text-[13px] font-normal leading-normal tracking-[-0.64px] text-[#1d2b44] outline-none placeholder:text-[#8a9eb8] ${
                      form.treatmentDetail
                        ? 'border-[#f5a623]'
                        : 'border-[#eceef2] focus:border-[#f5a623]'
                    }`}
                    type="text"
                    value={form.treatmentDetail}
                    placeholder="어떤 시술을 받으셨나요?"
                    onChange={(event) => updateField('treatmentDetail', event.target.value)}
                  />
                  <label className={`flex shrink-0 cursor-pointer items-center gap-[6px] text-[12px] font-[510] text-[#8a9eb8] ${headingFontClass}`}>
                    <input
                      className="peer sr-only"
                      type="checkbox"
                      checked={form.recentTreatment}
                      onChange={(event) => updateField('recentTreatment', event.target.checked)}
                    />
                    <span
                      className="h-[18px] w-[18px] shrink-0 rounded-[20px] border-[1.276px] border-[#eceef2] bg-white shadow-[0_2px_6px_0_rgba(29,43,68,0.04)] peer-checked:border-[#f5a623] peer-checked:bg-[#f5a623] peer-checked:shadow-none"
                      aria-hidden="true"
                    />
                    최근 한달 내
                  </label>
                </div>
              )}
            </div>

            <button
              className={`flex h-[53px] w-full items-center justify-center rounded-[16px] border-0 text-[15px] font-bold leading-[23px] transition-colors ${headingFontClass} ${
                canSubmit
                  ? 'bg-[#f5a623] text-white shadow-[0_4px_12px_0_rgba(245,166,35,0.32)]'
                  : 'bg-[#f0f2f6] text-[#91a4bf]'
              }`}
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              정보 수정하기
            </button>
          </section>
        </main>
      </section>
    </div>
  )
}

export default ProfileEdit
