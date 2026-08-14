// GET /schedules/calendar?month=2026-08
// 서버는 1일~말일을 전부 채워서 내려준다.
// 백엔드가 status → mode(외출 on/off) + riskLevel(위험도) 로 분리 예정이라
// 두 형태를 모두 담아둔다. 실제 응답 확정되면 한쪽만 남기면 된다.
const scheduled = {
  '2026-08-03': { scheduleId: 101, mode: 'OUTING', riskLevel: 'CAUTION' },
  '2026-08-04': { scheduleId: 102, mode: 'OUTING', riskLevel: 'SAFE' },
  '2026-08-07': { scheduleId: 103, mode: 'OUTING', riskLevel: 'DANGER' },
  '2026-08-08': { scheduleId: 104, mode: 'OUTING', riskLevel: 'CAUTION' },
  '2026-08-09': { scheduleId: 105, mode: 'OUTING', riskLevel: 'DANGER' },
  '2026-08-11': { scheduleId: 106, mode: 'INDOOR', riskLevel: 'SAFE' },
  '2026-08-12': { scheduleId: 107, mode: 'OUTING', riskLevel: 'DANGER' },
  '2026-08-13': { scheduleId: 108, mode: 'OUTING', riskLevel: 'CAUTION' },
  '2026-08-14': { scheduleId: 109, mode: 'OUTING', riskLevel: 'SAFE' },
  // 미래 일정 — 그래프·위험도는 화면에서 가린다
  '2026-08-20': { scheduleId: 110, mode: 'OUTING', riskLevel: 'DANGER' },
  '2026-08-21': { scheduleId: 111, mode: 'OUTING', riskLevel: 'DANGER' },
  '2026-08-27': { scheduleId: 112, mode: 'OUTING', riskLevel: 'CAUTION' },
}

const buildDays = (year, month) => {
  const lastDate = new Date(year, month, 0).getDate()

  return Array.from({ length: lastDate }, (_, index) => {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`
    const found = scheduled[date]

    if (found) {
      return {
        date,
        ...found,
        status: found.mode === 'INDOOR' ? 'INDOOR' : found.riskLevel,
      }
    }

    // 일정 없는 날. 외출 토글은 daily-outing API로 별도 관리 예정
    return {
      date,
      scheduleId: null,
      mode: 'INDOOR',
      riskLevel: 'SAFE',
      status: 'INDOOR',
    }
  })
}

export const mockCalendar = {
  month: '2026-08',
  days: buildDays(2026, 8),
}

// 온보딩에서 스케줄을 등록하지 않은 사용자용 (빈 상태 화면 확인용)
export const mockEmptyCalendar = {
  month: '2026-08',
  days: Array.from({ length: 31 }, (_, index) => ({
    date: `2026-08-${String(index + 1).padStart(2, '0')}`,
    scheduleId: null,
    mode: 'INDOOR',
    riskLevel: 'SAFE',
    status: 'INDOOR',
  })),
}
