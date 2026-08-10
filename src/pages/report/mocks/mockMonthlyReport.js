export const mockMonthlyReport = {
  year: 2026,
  month: 8,

  summary: {
    equivalentDaysInSeoul: 34,
    actualOutingHours: 19,
    comparisonMultiplier: 1.4,
  },

  routeRanking: {
    insightMessage: '파리 4번이지만 강도가 낮아 11%에 그침',
    rankings: [
      { route: '시드니', count: 3, percentage: 62 },
      { route: '두바이', count: 2, percentage: 21 },
      { route: '파리', count: 4, percentage: 11 },
      { route: '나머지', count: 0, percentage: 6 },
    ],
  },

  dailyExposure: [
    { day: 1, outingValue: 2, indoorValue: 1 },
    { day: 2, outingValue: 2, indoorValue: 1 },
    { day: 3, outingValue: 4, indoorValue: 1 },
    { day: 4, outingValue: 2, indoorValue: 1 },
    { day: 5, outingValue: 9, indoorValue: 2 },
    { day: 6, outingValue: 8, indoorValue: 1 },
    { day: 7, outingValue: 0, indoorValue: 2 },
    { day: 8, outingValue: 10, indoorValue: 1 },
    { day: 9, outingValue: 9, indoorValue: 1 },
    { day: 10, outingValue: 0, indoorValue: 2 },
    { day: 11, outingValue: 0, indoorValue: 1 },
    { day: 12, outingValue: 11, indoorValue: 1 },
    { day: 13, outingValue: 5, indoorValue: 1 },
    { day: 14, outingValue: 5, indoorValue: 2 },
    { day: 15, outingValue: 0, indoorValue: 1 },
    { day: 16, outingValue: 5, indoorValue: 1 },
    { day: 17, outingValue: 0, indoorValue: 2 },
    { day: 18, outingValue: 3, indoorValue: 1 },
    { day: 19, outingValue: 3, indoorValue: 1 },
    { day: 20, outingValue: 3, indoorValue: 1 },
    { day: 21, outingValue: 0, indoorValue: 2 },
    { day: 22, outingValue: 3, indoorValue: 1 },
    { day: 23, outingValue: 0, indoorValue: 1 },
    { day: 24, outingValue: 2, indoorValue: 1 },
    { day: 25, outingValue: 0, indoorValue: 2 },
    { day: 26, outingValue: 0, indoorValue: 1 },
    { day: 27, outingValue: 0, indoorValue: 1 },
    { day: 28, outingValue: 0, indoorValue: 2 },
    { day: 29, outingValue: 0, indoorValue: 1 },
    { day: 30, outingValue: 0, indoorValue: 1 },
    { day: 31, outingValue: 0, indoorValue: 1 },
  ],

  trend: {
    comparisonText: '6월 대비 +93% 증가',
    months: [
      { month: 6, value: 50 },
      { month: 7, value: 70 },
      { month: 8, value: 96 },
    ],
  },

  analysis: {
    strongestDay: {
      title: '8/12 시드니',
      description: '서울 한여름 정오의 2.5배, UV 지수 11',
      tag: '위험',
    },
    missedDays: {
      title: '8/12, 8/19',
      description: '위험한 날이었지만 제품 선택 기록 없음',
    },
    goodDays: {
      title: '8/05, 8/21',
      description: '강한 자외선에도 무기자차로 정확 대응',
      tag: '대응 완료',
    },
  },

  nextMonthForecast: {
    multiplier: 1.8,
    scheduledRoutes: ['시드니 4회', '호놀룰루 2회'],
    recoveryPeriod: '9/20~28 인천 대기',
    tip: '9/20~28 인천 대기 기간 시술 시 충분한 회복 기간 확보 가능합니다',
  },

  clinic: {
    exposureLevel: '상위 구간',
    exposurePercentage: 75,        // ← 추가
    description:
      '3개월 누적 노출이 상위 구간에 진입했습니다...',
    reservationUrl: 'https://wellness-clinic...',
  },
}
