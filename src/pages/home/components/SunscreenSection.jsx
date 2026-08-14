import { useCallback, useEffect, useRef } from 'react'
import checkActiveIcon from '../assets/solution/check-active.svg'
import checkInactiveIcon from '../assets/solution/check-inactive.svg'
import HomeEmptyState from './HomeEmptyState.jsx'
import { headingFontClass } from './homeStyles.js'

const sunscreenCardSizeStyle = {
  width: 'calc((100% - 24px) / 3)',
  minWidth: 'calc((100% - 24px) / 3)',
  maxWidth: 'calc((100% - 24px) / 3)',
  scrollSnapAlign: 'start',
}

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
      className={`relative flex min-h-[164px] flex-none flex-col items-center rounded-[16px] border-[1.276px] px-[6px] pb-[12px] pt-[33px] text-left transition-colors ${
        selected
          ? 'border-[#F5A623] bg-[#FFFBF2]'
          : 'border-[#eef2f7] bg-[#F5F7FB]'
      }`}
      style={sunscreenCardSizeStyle}
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
        className={`mt-[11px] w-full overflow-hidden break-keep text-center text-[14px] font-bold leading-[18px] tracking-[-0.64px] text-[#1d2b44] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [overflow-wrap:anywhere] ${headingFontClass}`}
      >
        {sunscreen.name}
      </strong>
      <span
        className={`mt-[3px] w-full break-keep text-center text-[10px] font-[510] leading-[15px] tracking-[-0.64px] text-[#8A9EB8] [overflow-wrap:anywhere] ${headingFontClass}`}
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

function PlaceholderSunscreenCard() {
  return (
    <div
      className="min-h-[164px] flex-none rounded-[16px] border-[1.276px] border-[#eef2f7] bg-[#F5F7FB]"
      style={sunscreenCardSizeStyle}
      aria-hidden="true"
    />
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

function SunscreenSection({
  sunscreens,
  tip,
  selectedId,
  onSelect,
  empty = false,
  onRegisterSunscreen,
}) {
  const scrollRef = useRef(null)
  const dragStateRef = useRef({
    active: false,
    dragged: false,
    scrollLeft: 0,
    startX: 0,
  })
  const placeholderCount =
    empty || sunscreens.length >= 3 ? 0 : Math.max(0, 3 - sunscreens.length)

  const handlePointerDown = (event) => {
    const scrollElement = scrollRef.current

    if (!scrollElement) {
      return
    }

    dragStateRef.current = {
      active: true,
      dragged: false,
      scrollLeft: scrollElement.scrollLeft,
      startX: event.clientX,
    }
  }

  const handlePointerMove = useCallback((event) => {
    const scrollElement = scrollRef.current
    const dragState = dragStateRef.current

    if (!scrollElement || !dragState.active) {
      return
    }

    const deltaX = event.clientX - dragState.startX

    if (Math.abs(deltaX) > 4) {
      dragState.dragged = true
    }

    if (dragState.dragged) {
      scrollElement.scrollLeft = dragState.scrollLeft - deltaX
    }
  }, [])

  const endPointerDrag = useCallback(() => {
    const dragState = dragStateRef.current

    if (!dragState.active) {
      return
    }

    dragState.active = false
  }, [])

  useEffect(() => {
    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', endPointerDrag)
    document.addEventListener('pointercancel', endPointerDrag)

    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', endPointerDrag)
      document.removeEventListener('pointercancel', endPointerDrag)
    }
  }, [handlePointerMove, endPointerDrag])

  const handleClickCapture = (event) => {
    if (!dragStateRef.current.dragged) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    dragStateRef.current.dragged = false
  }

  return (
    <section className="mt-[14px] rounded-[16px] bg-white px-[20px] pb-[18px] pt-[24px] shadow-[0_4px_18px_0_rgba(29,43,68,0.06)]">
      <h2
        className={`m-0 text-[17px] font-bold uppercase leading-[15px] tracking-[-1.4px] text-[#1D2B44] ${headingFontClass}`}
      >
        오늘의 자외선 차단제
      </h2>

      {empty ? (
        <div className="flex min-h-[130px] items-center justify-center">
          <HomeEmptyState onRegister={onRegisterSunscreen} />
        </div>
      ) : (
        <>
          <div
            ref={scrollRef}
            className="mt-[16px] flex touch-pan-x snap-x select-none items-stretch gap-[12px] overflow-x-auto pb-[2px] [cursor:grab] active:[cursor:grabbing] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onClickCapture={handleClickCapture}
            onPointerDown={handlePointerDown}
          >
            {sunscreens.map((sunscreen) => (
              <SunscreenCard
                key={sunscreen.id}
                sunscreen={sunscreen}
                selected={sunscreen.id === selectedId}
                onSelect={onSelect}
              />
            ))}
            {Array.from({ length: placeholderCount }).map((_, index) => (
              <PlaceholderSunscreenCard key={`sunscreen-placeholder-${index}`} />
            ))}
          </div>

          <SunscreenTip tip={tip} />
        </>
      )}
    </section>
  )
}

export default SunscreenSection
