import { useState } from 'react'
import UvChart from './UvChart.jsx'

const headingFontClass =
  "font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"

const LEVEL = {
  DANGER: { text: '위험', color: '#b55454', bg: '#fdf0f0' },
  CAUTION: { text: '주의', color: '#f5a623', bg: '#fef7e6' },
  SAFE: { text: '안전', color: '#3f8ae1', bg: '#eef4fd' },
  INDOOR: { text: '실내', color: '#8a9eb8', bg: '#f1f3f5' },
}

function DayUvCard({ info }) {
  const [outing, setOuting] = useState(info.isOuting)
  const level = LEVEL[info.riskLevel]

  return (
    <section className={`mx-[14px] mt-[12px] px-[19px] py-[25px] ${headingFontClass}`}>
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[14px] leading-[15px] font-[590] tracking-[-1px] text-[#8a9eb8]">
            {info.displayDate}
            {info.timeDifference && <span> · {info.timeDifference}</span>}
          </p>
          <p className="pt-[12px] text-[24px] leading-[21.25px] font-[860] tracking-[-0.68px] text-[#1d2b44]">
            {info.cityName}
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-[6px] rounded-full bg-[#f1f3f5] px-[10px] py-[5px]"
          onClick={() => setOuting(!outing)}
        >
          <span className="text-[11px] leading-[16.5px] font-bold tracking-[-0.64px] text-[#f5a623]">
            외출
          </span>
          <span
            className={`relative h-[18px] w-[32px] rounded-full ${
              outing ? 'bg-[#f5a623]' : 'bg-[#c9d0d8]'
            }`}
          >
            <span
              className={`absolute top-[2px] size-[14px] rounded-full bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.18)] transition-[left] ${
                outing ? 'left-[14px]' : 'left-[2px]'
              }`}
            />
          </span>
        </button>
      </div>

      {/* 그래프 */}
      <p className="pt-[14px] pl-[4px] text-[12px] leading-[15px] font-[590] tracking-[-1px] text-[#8a9eb8]">
        자외선 그래프
      </p>

      <div className="mt-[7px] rounded-[20px] bg-white pt-[16px] pb-[21px] drop-shadow-[0px_4px_9px_rgba(29,43,68,0.06)]">
        <UvChart graph={info.uvDetail.graph} level={info.riskLevel} />
      </div>

      {/* 권장사항 */}
      <div
        className="mt-[12px] flex items-center gap-[10px] rounded-[12px] px-[14px] py-[11px]"
        style={{ backgroundColor: level.bg }}
      >
        <span
          className="rounded-full border-[1.8px] px-[9.8px] py-[3.8px] text-[11px] leading-[16.5px] font-[1000] tracking-[-0.64px]"
          style={{ borderColor: level.color, color: level.color }}
        >
          {level.text}
        </span>
        <p
          className="text-[13px] leading-[18px] font-bold tracking-[-1px]"
          style={{ color: level.color }}
        >
          {info.uvDetail.warningMessage}
        </p>
      </div>
    </section>
  )
}

export default DayUvCard