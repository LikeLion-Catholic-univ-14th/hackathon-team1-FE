export const mockDailyDetail = {
  scheduleId: 105,
  departureAirport: 'ICN',
  arrivalAirport: 'SYD',
  departureTime: '2026-08-09T09:00:00',
  arrivalTime: '2026-08-09T13:00:00',

  departureInfo: {
    cityName: '인천',
    displayDate: '8월 8일 (토)',
    timeDifference: null,
    isOuting: true,
    riskLevel: 'DANGER',
    uvDetail: {
      warningMessage: '09~17시 자외선 주의 ㅡ SPF 50+ 권장',
      graph: [
        { time: '00:00', uvValue: 0 },
        { time: '03:00', uvValue: 0 },
        { time: '06:00', uvValue: 2 },
        { time: '09:00', uvValue: 6 },
        { time: '12:00', uvValue: 11 },
        { time: '15:00', uvValue: 7 },
        { time: '18:00', uvValue: 2 },
        { time: '21:00', uvValue: 0 },
        { time: '24:00', uvValue: 0 },
      ],
    },
  },

  arrivalInfo: {
    cityName: '시드니',
    displayDate: '8월 8일 (토)',
    timeDifference: '한국 +1시간',
    isOuting: false,
    riskLevel: 'CAUTION',
    uvDetail: {
      warningMessage: '09~17시 자외선 주의 ㅡ SPF 50+ 권장',
      graph: [
        { time: '00:00', uvValue: 0 },
        { time: '03:00', uvValue: 0 },
        { time: '06:00', uvValue: 1 },
        { time: '09:00', uvValue: 4 },
        { time: '12:00', uvValue: 8 },
        { time: '15:00', uvValue: 5 },
        { time: '18:00', uvValue: 1 },
        { time: '21:00', uvValue: 0 },
        { time: '24:00', uvValue: 0 },
      ],
    },
  },
}