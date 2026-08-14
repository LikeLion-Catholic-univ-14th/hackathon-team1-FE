import { useEffect, useState } from 'react'
import AppHeader from '../../components/common/AppHeader.jsx'
import BottomNavigation from '../../components/common/BottomNavigation.jsx'
import MonthCalendar, {
  CalendarLegend,
  CalendarWeekdays,
} from './components/MonthCalendar.jsx'
import FlightInfoBar from './components/FlightInfoBar.jsx'
import DayUvCard from './components/DayUvCard.jsx'
import EmptySchedule from './components/EmptySchedule.jsx'
import ScheduleUploadModal from './components/ScheduleUploadModal.jsx'
import ScheduleConfirmModal from './components/ScheduleConfirmModal.jsx'
import CompleteToast from './components/CompleteToast.jsx'
import { mockCalendar } from './mocks/mockCalendar.js'
import { getMockDaily } from './mocks/mockDailyDetail.js'
import { mockExtractedSchedules } from './mocks/mockExtractedSchedules.js'
import { parseMonth } from './utils/calendar.js'
import { readOuting, TODAY } from './utils/schedule.js'

const stageClass =
  'flex min-h-svh w-full items-start justify-center bg-[#bdbdbd] p-6 max-[520px]:bg-[#f5f7fb] max-[520px]:p-0'
const screenClass =
  'relative h-[874px] min-h-[874px] w-[402px] overflow-x-hidden overflow-y-auto bg-[#f5f7fb] pb-[110px] text-left text-[15px] text-[#1d2b45] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[520px]:h-svh max-[520px]:min-h-svh max-[520px]:w-full'

const MIN_MONTH = '2026-01'

const shiftMonth = (monthStr, diff) => {
  const [year, month] = monthStr.split('-').map(Number)
  const next = new Date(year, month - 1 + diff, 1)
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
}

function SchedulePage() {
  const [month, setMonth] = useState('2026-08')
  const [calendar, setCalendar] = useState(null)
  const [daily, setDaily] = useState(null)
  const [selectedDate, setSelectedDate] = useState(TODAY)
  const [outing, setOuting] = useState(true)

  const [showUpload, setShowUpload] = useState(false)
  const [extracted, setExtracted] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  // 달력 — 월이 바뀔 때마다
  useEffect(() => {
    // 연동 시: fetchCalendar(month).then(setCalendar).catch(() => setCalendar(null))
    setCalendar({ ...mockCalendar, month })
  }, [month])

  // 날짜 상세 — 선택 날짜가 바뀔 때마다
  useEffect(() => {
    // 연동 시: fetchDailyDetail(selectedDate).then(setDaily).catch(() => setDaily(null))
    const next = getMockDaily(selectedDate)
    setDaily(next)
    setOuting(readOuting(next?.departureInfo))
  }, [selectedDate])

  if (!calendar) {
    return <p className="p-6">불러오는 중...</p>
  }

  const { year, month: monthNumber } = parseMonth(calendar.month)

  // 카드 = 출발지 + 도착지. 레이오버·대기일은 한 장만 온다
  const cards = daily ? [daily.departureInfo, daily.arrivalInfo].filter(Boolean) : []

  // 이 사용자가 스케줄을 등록한 적 있는지 (백엔드 boolean 나오면 교체)
  const hasSchedule = calendar.days.some((day) => day.scheduleId != null)
  const canGoPrev = calendar.month > MIN_MONTH

  const handleUpload = () => {
    // 연동 시: extractSchedules(file).then(setExtracted)
    setShowUpload(false)
    setExtracted(mockExtractedSchedules)
  }

  const handleSave = () => {
    // 연동 시: createSchedules(rows) 또는 patchSchedule(id)
    setExtracted(null)
    setToastMessage(
      hasSchedule ? '비행 일정이 수정되었어요' : '비행 일정이 등록되었어요',
    )
  }

  return (
    <div className={stageClass}>
      <div className="relative">
        <div className={screenClass}>
          <AppHeader />

          <header className="px-[20px] pt-[4px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[10px]">
                <button
                  type="button"
                  aria-label="이전 달"
                  disabled={!canGoPrev}
                  className="text-[18px] text-[#8a9eb8] disabled:opacity-30"
                  onClick={() => setMonth(shiftMonth(calendar.month, -1))}
                >
                  ‹
                </button>
                <p className="text-[22px] font-bold tracking-[-1px] text-[#1d2b44]">
                  {year}년 {monthNumber}월
                </p>
                <button
                  type="button"
                  aria-label="다음 달"
                  className="text-[18px] text-[#8a9eb8]"
                  onClick={() => setMonth(shiftMonth(calendar.month, 1))}
                >
                  ›
                </button>
              </div>

              <button
                type="button"
                className="rounded-full bg-[#eceef2] px-[13px] py-[7px] text-[12px] text-[#1d2b44]"
                onClick={() => setShowUpload(true)}
              >
                + 일정 등록
              </button>
            </div>

            <CalendarWeekdays />
          </header>

          <div className="pt-[14px]">
            {hasSchedule ? (
              <>
                <MonthCalendar
                  year={year}
                  month={monthNumber}
                  days={calendar.days}
                  selectedDate={selectedDate}
                  onSelect={setSelectedDate}
                />

                <CalendarLegend />

                <FlightInfoBar daily={daily} onEdit={() => setShowUpload(true)} />

                {cards.length > 0 ? (
                  cards.map((card, index) => (
                    <DayUvCard
                      key={card.cityName}
                      date={selectedDate}
                      info={card}
                      outing={outing}
                      onToggle={() => setOuting(!outing)}
                      canToggle
                      showToggle={index === 0}
                    />
                  ))
                ) : (
                  <p className="mt-10 text-center text-[13px] text-[#8a9eb8]">
                    이 날은 등록된 일정이 없어요
                  </p>
                )}
              </>
            ) : (
              <EmptySchedule onRegister={() => setShowUpload(true)} />
            )}
          </div>
        </div>

        <BottomNavigation />

        {showUpload && (
          <ScheduleUploadModal
            onClose={() => setShowUpload(false)}
            onUpload={handleUpload}
          />
        )}

        {extracted && (
          <ScheduleConfirmModal
            fileName={extracted.fileName}
            schedules={extracted.schedules}
            onClose={() => setExtracted(null)}
            onSave={handleSave}
          />
        )}

        {toastMessage && (
          <CompleteToast
            message={toastMessage}
            onDismiss={() => setToastMessage('')}
          />
        )}
      </div>
    </div>
  )
}

export default SchedulePage
