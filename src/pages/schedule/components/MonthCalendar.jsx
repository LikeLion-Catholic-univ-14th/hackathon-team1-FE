import { buildCalendarCells } from '../utils/calendar.js'

const headingFontClass =
  "font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const DOT_COLOR = {
  DANGER: 'bg-[#b55454]',
  CAUTION: 'bg-[#f5a623]',
  SAFE: 'bg-[#3f8ae1]',
  INDOOR: 'bg-[#a8b8cc]',
}

const LEGEND = [
  { key: 'DANGER', label: '위험' },
  { key: 'CAUTION', label: '주의' },
  { key: 'SAFE', label: '안전' },
  { key: 'INDOOR', label: '실내' },
]

function MonthCalendar({ year, month, days, selectedDate, onSelect }) {
  const cells = buildCalendarCells(year, month)

  const dayMap = {}
  days.forEach((day) => {
    dayMap[day.date] = day
  })

  return (
    <div className={`mx-[14px] rounded-[20px] bg-white px-[8px] py-[14px] ${headingFontClass}`}>
      <div className="grid grid-cols-7">
        {cells.map((cell, index) => {
          if (!cell) {
            return <div key={`empty-${index}`} />
          }

          const info = dayMap[cell.date]
          const isSelected = cell.date === selectedDate
          const hasSchedule = info?.scheduleId != null

          const numClass = isSelected
            ? 'bg-[#f5a623] text-white'
            : hasSchedule
              ? 'bg-[#fdf0e0] text-[#1d2b44]'
              : 'text-[#1d2b44]'

          return (
            <button
              className="flex cursor-pointer flex-col items-center px-[3px] py-[6px]"
              key={cell.date}
              type="button"
              onClick={() => onSelect(cell.date)}
            >
              <span
                className={`flex size-[32px] items-center justify-center rounded-full text-[16px] leading-[21px] tracking-[-0.64px] ${numClass}`}
              >
                {cell.day}
              </span>

              <span className="pt-[3px]">
                {info && (
                  <i className={`block size-[5px] rounded-full ${DOT_COLOR[info.status]}`} />
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function CalendarLegend() {
  return (
    <div className="mx-[14px] mt-[12px] flex justify-center gap-[43px] rounded-full bg-white py-[12px] text-[13px] text-[#8a9eb8]">
      {LEGEND.map((item) => (
        <span className="flex items-center gap-[5px]" key={item.key}>
          <i className={`block size-[7px] rounded-full ${DOT_COLOR[item.key]}`} />
          {item.label}
        </span>
      ))}
    </div>
  )
}

export default MonthCalendar