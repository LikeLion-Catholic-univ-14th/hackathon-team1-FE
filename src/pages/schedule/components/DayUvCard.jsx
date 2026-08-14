import UvChart from './UvChart.jsx'
import { isFuture } from '../utils/schedule.js'

const LEVEL = {
  DANGER: { text: '위험', color: '#b55454', bg: '#fdf0f0' },
  CAUTION: { text: '주의', color: '#f5a623', bg: '#fef7e6' },
  SAFE: { text: '안전', color: '#3f8ae1', bg: '#eef4fd' },
  INDOOR: { text: '실내', color: '#8a9eb8', bg: '#f1f3f5' },
}

function DayUvCard({
  date,
  info,
  outing,
  onToggle,
  canToggle = true,
  showToggle = true,
}) {
  const level = LEVEL[info.riskLevel] ?? LEVEL.CAUTION
  const showGraph = !isFuture(date)

  return (
    <section className="mx-[14px] mt-[12px] px-[19px] py-[25px]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[14px] leading-[15px] font-[590] tracking-[-1px] text-[#8a9eb8]">
            {info.displayDate}
          </p>
          <p className="pt-[12px] text-[24px] leading-[21.25px] font-[860] tracking-[-0.68px] text-[#1d2b44]">
            {info.cityName}
          </p>
        </div>

        {showToggle && (
          <button
            type="button"
            disabled={!canToggle}
            className="flex shrink-0 items-center gap-[6px] rounded-full bg-[#f1f3f5] px-[10px] py-[5px] disabled:opacity-40"
            onClick={onToggle}
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
                  outing ? 'left-[16px]' : 'left-[2px]'
                }`}
              />
            </span>
          </button>
        )}
      </div>

      {showGraph ? (
        <>
          <p className="pt-[14px] pl-[4px] text-[12px] leading-[15px] font-[590] tracking-[-1px] text-[#8a9eb8]">
            자외선 그래프
          </p>

          <div className="mt-[7px] rounded-[20px] bg-white pt-[16px] pb-[21px] drop-shadow-[0px_4px_9px_rgba(29,43,68,0.06)]">
            <UvChart graph={info.uvDetail.graph} level={info.riskLevel} />
          </div>

          <div
            className="mt-[12px] flex items-center gap-[10px] rounded-[12px] px-[14px] py-[11px]"
            style={{ backgroundColor: level.bg }}
          >
            <span
              className="shrink-0 rounded-full border-[1.8px] px-[9.8px] py-[3.8px] text-[11px] leading-[16.5px] font-[1000] tracking-[-0.64px]"
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
        </>
      ) : (
        <p className="mt-[16px] rounded-[12px] bg-[#f1f3f5] px-[14px] py-[16px] text-center text-[13px] leading-[18px] text-[#8a9eb8]">
          아직 자외선 예보가 나오지 않은 날이에요
        </p>
      )}
    </section>
  )
}

export default DayUvCard
