const headingFontClass =
  "font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"

const cardGradient =
  'linear-gradient(137.07deg, #1B3A61 0%, #345072 49.52%, #3E6495 100%)'

function NextMonthCard({ month, forecast }) {
  return (
    <section
      className={`mx-4 mt-3 rounded-[22px] px-[22px] pt-[22px] pb-[28px] drop-shadow-[0px_12px_18px_rgba(29,43,68,0.22)] ${headingFontClass}`}
      style={{ backgroundImage: cardGradient }}
    >
      <div className="px-[8px] pt-[6px]">
        <div className="border-b-[0.4px] border-[rgba(138,158,184,0.6)] pb-[12px]">
          <p className="text-[14px] leading-[15px] font-[590] tracking-[-1px] text-[#8a9eb8]">
            다음 달 예보
          </p>
        </div>
      </div>

      <div className="pt-[24px] pl-[8px] tracking-[-2px] text-white">
        <p className="text-[24px] leading-[25.65px] font-[1000]">
          {month + 1}월은 이번 달보다
        </p>
        <p className="font-[1000]">
          <span className="text-[35px] leading-[44px] text-[#f5a623]">
            {forecast.multiplier}배
          </span>
          <span className="text-[35px] leading-[44px]"> </span>
          <span className="text-[24px] leading-[25.65px]">위험합니다!</span>
        </p>
      </div>

      <div className="flex gap-[8px] pt-[16px]">
        <div className="flex-1 rounded-[14px] border-[1.276px] border-[rgba(255,240,240,0.3)] bg-[rgba(255,240,240,0.3)] p-[13.276px]">
          <p className="px-[2px] text-[12px] leading-[15px] font-[510] tracking-[-0.64px] text-white">
            예정 노선
          </p>
          <p className="px-[2px] pt-[8px] text-[13px] leading-[19.5px] font-bold tracking-[-0.64px] whitespace-nowrap text-white">
            {forecast.scheduledRoutes.join(' · ')}
          </p>
        </div>

        <div className="flex-1 rounded-[14px] border-[1.276px] border-[rgba(92,156,230,0.45)] bg-[rgba(92,156,230,0.45)] p-[13.276px]">
          <p className="px-[2px] text-[12px] leading-[15px] font-[510] tracking-[-0.64px] text-white">
            회복 구간
          </p>
          <p className="px-[2px] pt-[8px] text-[13px] leading-[19.5px] font-bold tracking-[-0.64px] whitespace-nowrap text-white">
            {forecast.recoveryPeriod}
          </p>
        </div>
      </div>

      <div className="pt-[20px]">
        <div className="flex items-center justify-center rounded-[16px] border-2 border-[rgba(255,255,255,0.5)] bg-[rgba(255,255,255,0.8)] px-[16px] py-[18px] shadow-[0px_3px_12px_0px_#1d2b44]">
          <p className="text-center text-[14px] leading-[19px] font-[510] tracking-[-1px] text-[#1d2b44]">
            {forecast.tip}
          </p>
        </div>
      </div>
    </section>
  )
}

export default NextMonthCard