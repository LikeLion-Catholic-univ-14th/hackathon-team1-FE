import sunscreenIcon01 from '../../../assets/sunscreen/sunscreen-icon-01.svg'
import sunscreenIcon02 from '../../../assets/sunscreen/sunscreen-icon-02.svg'
import sunscreenIcon03 from '../../../assets/sunscreen/sunscreen-icon-03.svg'

export const mockHomeData = {
  user: {
    name: '도영',
    date: '2026년 8월 6일 목요일',
    location: '시드니, 호주',
    currentTime: '현지 10:24 AM',
  },
  uvSummary: {
    title: '오늘 자외선 환산',
    updatedAt: '10:24 기준',
    city: '시드니',
    comparison: '= 서울 8월 한낮의 2.5배',
    value: 11,
    badges: ['밖에서 30분 = 서울 75분', '맑음 · 24°C'],
  },
  uvGraph: {
    title: '시간대별 자외선 지수',
    peakLabel: 'UV 9',
    hours: ['06시', '12시', '18시'],
    levels: ['매우 높음', '높음', '보통', '낮음'],
  },
  sunscreens: [
    {
      id: 'home-sunscreen-1',
      name: '아벤느 솔레어',
      type: '선크림',
      method: '무기자차',
      icon: sunscreenIcon01,
      recommended: true,
    },
    {
      id: 'home-sunscreen-2',
      name: '선크림1',
      type: '선크림',
      method: '무기자차',
      icon: sunscreenIcon02,
      recommended: false,
    },
    {
      id: 'home-sunscreen-3',
      name: '아벤느 솔레어',
      type: '선크림',
      method: '무기자차',
      icon: sunscreenIcon03,
      recommended: false,
    },
  ],
  sunscreenTip: {
    tags: ['비오는 날', '자외선 약함'],
    text: '무기자차와 선스틱을 활용하시는 것을 추천해요!',
  },
  solutions: [
    {
      id: 'solution-1',
      icon: 'sun',
      timing: '외출 전',
      title: '무기자차 크림 도포',
      description: '500원 동전 크기 · 얼굴 + 목 뒤 + 귀 + 손등',
    },
    {
      id: 'solution-2',
      icon: 'plane',
      timing: '외출 중',
      title: '선스프레이 보충',
      description: '화장 위에 15cm 거리로 분사',
    },
    {
      id: 'solution-3',
      icon: 'moon',
      timing: '복귀 후',
      title: '클렌징 + 진정',
      description: '더블 클렌징 후 수분 앰플 팩',
    },
  ],
  outdoor: {
    title: '피부 충전 중 ...',
    description: '외출 시, 버튼을 켜서\n맞춤 자외선 처방을 다시 받아보세요.',
  },
}
