import moonIcon from '../assets/solution/moon.svg'
import planeIcon from '../assets/solution/plane.svg'
import sunIcon from '../assets/solution/sun.svg'
import HomeEmptyState from './HomeEmptyState.jsx'
import { headingFontClass } from './homeStyles.js'

function SolutionIcon({ type }) {
  const iconSrc = type === 'plane' ? planeIcon : type === 'moon' ? moonIcon : sunIcon

  return (
    <span className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white">
      <img className="h-[21px] w-[21px] object-contain" src={iconSrc} alt="" aria-hidden="true" />
    </span>
  )
}

function SolutionItem({ solution }) {
  return (
    <li className="grid min-h-[80px] grid-cols-[61px_minmax(0,1fr)] items-center rounded-[12px] border border-[#E8EDF4] bg-[#F7F9FC] px-[14px] py-[12px]">
      <div className="flex flex-col items-center gap-[4px] border-r border-[#E3E9F1] pr-[12px]">
        <SolutionIcon type={solution.icon} />
        <span
          className={`whitespace-nowrap text-[10px] font-bold leading-[15px] tracking-[-0.64px] text-[#8A9EB8] ${headingFontClass}`}
        >
          {solution.timing}
        </span>
      </div>

      <div className="min-w-0 pl-[14px]">
        <strong
          className={`block break-keep text-[14px] font-bold leading-[18px] tracking-[-0.64px] text-[#1D2B44] ${headingFontClass}`}
        >
          {solution.title}
        </strong>
        <p
          className={`m-0 mt-[6px] break-keep text-[13px] font-normal leading-[16.5px] tracking-[-1px] text-[#8A9EB8] ${headingFontClass}`}
        >
          {solution.description}
        </p>
      </div>
    </li>
  )
}

function SolutionNavButton({ direction, active, label, onClick }) {
  const isPrevious = direction === 'previous'

  return (
    <button
      className={`flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border-[1.276px] p-0 transition-colors ${
        active
          ? 'cursor-pointer border-[#E8EDF4] bg-white'
          : 'cursor-default border-[#F0F2F6] bg-[#F0F2F6]'
      }`}
      type="button"
      aria-label={label}
      disabled={!active}
      onClick={onClick}
    >
      <svg
        className="h-[12px] w-[8px]"
        viewBox="0 0 8 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d={isPrevious ? 'M6.5 1L1.5 6L6.5 11' : 'M1.5 1L6.5 6L1.5 11'}
          stroke={active ? '#1D2B44' : '#A8B8CC'}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

function SolutionList({
  solutions,
  title = '오늘의 솔루션',
  selectedProductName,
  onPrevious,
  onNext,
  canNavigate = true,
  canGoPrevious = canNavigate,
  canGoNext = canNavigate,
  empty = false,
  emptyMessage,
  hideRegisterButton = false,
  onRegisterSunscreen,
}) {
  return (
    <section className="mt-[14px] rounded-[16px] bg-white px-[20px] pb-[18px] pt-[24px] shadow-[0_4px_18px_0_rgba(29,43,68,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2
            className="m-0 text-[17px] font-bold uppercase leading-[15px] tracking-[-1.4px] text-[#1D2B44]"
            style={{ fontFamily: '"SF Pro", "SF_Pro", Arial, sans-serif' }}
          >
            {title}
          </h2>
          {!empty && (
            <p
              className={`m-0 mt-[7px] text-[10px] font-[510] leading-[15px] tracking-[-0.64px] text-[#8A9EB8] ${headingFontClass}`}
            >
              - {selectedProductName}
            </p>
          )}
        </div>

        <div className="flex gap-[6px]">
          <SolutionNavButton
            direction="previous"
            active={canGoPrevious}
            label="이전 솔루션 보기"
            onClick={onPrevious}
          />
          <SolutionNavButton
            direction="next"
            active={canGoNext}
            label="다음 솔루션 보기"
            onClick={onNext}
          />
        </div>
      </div>

      {empty ? (
        <div className="flex min-h-[128px] items-center justify-center">
          <HomeEmptyState
            onRegister={hideRegisterButton ? undefined : onRegisterSunscreen}
            message={emptyMessage}
          />
        </div>
      ) : (
        <ul className="m-0 mt-[14px] flex list-none flex-col gap-[8px] p-0">
          {solutions.map((solution) => (
            <SolutionItem key={solution.id} solution={solution} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default SolutionList
