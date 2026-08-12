// 해당 월의 달력 칸 배열을 만든다. 1일 앞의 빈 칸은 null.
export const buildCalendarCells = (year, month) => {
  const firstDay = new Date(year, month - 1, 1).getDay() // 0=일요일
  const lastDate = new Date(year, month, 0).getDate() // 그 달 마지막 날짜

  const cells = []

  for (let i = 0; i < firstDay; i += 1) {
    cells.push(null)
  }

  for (let d = 1; d <= lastDate; d += 1) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, date: dateStr })
  }

  return cells
}

// "2026-08" → { year: 2026, month: 8 }
export const parseMonth = (monthStr) => {
  const [year, month] = monthStr.split('-').map(Number)
  return { year, month }
}