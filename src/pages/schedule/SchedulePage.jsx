import { useEffect, useState } from 'react'
import StatusBar from '../../components/common/StatusBar.jsx'
import AppHeader from '../../components/common/AppHeader.jsx'
import ScheduleSetup from '../onboarding/ScheduleSetup.jsx'
import BottomNavigation from '../../components/common/BottomNavigation.jsx'
import MonthCalendar, {
  CalendarLegend,
  CalendarWeekdays,
} from './components/MonthCalendar.jsx'
import DetailCard from './components/DetailCard.jsx'
import EmptySchedule from './components/EmptySchedule.jsx'
import { mockCalendar, mockEmptyCalendar } from './mocks/mockCalendar.js'
import { getMockDaily } from './mocks/mockDailyDetail.js'
import { fetchCalendar, fetchDailyDetail, patchOuting } from './api/scheduleApi.js'
import { parseMonth } from './utils/calendar.js'
import { readOuting, TODAY } from './utils/schedule.js'

const stageClass =
  'flex min-h-svh w-full items-start justify-center bg-[#bdbdbd] p-6 max-[520px]:bg-[#f5f7fb] max-[520px]:p-0'
const screenClass =
  'relative h-[874px] min-h-[874px] w-[402px] overflow-x-hidden overflow-y-auto bg-[#f4f6f9] pb-[110px] text-left text-[15px] text-[#1d2b45] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[520px]:h-svh max-[520px]:min-h-svh max-[520px]:w-full'

const MIN_MONTH = '2026-01'

// ⚙️ 데모 스위치 — .env 의 VITE_USE_MOCK
//   'true'  : 서버를 아예 안 부르고 목데이터만 쓴다 (시연 영상 찍을 때)
//   그 외    : 서버를 부르고, 실패하면 목데이터로 떨어진다
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// 목데이터로 돌 때 등록 여부
//   true  : 등록 완료 → 달력에 일정이 보임 → 수정 흐름
//   false : 미등록   → 빈 화면 → 새로 등록 흐름
// 서버를 쓸 땐 응답의 hasScheduleHistory 가 이 값을 대신한다
const ONBOARDED = false

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
  const [showRegister, setShowRegister] = useState(false)
  const [registerDraft, setRegisterDraft] = useState({ files: [], schedules: [] })
  const [registered, setRegistered] = useState(ONBOARDED)

  // 달력 — 월이 바뀌거나 일정을 새로 등록했을 때
  useEffect(() => {
    const fallback = () => {
      const source = registered ? mockCalendar : mockEmptyCalendar
      setCalendar({ ...source, month })
    }

    if (USE_MOCK) {
      fallback()
      return
    }

    let alive = true

    fetchCalendar(month)
      .then((data) => {
        if (alive) {
          setCalendar({ ...data, month })
        }
      })
      .catch((error) => {
        console.warn('달력 조회 실패 — 목데이터로 표시합니다', error)

        if (alive) {
          fallback()
        }
      })

    return () => {
      alive = false
    }
  }, [month, registered])

  // 날짜 상세 — 선택 날짜가 바뀔 때마다
  useEffect(() => {
    const apply = (next) => {
      setDaily(next)
      setOuting(readOuting(next?.departureInfo))
    }

    if (USE_MOCK) {
      apply(getMockDaily(selectedDate))
      return
    }

    let alive = true

    fetchDailyDetail(selectedDate)
      .then((data) => {
        if (alive) {
          apply(data)
        }
      })
      .catch((error) => {
        console.warn('날짜 상세 조회 실패 — 목데이터로 표시합니다', error)

        if (alive) {
          apply(getMockDaily(selectedDate))
        }
      })

    return () => {
      alive = false
    }
  }, [selectedDate])

  if (!calendar) {
    return <p className="p-6">불러오는 중...</p>
  }

  const { year, month: monthNumber } = parseMonth(calendar.month)

  // 카드 = 출발지 + 도착지. 레이오버·대기일은 한 장만 온다
  const cards = daily ? [daily.departureInfo, daily.arrivalInfo].filter(Boolean) : []

  // 이 사용자가 스케줄을 등록한 적 있는지.
  // 서버가 hasScheduleHistory 를 주면 그걸 쓰고, 없으면 일정 유무로 판단한다
  const hasSchedule =
    calendar.hasScheduleHistory ??
    calendar.days.some((day) => day.scheduleId != null)
  const canGoPrev = calendar.month > MIN_MONTH

  // 등록·수정 모두 온보딩의 ScheduleSetup 흐름을 모달로 재사용한다
  const goRegister = () => setShowRegister(true)

  // 외출 토글. 화면을 먼저 바꾸고 서버에 알린다 (실패하면 되돌린다)
  const toggleOuting = () => {
    const next = !outing
    setOuting(next)

    if (USE_MOCK) {
      return
    }

    patchOuting(daily?.scheduleId, next, selectedDate)
      .then((data) => {
        // 비행 일정이 있는 날은 갱신된 상세가 통째로 돌아온다
        if (data?.departureInfo) {
          setDaily(data)
        }
      })
      .catch((error) => {
        console.warn('외출 상태 변경 실패', error)
        setOuting(!next)
      })
  }

  return (
    <div className={stageClass}>
      <div className="relative">
        <div className={screenClass}>
          <StatusBar />
          <AppHeader />

          <header className="flex flex-col gap-[10px] bg-white px-[20px] pb-[16px] drop-shadow-[0px_2px_6px_rgba(29,43,68,0.04)]">
            <div className="flex items-center justify-between pt-[4px]">
              <div className="flex items-center gap-[10px]">
                <button
                  type="button"
                  aria-label="이전 달"
                  disabled={!canGoPrev}
                  className="px-[6px] py-[4px] text-[18px] leading-none text-[#1d2b44] disabled:opacity-30"
                  onClick={() => setMonth(shiftMonth(calendar.month, -1))}
                >
                  ‹
                </button>
                <p className="text-[24px] leading-[27.5px] font-bold tracking-[-0.88px] text-[#1d2b44]">
                  {year}년 {monthNumber}월
                </p>
                <button
                  type="button"
                  aria-label="다음 달"
                  className="px-[6px] py-[4px] text-[18px] leading-none text-[#1d2b44]"
                  onClick={() => setMonth(shiftMonth(calendar.month, 1))}
                >
                  ›
                </button>
              </div>

              <button
                type="button"
                className="rounded-full bg-[#f0f2f6] px-[13px] py-[7px] text-[12px] leading-[18px] tracking-[-0.64px] text-[#3a506b]"
                onClick={goRegister}
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

                {cards.length > 0 ? (
                  <DetailCard
                    daily={daily}
                    cards={cards}
                    selectedDate={selectedDate}
                    outing={outing}
                    onToggle={toggleOuting}
                    onEdit={goRegister}
                  />
                ) : (
                  <p className="mt-10 text-center text-[13px] text-[#8a9eb8]">
                    이 날은 등록된 일정이 없어요
                  </p>
                )}
              </>
            ) : (
              <EmptySchedule />
            )}
          </div>
        </div>

        <BottomNavigation />

        {showRegister && (
          <ScheduleSetup
            embedded
            completeMessage={
              hasSchedule
                ? '비행 일정이 수정되었어요!'
                : '비행 일정이 등록되었어요!'
            }
            value={registerDraft}
            onChange={setRegisterDraft}
            onBack={() => setShowRegister(false)}
            onComplete={() => {
              // 등록이 끝나면 달력에 일정이 채워진다
              setRegistered(true)
              setShowRegister(false)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default SchedulePage
