import arrowLeftIcon from '../assets/icons/arrow-left.svg'
import arrowRightIcon from '../assets/icons/arrow-right.svg'
import moonIcon from '../assets/solution/moon.svg'
import planeIcon from '../assets/solution/plane.svg'
import sunIcon from '../assets/solution/sun.svg'
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
    <li className="grid min-h-[80px] grid-cols-[61px_minmax(0,1fr)] items-center rounded-[12px] border border-[#E8EDF4] bg-[#F7F9FC] px-[14px] py-[10px]">
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
          className={`block truncate text-[14px] font-bold leading-[18px] tracking-[-0.64px] text-[#1D2B44] ${headingFontClass}`}
        >
          {solution.title}
        </strong>
        <p
          className={`m-0 mt-[6px] truncate text-[13px] font-normal leading-[16.5px] tracking-[-1px] text-[#8A9EB8] ${headingFontClass}`}
        >
          {solution.description}
        </p>
      </div>
    </li>
  )
}

function SolutionList({ solutions, selectedProductName }) {
  return (
    <section className="mt-[14px] rounded-[16px] bg-white px-[14px] pb-[18px] pt-[20px] shadow-[0_4px_18px_0_rgba(29,43,68,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <div className="ml-[4px] mt-[4px]">
          <h2
            className="m-0 text-[17px] font-bold uppercase leading-[15px] tracking-[-1.4px] text-[#1D2B44]"
            style={{ fontFamily: '"SF Pro", "SF_Pro", Arial, sans-serif' }}
          >
            오늘의 솔루션
          </h2>
          <p
            className={`m-0 mt-[7px] text-[10px] font-[510] leading-[15px] tracking-[-0.64px] text-[#8A9EB8] ${headingFontClass}`}
          >
            - {selectedProductName}
          </p>
        </div>

        <div className="flex gap-[6px]" aria-hidden="true">
          <img className="h-[30px] w-[30px] object-contain" src={arrowLeftIcon} alt="" />
          <img className="h-[30px] w-[30px] object-contain" src={arrowRightIcon} alt="" />
        </div>
      </div>

      <ul className="m-0 mt-[14px] flex list-none flex-col gap-[8px] p-0">
        {solutions.map((solution) => (
          <SolutionItem key={solution.id} solution={solution} />
        ))}
      </ul>
    </section>
  )
}

export default SolutionList
