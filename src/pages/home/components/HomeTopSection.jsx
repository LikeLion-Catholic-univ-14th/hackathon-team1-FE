import locationIcon from '../assets/icons/location.svg'
import timeIcon from '../assets/icons/time.svg'
import { headingFontClass } from './homeStyles.js'

function ModeToggle({ isOutdoor, onToggle }) {
  return (
    <div
      className={`inline-flex h-[38px] shrink-0 -translate-y-[6px] items-center gap-[8px] rounded-[99px] px-[14px] text-[13px] font-bold leading-[19.5px] tracking-[-0.64px] ${headingFontClass} ${
        isOutdoor
          ? 'bg-[#2E4865] text-white shadow-[0_2px_3px_0_rgba(0,0,0,0.25)]'
          : 'bg-[#F1F3F5] text-[#F5A623]'
      }`}
    >
      <span className="select-none">외출</span>
      <button
        className={`flex h-[22px] w-[38px] shrink-0 items-center rounded-[99px] border-0 px-[4px] py-[3px] transition-colors ${
          isOutdoor
            ? 'justify-start bg-[#ECEEF2]'
            : 'justify-end bg-[#F5A623] shadow-[0_3px_10px_0_rgba(245,166,35,0.35)]'
        }`}
        type="button"
        aria-label={isOutdoor ? '외출 모드 끄기' : '외출 모드 켜기'}
        aria-pressed={isOutdoor}
        onClick={onToggle}
      >
        <span
          className="h-[16px] w-[16px] rounded-[8px] bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.2)]"
        />
      </button>
    </div>
  )
}

function LocationTimePill({ user, dark = false }) {
  const [timePrefix, ...timeParts] = user.currentTime.split(' ')
  const timeValue = timeParts.join(' ')

  return (
    <div
      className={`inline-flex min-h-[32px] items-center gap-[8px] rounded-[99px] px-[14px] py-[7px] ${headingFontClass} ${
        dark ? 'bg-[#315273]' : 'bg-[#E8F3FF]'
      }`}
    >
      <span className="inline-flex items-center gap-[5px]">
        <img
          className="h-[12px] w-[8px] object-contain"
          src={locationIcon}
          alt=""
          aria-hidden="true"
        />
        <span
          className={`text-[12px] font-bold leading-[18px] tracking-[-0.64px] ${
            dark ? 'text-white' : 'text-[#1D2B44]'
          }`}
        >
          {user.location}
        </span>
      </span>

      <span className="h-[13px] w-px bg-[#C7D7EA]" aria-hidden="true" />

      <span className="inline-flex items-center gap-[5px]">
        <img
          className="h-[13px] w-[13px] object-contain"
          src={timeIcon}
          alt=""
          aria-hidden="true"
        />
        <span
          className={`text-[12px] font-normal leading-[18px] tracking-[-0.64px] ${
            dark ? 'text-[#BFD1E3]' : 'text-[#8A9EB8]'
          }`}
        >
          {timePrefix}
        </span>
        <span
          className={`text-[12px] font-bold leading-[18px] tracking-[-0.64px] ${
            dark ? 'text-white' : 'text-[#3A506B]'
          }`}
        >
          {timeValue}
        </span>
      </span>
    </div>
  )
}

function HomeTopSection({ user, isOutdoor, onToggleOutdoor }) {
  return (
    <section
      className={`px-6 pb-[16px] pt-[8px] ${isOutdoor ? 'bg-[#284663]' : 'bg-white'}`}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p
            className={`m-0 text-[13px] font-normal leading-[18px] tracking-[-0.64px] ${
              isOutdoor ? 'text-[#9eb6cf]' : 'text-[#8A9EB8]'
            } ${headingFontClass}`}
          >
            {user.date}
          </p>
          <h1
            className={`m-0 mt-[2px] text-[22px] font-bold leading-[30px] tracking-[-0.8px] ${
              isOutdoor ? 'text-white' : 'text-[#1d2b44]'
            } ${headingFontClass}`}
          >
            안녕하세요, {user.name} 님
          </h1>
        </div>

        <ModeToggle isOutdoor={isOutdoor} onToggle={onToggleOutdoor} />
      </div>

      <div className="mt-[10px] flex">
        <LocationTimePill user={user} dark={isOutdoor} />
      </div>
    </section>
  )
}

export default HomeTopSection
