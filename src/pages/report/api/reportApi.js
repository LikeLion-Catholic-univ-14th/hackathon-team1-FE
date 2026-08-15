// api-docs (1).json 기준 — monthly-report-controller
// GET /reports/monthly?year=2026&month=8
//
// 응답 필드가 화면 컴포넌트가 쓰는 이름과 그대로 맞는다.
// (summary / routeRanking / dailyExposure / trend / analysis / nextMonthForecast / clinic)
// 그래서 변환 없이 그대로 넘긴다.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export const fetchMonthlyReport = async (year, month) => {
  const response = await fetch(
    `${apiBaseUrl}/reports/monthly?year=${year}&month=${month}`,
  )

  if (!response.ok) {
    throw new Error(`/reports/monthly failed: ${response.status}`)
  }

  return response.json()
}
