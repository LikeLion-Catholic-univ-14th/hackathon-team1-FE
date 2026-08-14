import { buildCalendarCells } from '../utils/calendar.js'
import { isFuture, readDayLevel } from '../utils/schedule.js'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const DOT_COLOR = {
  DANGER: 'bg-[#b55454]',
  CAUTION: 'bg-[#f5a623]',
  SAFE: 'bg-[#3f8ae1]',
  INDOOR: 'bg-[#c4cad4]',
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
    <div className="mx-[14px] rounded-[20px] bg-white px-[8px] py-[14px]">
      <div className="grid grid-cols-7">
        {cells.map((cell, index) => {
          if (!cell) {
            return <div key={`empty-${index}`} />
          }

          const info = dayMap[cell.date]
          const level = readDayLevel(info)
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

              <span className="flex h-[8px] items-start pt-[3px]">
                {/* 미래 날짜는 위험도를 알 수 없어 점을 숨긴다 */}
                {level && !isFuture(cell.date) && (
                  <i className={`block size-[5px] rounded-full ${DOT_COLOR[level]}`} />
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function CalendarWeekdays() {
  return (
    <div className="grid grid-cols-7 pt-[14px] text-center text-[13px] text-[#8a9eb8]">
      {WEEKDAYS.map((weekday, index) => (
        <span
          className={index === 0 || index === 6 ? 'text-[#f5a623]' : undefined}
          key={weekday}
        >
          {weekday}
        </span>
      ))}
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
