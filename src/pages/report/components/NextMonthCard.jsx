function NextMonthCard({ month, forecast }) {
  return (
    <section className="mx-4 my-3 rounded-[20px] bg-[#2c3e5c] px-[22px] py-6 text-white">
      <p className="text-[12px] opacity-70">다음 달 예보</p>

      <p className="mt-5 text-[22px] leading-snug font-bold">
        {month + 1}월은 이번 달보다
        <br />
        <span className="text-[#f5a623]">{forecast.multiplier}배</span> 위험합니다!
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/10 px-3.5 py-3">
          <p className="text-[12px] opacity-70">예정 노선</p>
          <p className="mt-1.5 text-[14px]">{forecast.scheduledRoutes.join(' · ')}</p>
        </div>
        <div className="rounded-xl bg-white/10 px-3.5 py-3">
          <p className="text-[12px] opacity-70">회복 구간</p>
          <p className="mt-1.5 text-[14px]">{forecast.recoveryPeriod}</p>
        </div>
      </div>

      <p className="mt-4 rounded-xl bg-white/10 px-4 py-3.5 text-center text-[13px]">
        {forecast.tip}
      </p>
    </section>
  )
}

export default NextMonthCard