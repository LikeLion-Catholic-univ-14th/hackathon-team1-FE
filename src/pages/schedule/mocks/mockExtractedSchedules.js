// POST /schedules/extract 응답 형태 (ScheduleExtractResponse)
// 실제 연동 전까지 업로드 후 보여줄 더미 추출 결과
export const mockExtractedSchedules = {
  fileName: '8월 스케줄표.jpg',
  schedules: [
    {
      id: 'extract-1',
      flightNumber: 'KE121',
      date: '08/07',
      departureTime: '19:50',
      departureAirport: 'ICN',
      arrivalTime: '06:20',
      arrivalAirport: 'SYD',
      isQuickTurn: false,
    },
    {
      id: 'extract-2',
      flightNumber: 'KE122',
      date: '08/09',
      departureTime: '09:00',
      departureAirport: 'SYD',
      arrivalTime: '18:30',
      arrivalAirport: 'ICN',
      isQuickTurn: false,
    },
    {
      id: 'extract-3',
      flightNumber: 'KE711',
      date: '08/12',
      departureTime: '08:00',
      departureAirport: 'ICN',
      arrivalTime: '10:20',
      arrivalAirport: 'NRT',
      isQuickTurn: true,
    },
  ],
}
