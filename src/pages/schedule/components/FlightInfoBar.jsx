import { readShortDate, readTime } from '../utils/schedule.js'

// 08/09   09:00 ICN ✈ 13:00 SYD        ✏️
function FlightInfoBar({ daily, onEdit }) {
  if (!daily?.departureAirport || !daily?.arrivalAirport) {
    return null
  }

  return (
    <div className="mx-[14px] mt-[12px] flex items-center gap-[26px] rounded-[10px] bg-white px-[16px] py-[18px] drop-shadow-[0px_3px_6px_rgba(168,184,204,0.15)]">
      <div className="flex flex-1 items-center justify-center gap-[48px]">
        <p className="text-[16px] leading-[21px] font-bold tracking-[-0.4px] text-[#1d2b44]">
          {readShortDate(daily.date)}
        </p>

        <div className="flex items-center gap-[2px]">
          <span className="flex items-center gap-[2px] leading-[21px] whitespace-nowrap">
            <span className="text-[16px] font-bold tracking-[-0.8px] text-[#1d2b44]">
              {readTime(daily.departureTime)}
            </span>
            <span className="text-[13px] font-[590] tracking-[-0.4px] text-[#3f8ae1]">
              {daily.departureAirport}
            </span>
          </span>

          <span className="px-[4px] text-[12px] text-[#8a9eb8]" aria-hidden="true">
            ✈
          </span>

          <span className="flex items-center gap-[2px] leading-[21px] whitespace-nowrap">
            <span className="text-[16px] font-bold tracking-[-0.8px] text-[#1d2b44]">
              {readTime(daily.arrivalTime)}
            </span>
            <span className="text-[13px] font-[590] tracking-[-0.4px] text-[#3f8ae1]">
              {daily.arrivalAirport}
            </span>
          </span>
        </div>
      </div>

      <button
        type="button"
        aria-label="일정 수정"
        className="size-[15px] shrink-0 text-[13px] leading-none text-[#8a9eb8]"
        onClick={onEdit}
      >
        ✎
      </button>
    </div>
  )
}

export default FlightInfoBar
