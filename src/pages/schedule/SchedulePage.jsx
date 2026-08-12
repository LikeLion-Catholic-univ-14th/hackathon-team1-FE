import { useEffect, useState } from 'react'
import AppHeader from '../../components/common/AppHeader.jsx'
import MonthCalendar, { CalendarLegend } from './components/MonthCalendar.jsx'
import DayUvCard from './components/DayUvCard.jsx'
import { mockCalendar } from './mocks/mockCalendar.js'
import { mockDailyDetail } from './mocks/mockDailyDetail.js'
import { parseMonth } from './utils/calendar.js'

const stageClass =
  'flex min-h-svh w-full items-start justify-center bg-[#bdbdbd] p-6 max-[520px]:bg-[#f5f7fb] max-[520px]:p-0'
const screenClass =
  'relative h-[874px] min-h-[874px] w-[402px] overflow-x-hidden overflow-y-auto bg-[#f5f7fb] pb-10 text-left text-[15px] text-[#1d2b45] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[520px]:h-svh max-[520px]:min-h-svh max-[520px]:w-full'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function SchedulePage() {
  const [calendar, setCalendar] = useState(null)
  const [daily, setDaily] = useState(null)
  const [selectedDate, setSelectedDate] = useState('2026-08-09')

  useEffect(() => {
    setCalendar(mockCalendar)
  }, [])

  useEffect(() => {
    // 나중에 fetchDailyDetail(selectedDate) 로 교체
    setDaily(mockDailyDetail)
  }, [selectedDate])

  if (!calendar) {
    return <p className="p-6">불러오는 중...</p>
  }

  const { year, month } = parseMonth(calendar.month)

  // 카드 2장 = 출발지 + 도착지. 없는 쪽은 걸러낸다
  const cards = daily ? [daily.departureInfo, daily.arrivalInfo].filter(Boolean) : []

  return (
    <div className={stageClass}>
      <div className={screenClass}>
        <AppHeader />

        <header className="px-[20px] pt-[4px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[10px]">
              <button type="button" aria-label="이전 달" className="text-[#8a9eb8]">
                ‹
              </button>
              <p className="text-[22px] font-bold tracking-[-1px] text-[#1d2b44]">
                {year}년 {month}월
              </p>
              <button type="button" aria-label="다음 달" className="text-[#8a9eb8]">
                ›
              </button>
            </div>

            <button
              type="button"
              className="rounded-full bg-[#eceef2] px-[13px] py-[7px] text-[12px] text-[#1d2b44]"
            >
              + 일정 등록
            </button>
          </div>

          <div className="grid grid-cols-7 pt-[14px] text-center text-[13px] text-[#8a9eb8]">
            {WEEKDAYS.map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>
        </header>

        <div className="pt-[14px]">
          <MonthCalendar
            year={year}
            month={month}
            days={calendar.days}
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
          />

          <CalendarLegend />

          {cards.length > 0 ? (
            cards.map((card) => <DayUvCard key={card.cityName} info={card} />)
          ) : (
            <p className="mt-10 text-center text-[13px] text-[#8a9eb8]">
              이 날은 등록된 일정이 없어요
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default SchedulePage