import UvChart from './UvChart.jsx'
import { isFuture } from '../utils/schedule.js'

// 위험도 배지 — Figma 실측값
// 위험만 테두리(#B55454)와 글자(#E05252) 색이 다르다
const LEVEL = {
  DANGER: { label: '위험', border: '#b55454', message: '#e05252', bg: '#fff0f0' },
  CAUTION: { label: '주의', border: '#f5a623', message: '#f5a623', bg: '#fef7e6' },
  SAFE: { label: '안전', border: '#3f8ae1', message: '#3f8ae1', bg: '#ebf5ff' },
  INDOOR: { label: '실내', border: '#8a9eb8', message: '#8a9eb8', bg: '#f1f3f5' },
}

function OutingToggle({ outing, disabled, onToggle }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="flex shrink-0 items-center gap-[6px] rounded-full bg-[#f1f3f5] px-[10px] py-[5px] disabled:opacity-40"
      onClick={onToggle}
    >
      <span
        className={`text-[11px] leading-[16.5px] font-bold tracking-[-0.64px] ${
          outing ? 'text-[#f5a623]' : 'text-[#8a9eb8]'
        }`}
      >
        외출
      </span>
      <span
        className={`relative h-[18px] w-[32px] rounded-full ${
          outing ? 'bg-[#f5a623]' : 'bg-[#8a9eb8]'
        }`}
      >
        <span
          className={`absolute top-[2px] size-[14px] rounded-full bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.18)] transition-[left] ${
            outing ? 'left-[16px]' : 'left-[2px]'
          }`}
        />
      </span>
    </button>
  )
}

// 미래 날짜 — 그래프 자리에 안내 문구
function NoForecast() {
  return (
    <div className="flex w-full flex-col items-center rounded-[20px] bg-white pt-[41px] pb-[32px] drop-shadow-[0px_4px_9px_rgba(29,43,68,0.06)]">
      <div className="flex flex-col items-center gap-[16px] px-[15px]">
        <span className="flex size-[24px] items-center justify-center text-[20px] leading-none text-[#8a9eb8]">
          ···
        </span>
        <div className="flex flex-col items-center">
          <p className="text-[15px] leading-[15px] font-[510] tracking-[-1.4px] text-[#8a9eb8]">
            아직 자외선 예보가 없어요
          </p>
          <p className="p-[10px] text-[13px] leading-[15px] font-[510] tracking-[-1.4px] text-[#8a9eb8]">
            당일부터 확인할 수 있어요
          </p>
        </div>
      </div>
    </div>
  )
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
    <section className="w-[335.605px]">
      <div className="flex w-full items-start justify-between">
        <div>
          <p className="text-[14px] leading-[15px] font-[590] tracking-[-1px] text-[#8a9eb8]">
            {info.displayDate}
          </p>
          <p className="pt-[12px] text-[24px] leading-[21.25px] font-[860] tracking-[-0.68px] text-[#1d2b44]">
            {info.cityName}
          </p>
        </div>

        {showToggle && (
          <OutingToggle outing={outing} disabled={!canToggle} onToggle={onToggle} />
        )}
      </div>

      <p className="h-[29px] pt-[14px] pl-[4px] text-[12px] leading-[15px] font-[590] tracking-[-1px] text-[#8a9eb8]">
        자외선 그래프
      </p>

      <div className="pt-[7px]">
        {showGraph ? (
          <div className="w-full rounded-[20px] bg-white pt-[16px] pb-[21px] drop-shadow-[0px_4px_9px_rgba(29,43,68,0.06)]">
            <UvChart graph={info.uvDetail.graph} level={info.riskLevel} />
          </div>
        ) : (
          <NoForecast />
        )}
      </div>

      {showGraph && (
        <div className="pt-[12px]">
          <div
            className="flex w-full items-center gap-[10px] rounded-[12px] px-[14px] py-[11px]"
            style={{ backgroundColor: level.bg }}
          >
            <span
              className="shrink-0 rounded-full border-[1.8px] px-[9.8px] py-[3.8px] text-[11px] leading-[16.5px] font-[1000] tracking-[-0.64px]"
              style={{ borderColor: level.border, color: level.border }}
            >
              {level.label}
            </span>
            <p
              className="text-[13px] leading-[18px] font-bold tracking-[-1px]"
              style={{ color: level.message }}
            >
              {info.uvDetail.warningMessage}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

export default DayUvCard
