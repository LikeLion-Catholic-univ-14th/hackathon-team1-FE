import iconStrongest from '../assets/insight-strongest.svg'
import iconMissed from '../assets/insight-missed.svg'
import iconGood from '../assets/insight-good.svg'

const headingFontClass =
  "font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"

function InsightList({ analysis }) {
  const items = [
    { key: 'strongest', label: '가장 센 날', icon: iconStrongest, data: analysis.strongestDay },
    { key: 'missed', label: '놓친 날', icon: iconMissed, data: analysis.missedDays },
    { key: 'good', label: '잘한 날', icon: iconGood, data: analysis.goodDays },
  ]

  return (
    <section
      className={`mx-4 mt-3 rounded-[22px] bg-white px-[18px] py-[24px] drop-shadow-[0px_4px_9px_rgba(29,43,68,0.06)] ${headingFontClass}`}
    >
      <div className="px-[4px]">
        <div className="border-b-[0.4px] border-[rgba(138,158,184,0.6)] pb-[12px]">
          <p className="text-[14px] leading-[15px] font-[590] tracking-[-1px] text-[#8a9eb8]">
            상세 분석
          </p>
        </div>
      </div>

      <div className="pt-[4px] pl-[17px]">
        {items.map((item, index) => (
          <div
            className={`flex items-start gap-[20px] pt-[16px] ${
              index === items.length - 1
                ? 'pb-[16px]'
                : 'border-b-[1.276px] border-[#eceef2] pb-[17.276px]'
            }`}
            key={item.key}
          >
            <img className="size-[36px] shrink-0" src={item.icon} alt="" />

            <div>
              <p className="text-[16px] leading-[19.5px] font-bold tracking-[-0.64px] text-[#1d2b44]">
                {item.label} — {item.data.title}
              </p>
              <p className="pt-[2px] text-[13px] leading-[18px] tracking-[-1px] text-[#8a9eb8]">
                {item.data.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default InsightList