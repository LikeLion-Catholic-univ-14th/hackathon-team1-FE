import FlightInfoBar from './FlightInfoBar.jsx'
import DayUvCard from './DayUvCard.jsx'
import { isFuture } from '../utils/schedule.js'

// 비행 정보 바 + 도시 카드들을 감싸는 바깥 카드
// Figma 실측 — 배경은 외출 토글로 갈린다
//   외출 ON  : 흰색 + #FEF7E6 테두리
//   외출 OFF : #E5E5E5 회색, 테두리 없음
const baseClass =
  'mx-[14px] mt-[12px] flex flex-col items-start gap-[36px] rounded-[22px]'

function DetailCard({ daily, cards, selectedDate, outing, onToggle, onEdit }) {
  const future = isFuture(selectedDate)
  const hasFlight = Boolean(daily?.departureAirport && daily?.arrivalAirport)

  const wrapperClass = outing
    ? `${baseClass} border-[1.276px] border-[#fef7e6] bg-white px-[19.276px] pt-[17.276px] drop-shadow-[0px_4px_9px_rgba(29,43,68,0.06)] ${
        future ? 'pb-[41.276px]' : 'pb-[25.276px]'
      }`
    : `${baseClass} bg-[#e5e5e5] px-[18px] py-[24px]`

  return (
    <div className={wrapperClass}>
      {/* 비행 일정은 외출 여부와 무관한 사실이라 항상 보여준다 */}
      {hasFlight && <FlightInfoBar daily={daily} onEdit={onEdit} />}

      {/* 도시가 1개면 1장, 2개면 2장. 토글은 첫 카드에만 */}
      {cards.map((card, index) => (
        <DayUvCard
          key={card.cityName}
          date={selectedDate}
          info={card}
          outing={outing}
          onToggle={onToggle}
          showToggle={index === 0}
        />
      ))}
    </div>
  )
}

export default DetailCard
