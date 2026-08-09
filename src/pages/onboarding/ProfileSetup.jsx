import { useState } from 'react'
import OnboardingStatusBar from './components/OnboardingStatusBar.jsx'

const baseAirports = ['인천', '김포']
const skinTypes = ['건성', '지성', '복합성', '수부지', '민감성']
const skinConcerns = ['기미', '잡티', '여드름', '홍조', '건조']
const treatmentHistory = ['없음', '있음']
const emptyProfile = {
  name: '',
  baseAirport: '',
  skinType: '',
  skinConcerns: [],
  treatmentHistory: '',
  treatmentDetail: '',
  recentTreatment: false,
}

const stageClass =
  'flex min-h-svh w-full items-start justify-center bg-[#bdbdbd] p-6 max-[520px]:bg-[#f5f7fb] max-[520px]:p-0'
const screenClass =
  'h-[874px] min-h-[874px] w-[402px] overflow-x-hidden overflow-y-auto bg-[#f5f7fb] text-left font-[Arial,sans-serif] text-[15px] font-normal leading-normal tracking-[0] text-[#1d2b45] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[520px]:h-svh max-[520px]:min-h-svh max-[520px]:w-full'
const headingFontClass =
  "font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"
const profileLabelClass = `mb-2 block text-[14px] font-bold leading-[15px] text-[#8a9eb8] ${headingFontClass}`
const profileOptionBaseClass = `box-border flex h-[39px] min-w-0 cursor-pointer flex-row items-center justify-center whitespace-nowrap rounded-full border-[1.276px] px-[11px] py-[9px] text-[13px] font-bold leading-[15px] transition-colors ${headingFontClass}`

function OptionButton({ children, selected = false, className = '', onClick }) {
  return (
    <button
      className={`${profileOptionBaseClass} ${className} ${
        selected
          ? 'border-[#f6a51a] bg-[#fff8eb] text-[#f6a51a]'
          : 'border-[#eceef2] bg-white text-[#8a9eb8]'
      }`}
      type="button"
      aria-pressed={selected}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function ProfileCard({
  profile,
  isComplete,
  onNameChange,
  onSelectSingle,
  onToggleConcern,
  onSubmit,
}) {
  const [isNameFocused, setIsNameFocused] = useState(false)
  const shouldShowTreatmentInput = profile.treatmentHistory === '있음'

  return (
    <form className="box-border w-full rounded-[22px] bg-white px-[22px] pb-[18px] pt-6 shadow-[0_4px_18px_0_rgba(29,43,68,0.06)] max-[380px]:px-4">
      <div className="mb-[23px]">
        <label className={profileLabelClass} htmlFor="profile-name">
          이름
        </label>
        <input
          className={`box-border h-[34px] w-full rounded-none border-0 border-b-[1.276px] bg-transparent px-0 pb-4 font-[Arial,sans-serif] text-[15px] font-normal leading-normal tracking-[-0.64px] text-[#1d2b44] outline-none placeholder:text-[rgba(29,43,68,0.5)] focus:border-[#f6a51a] ${
            profile.name ? 'border-[#f6a51a]' : 'border-[#eceef2]'
          }`}
          id="profile-name"
          type="text"
          value={profile.name}
          placeholder={isNameFocused ? '' : '홍길동'}
          onFocus={() => setIsNameFocused(true)}
          onBlur={() => setIsNameFocused(false)}
          onChange={(event) => onNameChange(event.target.value)}
        />
      </div>

      <div className="mb-5">
        <p className={profileLabelClass}>베이스 공항</p>
        <div className="flex items-center gap-[10px]">
          {baseAirports.map((airport) => (
            <OptionButton
              className="h-10 px-[18px] max-[380px]:px-4"
              key={airport}
              selected={profile.baseAirport === airport}
              onClick={() => onSelectSingle('baseAirport', airport)}
            >
              {airport}
            </OptionButton>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className={profileLabelClass}>피부 타입</p>
        <div className="flex flex-nowrap items-center gap-[5px] max-[380px]:gap-1">
          {skinTypes.map((type) => (
            <OptionButton
              className="h-[37px] px-[11px] text-[13px] leading-[15px] max-[380px]:px-[7px] max-[380px]:text-[12px]"
              key={type}
              selected={profile.skinType === type}
              onClick={() => onSelectSingle('skinType', type)}
            >
              {type}
            </OptionButton>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className={profileLabelClass}>피부 고민</p>
        <div className="flex flex-wrap items-center gap-2">
          {skinConcerns.map((concern) => (
            <OptionButton
              key={concern}
              selected={profile.skinConcerns.includes(concern)}
              onClick={() => onToggleConcern(concern)}
            >
              {concern}
            </OptionButton>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className={profileLabelClass}>시술 이력</p>
        <div className="flex items-center gap-2">
          {treatmentHistory.map((history) => (
            <OptionButton
              key={history}
              selected={profile.treatmentHistory === history}
              onClick={() => onSelectSingle('treatmentHistory', history)}
            >
              {history}
            </OptionButton>
          ))}
        </div>
      </div>

      {shouldShowTreatmentInput && (
        <div className="-mt-[3px] mb-[18px] grid grid-cols-[minmax(0,1fr)_max-content] items-center gap-x-3 overflow-visible">
          <input
            className={`box-border h-[46px] min-w-0 flex-1 rounded-xl border-[1.276px] bg-[#f7f8fb] px-4 font-[Arial,sans-serif] text-[15px] font-normal leading-normal tracking-[-0.64px] text-[#1d2b44] outline-none placeholder:text-[rgba(29,43,68,0.4)] focus:border-[#f5a623] focus:shadow-none ${
              profile.treatmentDetail ? 'border-[#f5a623]' : 'border-[#eceef2]'
            }`}
            type="text"
            value={profile.treatmentDetail}
            placeholder="어떤 시술을 받으셨나요?"
            onChange={(event) =>
              onSelectSingle('treatmentDetail', event.target.value, true)
            }
          />
          <label
            className={`inline-flex min-w-max items-center gap-2 overflow-visible whitespace-nowrap text-[12px] font-[590] leading-[18px] tracking-[-0.64px] text-[#3a506b] ${headingFontClass}`}
          >
            <input
              className="peer sr-only"
              type="checkbox"
              checked={profile.recentTreatment}
              onChange={(event) =>
                onSelectSingle('recentTreatment', event.target.checked, true)
              }
            />
            <span
              className="h-[18px] w-[18px] shrink-0 rounded-[20px] border-[1.276px] border-[#eceef2] bg-white shadow-[0_2px_6px_0_rgba(29,43,68,0.04)] peer-checked:border-[#f5a623] peer-checked:bg-[#f5a623] peer-checked:shadow-none"
              aria-hidden="true"
            />
            최근 한 달 내
          </label>
        </div>
      )}

      <button
        className={`box-border flex h-[53px] w-full items-center justify-center gap-[10px] rounded-2xl border-0 px-0 py-[15px] text-[15px] font-bold leading-[23px] ${headingFontClass} ${
          isComplete
            ? 'cursor-pointer bg-[#f5a623] text-white shadow-[0_4px_12px_0_rgba(245,166,35,0.32)]'
            : 'cursor-default bg-[#f0f2f6] text-[#91a4bf]'
        }`}
        type="button"
        disabled={!isComplete}
        onClick={onSubmit}
      >
        저장하고 계속
      </button>
    </form>
  )
}

function ProfileSetup({ value, onChange, onComplete }) {
  const [localProfile, setLocalProfile] = useState(emptyProfile)
  const profile = value ?? localProfile

  const updateProfile = (updater) => {
    const nextProfile =
      typeof updater === 'function' ? updater(profile) : updater

    if (value === undefined) {
      setLocalProfile(nextProfile)
    }

    onChange?.(nextProfile)
  }

  const isComplete = Boolean(
    profile.baseAirport &&
      profile.skinType &&
      profile.skinConcerns.length > 0 &&
      profile.treatmentHistory &&
      (profile.treatmentHistory !== '있음' || profile.treatmentDetail.trim()),
  )

  const handleSubmit = () => {
    if (!isComplete) {
      return
    }

    onComplete?.({
      ...profile,
      name: profile.name.trim() || '홍길동',
    })
  }

  const selectSingleValue = (field, value, keepSameValue = false) => {
    updateProfile((prevProfile) => ({
      ...prevProfile,
      [field]:
        !keepSameValue && prevProfile[field] === value && typeof value === 'string'
          ? ''
          : value,
    }))
  }

  const toggleConcern = (concern) => {
    updateProfile((prevProfile) => {
      const hasConcern = prevProfile.skinConcerns.includes(concern)

      return {
        ...prevProfile,
        skinConcerns: hasConcern
          ? prevProfile.skinConcerns.filter((item) => item !== concern)
          : [...prevProfile.skinConcerns, concern],
      }
    })
  }

  return (
    <div className={stageClass}>
      <section className={screenClass}>
        <OnboardingStatusBar />

        <div className="px-6 pb-[42px] pt-[64px] max-[380px]:px-4 max-[380px]:pt-10">
          <header className="mx-[15px]">
            <h1
              className={`m-0 text-[28px] font-bold leading-9 tracking-[-1px] text-[#1d2b44] ${headingFontClass}`}
            >
              반가워요!
              <br />
              프로필을 만들어볼까요?
            </h1>

            <div
              className="mt-[29px] flex items-center justify-center gap-[5px]"
              aria-label="온보딩 진행 단계"
            >
              {Array.from({ length: 3 }, (_, index) => (
                <span
                  className={`h-[6px] shrink-0 rounded-full border-0 p-0 transition-[width,background-color] ${
                    index === 0
                      ? 'w-5 bg-[#f6a51a]'
                      : 'w-[6px] bg-[#edf1f6]'
                  }`}
                  key={index}
                  aria-hidden="true"
                />
              ))}
            </div>
          </header>

          <div className="-mx-[10px] mt-7 overflow-visible px-[10px] pb-[18px]">
            <ProfileCard
              profile={profile}
              isComplete={isComplete}
              onNameChange={(name) =>
                updateProfile((prevProfile) => ({
                  ...prevProfile,
                  name,
                }))
              }
              onSelectSingle={selectSingleValue}
              onToggleConcern={toggleConcern}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProfileSetup
