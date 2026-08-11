import checkActiveIcon from '../assets/solution/check-active.svg'
import checkInactiveIcon from '../assets/solution/check-inactive.svg'
import { headingFontClass } from './homeStyles.js'

function CheckMark({ selected }) {
  return (
    <img
      className="absolute right-[7px] top-[7px] h-[21px] w-[21px] object-contain"
      src={selected ? checkActiveIcon : checkInactiveIcon}
      alt=""
      aria-hidden="true"
    />
  )
}

function SunscreenCard({ sunscreen, selected, onSelect }) {
  return (
    <button
      className={`relative flex h-[164px] min-w-[102px] flex-1 flex-col items-center rounded-[16px] border-[1.276px] px-[6px] pb-[12px] pt-[33px] text-left transition-colors ${
        selected
          ? 'border-[#F5A623] bg-[#FFFBF2]'
          : 'border-[#eef2f7] bg-[#F5F7FB]'
      }`}
      type="button"
      onClick={() => onSelect(sunscreen.id)}
      aria-pressed={selected}
    >
      <CheckMark selected={selected} />

      <span className="flex h-[40px] w-[40px] items-center justify-center rounded-[10px] bg-white shadow-[0_6px_16px_0_rgba(29,43,68,0.08)]">
        <img
          className="h-[20px] w-[20px] object-contain"
          src={sunscreen.icon}
          alt=""
          aria-hidden="true"
        />
      </span>

      <strong
        className={`mt-[11px] w-full truncate text-center text-[14px] font-bold leading-[18px] tracking-[-0.64px] text-[#1d2b44] ${headingFontClass}`}
      >
        {sunscreen.name}
      </strong>
      <span
        className={`mt-[3px] w-full truncate text-center text-[10px] font-[510] leading-[15px] tracking-[-0.64px] text-[#8A9EB8] ${headingFontClass}`}
      >
        {sunscreen.type}, {sunscreen.method}
      </span>

      {sunscreen.recommended && (
        <span
          className={`mt-[5px] text-[11px] font-bold leading-[16.5px] tracking-[-0.64px] text-[#F5A623] ${headingFontClass}`}
        >
          ★추천
        </span>
      )}
    </button>
  )
}

function SunscreenTip({ tip }) {
  return (
    <div className="mt-[14px] rounded-[16px] bg-[#E8F3FF] px-[14px] pb-[18px] pt-[14px]">
      <div className="flex gap-[8px]">
        {tip.tags.map((tag) => (
          <span
            className={`inline-flex h-[22px] items-center justify-center rounded-full border-[1.276px] border-[#C5DEFF] bg-white px-[8px] pb-0 pt-0 text-[11px] font-bold leading-[16.5px] tracking-[-0.64px] text-[#5C9CE6] ${headingFontClass}`}
            key={tag}
          >
            {tag}
          </span>
        ))}
      </div>
      <p
        className={`m-0 mt-[8px] text-[14px] font-bold leading-[18px] tracking-[-0.64px] text-[#3A506B] ${headingFontClass}`}
      >
        {tip.text}
      </p>
    </div>
  )
}

function SunscreenSection({ sunscreens, tip, selectedId, onSelect }) {
  return (
    <section className="mt-[14px] rounded-[16px] bg-white px-[14px] pb-[18px] pt-[14px] shadow-[0_4px_18px_0_rgba(29,43,68,0.06)]">
      <h2
        className={`m-0 text-[17px] font-bold uppercase leading-[15px] tracking-[-1.4px] text-[#1D2B44] ${headingFontClass}`}
      >
        오늘의 자외선 차단제
      </h2>

      <div className="mt-[16px] flex gap-[12px] overflow-x-auto pb-[2px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sunscreens.map((sunscreen) => (
          <SunscreenCard
            key={sunscreen.id}
            sunscreen={sunscreen}
            selected={sunscreen.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>

      <SunscreenTip tip={tip} />
    </section>
  )
}

export default SunscreenSection
