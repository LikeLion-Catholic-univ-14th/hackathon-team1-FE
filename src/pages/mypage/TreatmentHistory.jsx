import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import moreHorizontalIcon from '../../assets/icons/more-horizontal.svg'
import StatusBar from '../../components/common/StatusBar.jsx'
import { readOnboardingProfile } from '../onboarding/storage/onboardingProfileStorage.js'

const TREATMENT_STORAGE_KEY = 'sst:mypage:treatments'

const stageClass =
  'flex min-h-svh w-full items-start justify-center bg-[#bdbdbd] p-6 max-[520px]:bg-white max-[520px]:p-0'
const screenClass =
  "relative h-[874px] min-h-[874px] w-[402px] overflow-hidden bg-[#f5f7fb] text-left font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] text-[#1d2b44] max-[520px]:h-svh max-[520px]:min-h-svh max-[520px]:w-full"
const headingFontClass =
  "font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"

const readText = (value) =>
  typeof value === 'string' && value.trim() ? value.trim() : ''

const saveTreatments = (treatments) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }

  window.localStorage.setItem(TREATMENT_STORAGE_KEY, JSON.stringify(treatments))
}

const readStoredTreatments = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return []
  }

  try {
    const rawTreatments = window.localStorage.getItem(TREATMENT_STORAGE_KEY)

    if (rawTreatments) {
      const treatments = JSON.parse(rawTreatments)
      return Array.isArray(treatments) ? treatments : []
    }

    const onboardingProfile = readOnboardingProfile()
    const treatmentName = readText(onboardingProfile?.treatmentDetail)

    if (onboardingProfile?.treatmentHistory === '있음' && treatmentName) {
      return [
        {
          id: 'onboarding-treatment-1',
          name: treatmentName,
          recent: Boolean(onboardingProfile.recentTreatment),
        },
      ]
    }
  } catch {
    return []
  }

  return []
}

function BackIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M15 19L8 12L15 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      className="h-[18px] w-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function TreatmentForm({ onAdd }) {
  const [name, setName] = useState('')
  const [recent, setRecent] = useState(false)
  const [focused, setFocused] = useState(false)
  const canAdd = Boolean(name.trim())

  const handleAdd = () => {
    if (!canAdd) {
      return
    }

    onAdd({
      id: `treatment-${Date.now()}`,
      name: name.trim(),
      recent,
    })
    setName('')
    setRecent(false)
    setFocused(false)
  }

  return (
    <section className="flex flex-col items-stretch gap-[24px] rounded-[22px] bg-white px-[18px] pb-[20px] pt-[28px] shadow-[0_4px_18px_0_rgba(29,43,68,0.06)]">
      <label
        className={`-mb-[14px] block text-[13px] font-bold leading-[16.5px] tracking-[-0.4px] text-[#8A9EB8] ${headingFontClass}`}
        htmlFor="treatment-name"
      >
        시술 이력
      </label>

      <div className="grid grid-cols-[minmax(0,201px)_max-content] items-center gap-[14px] max-[380px]:grid-cols-[minmax(0,1fr)_max-content] max-[380px]:gap-[10px]">
        <input
          id="treatment-name"
          className={`box-border h-[48px] min-w-0 rounded-[12px] border-[1.276px] bg-[#F4F6F9] px-[14px] text-[14px] font-normal leading-normal tracking-[-0.4px] text-[#1D2B44] outline-none placeholder:text-[rgba(29,43,68,0.50)] ${
            focused || name ? 'border-[#F5A623]' : 'border-[#ECEEF2]'
          }`}
          value={name}
          placeholder="어떤 시술을 받으셨나요?"
          onBlur={() => setFocused(false)}
          onChange={(event) => setName(event.target.value)}
          onFocus={() => setFocused(true)}
        />

        <label
          className={`inline-flex min-w-max cursor-pointer items-center justify-end gap-[7px] whitespace-nowrap text-[12px] font-[590] leading-[18px] tracking-[-0.64px] text-[#3A506B] ${headingFontClass}`}
        >
          <input
            className="peer sr-only"
            type="checkbox"
            checked={recent}
            onChange={(event) => setRecent(event.target.checked)}
          />
          <span
            className="h-[18px] w-[18px] shrink-0 rounded-[20px] border-[1.276px] border-[#ECEEF2] bg-white shadow-[0_2px_6px_0_rgba(29,43,68,0.04)] peer-checked:border-[#F5A623] peer-checked:bg-[#F5A623] peer-checked:shadow-none"
            aria-hidden="true"
          />
          최근 한 달 내
        </label>
      </div>

      <button
        className={`flex h-[43px] w-full items-center justify-center rounded-[10px] border-0 text-[14px] font-bold leading-[20px] tracking-[-0.4px] ${headingFontClass} ${
          canAdd
            ? 'bg-[#1D2B44] text-white'
            : 'bg-[#F0F2F6] text-[#8A9EB8]'
        }`}
        type="button"
        disabled={!canAdd}
        onClick={handleAdd}
      >
        + 추가하기
      </button>
    </section>
  )
}

function EmptyTreatmentState() {
  return (
    <div className="flex min-h-[171px] flex-col items-center justify-center rounded-[22px] bg-white px-6 text-center shadow-[0_4px_18px_0_rgba(29,43,68,0.06)]">
      <img
        className="h-[18px] w-[18px] object-contain opacity-70"
        src={moreHorizontalIcon}
        alt=""
        aria-hidden="true"
      />
      <p
        className={`mt-[12px] m-0 text-[14px] font-[510] leading-[21px] tracking-[-0.4px] text-[#8A9EB8] ${headingFontClass}`}
      >
        아직 등록된 시술 이력이 없어요
      </p>
    </div>
  )
}

function TreatmentItem({ treatment, onRemove }) {
  return (
    <li className="flex min-h-[48px] items-center gap-[12px] rounded-[12px] border-[1.276px] border-[#ECEEF2] bg-[#F4F6F9] px-[24px] py-[12px]">
      <span
        className={`min-w-0 break-keep text-[13px] font-[510] leading-[19.5px] tracking-[-0.4px] text-[#1D2B44] [overflow-wrap:anywhere] ${headingFontClass}`}
      >
        {treatment.name}
      </span>
      {treatment.recent && (
        <span
          className={`shrink-0 text-[11px] font-[510] leading-[16.5px] tracking-[-0.4px] text-[#1D2B44] ${headingFontClass}`}
        >
          최근 한 달 내
        </span>
      )}
      <button
        className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center border-0 bg-transparent p-0 text-[#8A9EB8]"
        type="button"
        aria-label={`${treatment.name} 삭제`}
        onClick={() => onRemove(treatment.id)}
      >
        <CloseIcon />
      </button>
    </li>
  )
}

function TreatmentList({ treatments, onRemove }) {
  if (treatments.length === 0) {
    return <EmptyTreatmentState />
  }

  return (
    <section className="rounded-[22px] bg-white px-[13px] py-[13px] shadow-[0_4px_18px_0_rgba(29,43,68,0.06)]">
      <ul className="m-0 flex list-none flex-col gap-[7px] p-0">
        {treatments.map((treatment) => (
          <TreatmentItem
            key={treatment.id}
            treatment={treatment}
            onRemove={onRemove}
          />
        ))}
      </ul>
    </section>
  )
}

function TreatmentHistory() {
  const navigate = useNavigate()
  const [treatments, setTreatments] = useState(() => readStoredTreatments())

  const sortedTreatments = useMemo(() => treatments, [treatments])

  const updateTreatments = (nextTreatments) => {
    setTreatments(nextTreatments)
    saveTreatments(nextTreatments)
  }

  const handleAddTreatment = (treatment) => {
    updateTreatments([treatment, ...treatments])
  }

  const handleRemoveTreatment = (id) => {
    updateTreatments(treatments.filter((treatment) => treatment.id !== id))
  }

  return (
    <div className={stageClass}>
      <section className={screenClass}>
        <div className="h-full overflow-x-hidden overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <StatusBar className="bg-white" />

          <header className="relative flex h-[60px] items-center justify-center bg-white">
            <button
              className="absolute left-[24px] top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center border-0 bg-transparent p-0 text-[#1D2B44]"
              type="button"
              aria-label="뒤로가기"
              onClick={() => navigate('/mypage')}
            >
              <BackIcon />
            </button>
            <h1
              className={`m-0 text-center text-[16px] font-bold leading-[24px] tracking-[-0.4px] text-[#1D2B44] ${headingFontClass}`}
            >
              나의 시술 이력
            </h1>
          </header>

          <main className="min-h-[752px] bg-[#f5f7fb] px-[22px] pb-[80px] pt-[28px] max-[380px]:px-[18px]">
            <TreatmentForm onAdd={handleAddTreatment} />

            <h2
              className={`mb-[10px] mt-[24px] text-[17px] font-bold leading-6 tracking-[-0.4px] text-[#1D2B44] ${headingFontClass}`}
            >
              등록된 시술 이력
            </h2>

            <TreatmentList
              treatments={sortedTreatments}
              onRemove={handleRemoveTreatment}
            />
          </main>
        </div>
      </section>
    </div>
  )
}

export default TreatmentHistory
