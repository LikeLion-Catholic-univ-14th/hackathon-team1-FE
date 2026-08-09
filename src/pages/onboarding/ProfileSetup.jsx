import { useState } from 'react'
import OnboardingStatusBar from './components/OnboardingStatusBar.jsx'
import './onboarding.css'

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

function OptionButton({ children, selected = false, onClick }) {
  return (
    <button
      className={`profile-option${selected ? ' is-selected' : ''}`}
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
    <form className="profile-card">
      <div className="profile-field profile-field--name">
        <label className="profile-label" htmlFor="profile-name">
          이름
        </label>
        <input
          className={`profile-name-input${profile.name ? ' has-value' : ''}`}
          id="profile-name"
          type="text"
          value={profile.name}
          placeholder={isNameFocused ? '' : '홍길동'}
          onFocus={() => setIsNameFocused(true)}
          onBlur={() => setIsNameFocused(false)}
          onChange={(event) => onNameChange(event.target.value)}
        />
      </div>

      <div className="profile-field">
        <p className="profile-label">베이스 공항</p>
        <div className="profile-options profile-options--airport">
          {baseAirports.map((airport) => (
            <OptionButton
              key={airport}
              selected={profile.baseAirport === airport}
              onClick={() => onSelectSingle('baseAirport', airport)}
            >
              {airport}
            </OptionButton>
          ))}
        </div>
      </div>

      <div className="profile-field">
        <p className="profile-label">피부 타입</p>
        <div className="profile-options profile-options--wrap profile-options--skin-type">
          {skinTypes.map((type) => (
            <OptionButton
              key={type}
              selected={profile.skinType === type}
              onClick={() => onSelectSingle('skinType', type)}
            >
              {type}
            </OptionButton>
          ))}
        </div>
      </div>

      <div className="profile-field">
        <p className="profile-label">피부 고민</p>
        <div className="profile-options profile-options--wrap">
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

      <div className="profile-field">
        <p className="profile-label">시술 이력</p>
        <div className="profile-options">
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
        <div className="profile-treatment">
          <input
            className={`profile-treatment__input${
              profile.treatmentDetail ? ' has-value' : ''
            }`}
            type="text"
            value={profile.treatmentDetail}
            placeholder="어떤 시술을 받으셨나요?"
            onChange={(event) =>
              onSelectSingle('treatmentDetail', event.target.value, true)
            }
          />
          <label className="profile-treatment__check">
            <input
              type="checkbox"
              checked={profile.recentTreatment}
              onChange={(event) =>
                onSelectSingle('recentTreatment', event.target.checked, true)
              }
            />
            최근 한 달 내
          </label>
        </div>
      )}

      <button
        className="profile-submit"
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
    <div className="onboarding-stage">
      <section className="onboarding-screen profile-setup">
        <OnboardingStatusBar />

        <div className="profile-setup__content">
          <header className="profile-setup__header">
            <h1 className="profile-setup__title">
              반가워요!
              <br />
              프로필을 만들어볼까요?
            </h1>

            <div
              className="onboarding-progress"
              aria-label="온보딩 진행 단계"
            >
              {Array.from({ length: 3 }, (_, index) => (
                <span
                  className={`onboarding-progress__item${
                    index === 0 ? ' is-active' : ''
                  }`}
                  key={index}
                  aria-hidden="true"
                />
              ))}
            </div>
          </header>

          <div className="profile-carousel">
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
