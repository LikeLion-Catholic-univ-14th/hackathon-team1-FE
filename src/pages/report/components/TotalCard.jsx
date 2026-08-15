const headingFontClass =
  "font-[SF_Pro,Pretendard,sans-serif]"

const cardGradient =
  'linear-gradient(154.88deg, #FF8C42 0%, #F5A623 55%, #FFD166 100%)'

function TotalCard({ month, summary }) {
  return (
    <section
      className={`mx-4 mt-3 overflow-hidden rounded-[24px] p-[22px] shadow-[0px_10px_32px_0px_rgba(245,140,50,0.28)] ${headingFontClass}`}
      style={{ backgroundImage: cardGradient }}
    >
    <div className="pb-[9px]">
  <p className="text-[14px] leading-[15px] font-bold tracking-[-1px] text-white/70">
    {month}월 UV 지수 노출량
  </p>
</div>
<div className="h-px w-full bg-[#eceef2] opacity-40" />

      <div className="px-[4px] pt-[10px] pb-[4px]">
        <p className="py-[4px] tracking-[-2.52px] text-white whitespace-pre">
          <span className="text-[42px] leading-[42px] font-[860]">
            {summary.equivalentDaysInSeoul}{' '}
          </span>
          <span className="text-[20px] leading-[18px] font-[1000]">일 동안</span>
        </p>

        <div className="pt-[7px] text-[14px] font-[510] tracking-[-1px] text-white/80">
          <p className="leading-[18px]">서울에서 밖에 있던 것과 같음</p>
          <p className="leading-[18px]">
            실제 외출 {summary.actualOutingHours}시간이지만 UV가 셌어요
          </p>
        </div>
      </div>
    </section>
  )
}

export default TotalCard