import UvGraph from './UvGraph.jsx'
import { headingFontClass } from './homeStyles.js'
import chevronDownIcon from '../assets/icons/chevron-down.svg'
import uvRingIcon from '../assets/icons/ring.svg'

function UvBadge({ children, isOutdoor }) {
  return (
    <span
      className={`inline-flex h-[27px] items-center rounded-full px-[13px] text-[13px] font-bold leading-[16.5px] tracking-[-0.64px] ${headingFontClass} ${
        isOutdoor ? 'bg-white/18 text-white' : 'bg-white/25 text-white'
      }`}
    >
      {children}
    </span>
  )
}

function UvRing({ value }) {
  return (
    <div
      className="absolute right-[20px] top-[24px] flex h-[76px] w-[76px] items-center justify-center"
      aria-label={`자외선 지수 ${value}`}
    >
      <img className="absolute inset-0 h-full w-full" src={uvRingIcon} alt="" aria-hidden="true" />
      <div className={`relative text-center ${headingFontClass}`}>
        <span className="block text-[10px] font-bold leading-[12px] tracking-[-0.64px] text-white/75">
          UV
        </span>
        <strong
          className="block text-[24px] font-[900] leading-[20px] tracking-[-0.64px] text-white"
          style={{ fontFamily: '"SF Pro Rounded", "SF Pro", Arial, sans-serif' }}
        >
          {value}
        </strong>
      </div>
    </div>
  )
}

function ComparisonText({ text }) {
  const match = text.match(/^(.*?)(\d+(?:\.\d+)?배)$/)

  if (!match) {
    return (
      <strong
        className={`mt-[3px] block text-[20px] font-[1000] leading-[24.3px] tracking-[-0.72px] text-white ${headingFontClass}`}
      >
        {text}
      </strong>
    )
  }

  return (
    <strong
      className={`mt-[3px] flex flex-wrap items-baseline gap-x-[3px] text-white ${headingFontClass}`}
    >
      <span className="text-[20px] font-[1000] leading-[24.3px] tracking-[-0.72px]">
        {match[1]}
      </span>
      <span className="text-[28px] font-[1000] leading-[32.4px] tracking-[-0.72px]">
        {match[2]}
      </span>
    </strong>
  )
}

function UvSummaryCard({ summary, graph, expanded, onToggleGraph, isOutdoor }) {
  return (
    <section>
      <article
        className={`relative overflow-hidden px-[20px] pb-[20px] pt-[24px] text-white ${
          isOutdoor
            ? 'rounded-[16px] bg-[linear-gradient(135deg,#3B78BE_0%,#5C98D8_100%)] shadow-[0_8px_22px_0_rgba(32,74,116,0.28)]'
            : 'rounded-[22px_22px_16px_22px] bg-[linear-gradient(135deg,#FF8C42_0%,#F5A623_49.52%,#FFD166_100%)] shadow-[0_6px_16px_-4px_rgba(245,140,50,0.28)]'
        }`}
      >
        <UvRing value={summary.value} />

        <div className="pr-[88px]">
          <p
            className={`m-0 text-[15px] font-bold uppercase leading-[15px] tracking-[-1px] text-white/75 ${headingFontClass}`}
          >
            {summary.title}
            <span className="ml-[6px] text-[12px] font-[590] leading-[15px] tracking-[-1px] text-white/55">
              · {summary.updatedAt}
            </span>
          </p>
          <h2
            className={`m-0 mt-[8px] text-[24px] font-[1000] leading-[24.3px] tracking-[-0.72px] text-white ${headingFontClass}`}
          >
            {summary.city}
          </h2>
          <ComparisonText text={summary.comparison} />
        </div>

        <div className="mt-[9px] flex flex-wrap gap-[8px]">
          {summary.badges.map((badge) => (
            <UvBadge key={badge} isOutdoor={isOutdoor}>
              {badge}
            </UvBadge>
          ))}
        </div>

        <button
          className={`mt-[17px] flex h-[37px] w-full items-center justify-center rounded-[8px] border border-white/35 bg-white/20 px-3 text-center text-[14px] font-bold leading-[18px] tracking-[-0.64px] text-white ${headingFontClass}`}
          type="button"
          onClick={onToggleGraph}
          aria-expanded={expanded}
        >
          자외선 그래프 보기
          <img
            className={`ml-[8px] h-[8px] w-[14px] transition-transform ${expanded ? 'rotate-180' : ''}`}
            src={chevronDownIcon}
            alt=""
            aria-hidden="true"
          />
        </button>
      </article>

      {expanded && !isOutdoor && <UvGraph graph={graph} />}
    </section>
  )
}

export default UvSummaryCard
