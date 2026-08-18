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
import {
  fetchCalendar,
  fetchDailyDetail,
  patchOuting,
  updateSchedule,
} from './api/scheduleApi.js'
import { parseMonth } from './utils/calendar.js'
import { readTime, THIS_MONTH, TODAY } from './utils/schedule.js'

const stageClass =
  'flex min-h-svh w-full items-start justify-center bg-[#bdbdbd] p-6 max-[520px]:bg-[#f5f7fb] max-[520px]:p-0'
const screenClass =
  'relative h-[874px] min-h-[874px] w-[402px] overflow-x-hidden overflow-y-auto bg-[#f4f6f9] pb-[110px] text-left text-[15px] text-[#1d2b45] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[520px]:h-svh max-[520px]:min-h-svh max-[520px]:w-full'

const MIN_MONTH = '2026-01'

// 서버에서 달력을 못 받았을 때 쓰는 빈 달력.
// 시안에 있는 '일정 미등록' 화면이 그대로 뜬다
const emptyCalendar = (monthStr) => {
  const [year, monthNumber] = monthStr.split('-').map(Number)
  const lastDate = new Date(year, monthNumber, 0).getDate()

  return {
    month: monthStr,
    hasScheduleHistory: false,
    days: Array.from({ length: lastDate }, (_, index) => ({
      date: `${monthStr}-${String(index + 1).padStart(2, '0')}`,
      scheduleId: null,
      status: null,
    })),
  }
}

const shiftMonth = (monthStr, diff) => {
  const [year, month] = monthStr.split('-').map(Number)
  const next = new Date(year, month - 1 + diff, 1)
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
}

function SchedulePage() {
  const [month, setMonth] = useState(THIS_MONTH)
  const [calendar, setCalendar] = useState(null)
  const [daily, setDaily] = useState(null)
  const [selectedDate, setSelectedDate] = useState(TODAY)
  const [outing, setOuting] = useState(true)
  const [showRegister, setShowRegister] = useState(false)
  const [registerDraft, setRegisterDraft] = useState({ files: [], schedules: [] })
  const [reloadKey, setReloadKey] = useState(0)

  // 연필로 수정 중인 일정 (서버에 이미 있는 것)
  const [editTarget, setEditTarget] = useState(null)

  const reload = () => setReloadKey((key) => key + 1)

  // 서버가 외출 상태를 명확히 줄 때만 화면을 바꾼다.
  // 값이 없으면 기존 상태를 유지한다 (방금 누른 토글이 되돌아가면 안 된다)
  const applyOuting = (data, fallback) => {
    const value = data?.isOuting ?? data?.departureInfo?.outing

    setOuting(typeof value === 'boolean' ? value : fallback)
  }

  // 달력 — 월이 바뀌거나 일정을 새로 등록했을 때
  useEffect(() => {
    let alive = true

    fetchCalendar(month)
      .then((data) => {
        if (alive) {
          setCalendar({ ...data, month })
        }
      })
      .catch((error) => {
        // 실패해도 시안에 있는 '일정 미등록' 화면을 그대로 띄운다
        console.error('달력 조회 실패', error)

        if (alive) {
          setCalendar(emptyCalendar(month))
        }
      })

    return () => {
      alive = false
    }
  }, [month, reloadKey])

  // 날짜 상세 — 선택 날짜가 바뀔 때마다
  useEffect(() => {
    let alive = true

    fetchDailyDetail(selectedDate)
      .then((data) => {
        if (alive) {
          setDaily(data)
          applyOuting(data, true)
        }
      })
      .catch((error) => {
        // 그날 일정이 없으면 404 가 날 수 있다. 화면은 "일정 없음"으로 둔다
        console.warn('날짜 상세 조회 실패', error)

        if (alive) {
          setDaily(null)
        }
      })

    return () => {
      alive = false
    }
  }, [selectedDate, reloadKey])

  // 첫 요청이 끝나기 전. 껍데기만 두고 기다린다
  if (!calendar) {
    return (
      <div className={stageClass}>
        <div className="relative">
          <div className={screenClass}>
            <StatusBar />
            <AppHeader />
          </div>

          <BottomNavigation />
        </div>
      </div>
    )
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

  // + 일정 등록 — 새 사진을 올려서 등록하는 흐름
  const goRegister = () => setShowRegister(true)

  // ✏️ — 서버에 이미 있는 이 일정을 바로 수정한다 (PATCH /schedules/{id})
  const goEditFlight = () => {
    if (!daily?.scheduleId) {
      return
    }

    setEditTarget({
      id: daily.scheduleId,
      departureAirport: daily.departureAirport,
      arrivalAirport: daily.arrivalAirport,
      departureDate: (daily.departureTime ?? '').slice(0, 10) || selectedDate,
      arrivalDate: (daily.arrivalTime ?? '').slice(0, 10) || selectedDate,
      departureTime: readTime(daily.departureTime),
      arrivalTime: readTime(daily.arrivalTime),
    })
  }

  // 외출 토글. 화면을 먼저 바꾸고 서버에 알린다 (실패하면 되돌린다).
  // /daily-outing 응답에는 상태만 오므로, 위험도·문구를 갱신하려면 상세를 다시 받는다
  const toggleOuting = () => {
    const next = !outing
    setOuting(next)

    patchOuting(selectedDate, next)
      // 외출을 바꾸면 그날 등급이 달라져 달력 점 색도 바뀐다.
      // 상세와 달력을 같이 다시 받는다
      .then(() => Promise.all([fetchDailyDetail(selectedDate), fetchCalendar(month)]))
      .then(([detail, nextCalendar]) => {
        setDaily(detail)
        // 서버가 상태를 안 주면 방금 누른 값을 그대로 유지한다
        applyOuting(detail, next)
        setCalendar({ ...nextCalendar, month })
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
                    onEdit={goEditFlight}
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

        {/* 연필 수정 — 서버에 있는 일정 하나를 고친다 */}
        {editTarget && (
          <ScheduleSetup
            embedded
            editSchedule={editTarget}
            onBack={() => setEditTarget(null)}
            onEditSaved={(draft) => {
              const toDate = (parts) =>
                `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
              const toTime = (parts) => {
                const hour24 =
                  parts.period === '오후'
                    ? (parts.hour % 12) + 12
                    : parts.hour % 12

                return `${String(hour24).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}:00`
              }

              updateSchedule(editTarget.id, {
                flightNumber: '',
                departureAirport: draft.departureAirport?.match(/[A-Z]{3}/)?.[0] ?? draft.departureAirport,
                arrivalAirport: draft.arrivalAirport?.match(/[A-Z]{3}/)?.[0] ?? draft.arrivalAirport,
                departureTime: `${toDate(draft.departureDate)}T${toTime(draft.departureTime)}`,
                arrivalTime: `${toDate(draft.arrivalDate)}T${toTime(draft.arrivalTime)}`,
                isQuickTurn: false,
              })
                .then(() => {
                  setEditTarget(null)
                  reload()
                })
                .catch((error) => {
                  console.error('일정 수정 실패', error)
                  window.alert('일정 수정에 실패했어요. 잠시 후 다시 시도해주세요.')
                })
            }}
          />
        )}

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
              // 서버에 저장이 끝난 시점. 달력을 다시 불러온다
              setShowRegister(false)
              reload()
            }}
          />
        )}
      </div>
    </div>
  )
}

export default SchedulePage
