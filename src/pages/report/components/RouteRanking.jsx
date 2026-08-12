const headingFontClass =
  "font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"

const BAR_COLOR = ['#ff6b4a', '#f5a623', '#5c9ce6', '#8a9eb8']

function RouteRanking({ routeRanking }) {
  return (
    <section
      className={`mx-4 mt-3 flex flex-col gap-[9px] rounded-[22px] bg-white px-[18px] py-[24px] drop-shadow-[0px_4px_9px_rgba(29,43,68,0.06)] ${headingFontClass}`}
    >
      <div className="px-[4px]">
        <div className="border-b-[0.4px] border-[rgba(138,158,184,0.6)] pb-[12px]">
          <p className="text-[14px] font-[590] tracking-[-1px] text-[#8a9eb8]">
            이번 달 자외선의 원인
          </p>
        </div>
        <p className="pt-[12px] pb-[8px] text-[20px] font-bold tracking-[-1px] text-[#1d2b44]">
          노선별 순위
        </p>
      </div>

      <div className="px-[8px] py-[4px]">
        {routeRanking.rankings.map((item, index) => (
          <div className="px-[8px] pt-[14px] first:pt-0" key={item.route}>
            <div className="flex h-[21px] items-start justify-between">
              <p className="tracking-[-0.64px] whitespace-nowrap">
                <span className="text-[16px] leading-[21px] font-bold text-[#1d2b44]">
                  {item.route}
                </span>
                {item.count > 0 && (
                  <>
                    <span className="text-[14px] leading-[21px] font-bold text-[#8a9eb8]">
                      {' · '}
                    </span>
                    <span className="text-[14px] leading-[18px] text-[#8a9eb8]">
                      {item.count}번
                    </span>
                  </>
                )}
              </p>

              <p
                className="text-[16px] leading-[21px] font-[860] tracking-[-1px]"
                style={{ color: BAR_COLOR[index] }}
              >
                {item.percentage}%
              </p>
            </div>

            <div className="pt-[6px]">
              <div className="h-[8px] w-full overflow-hidden rounded-[99px] bg-[#f0f2f6]">
                <div
                  className="h-full rounded-[99px] transition-[width] duration-700 ease-out"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundImage: `linear-gradient(to right, ${BAR_COLOR[index]}, ${BAR_COLOR[index]}99)`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center rounded-[12px] bg-[#e8f3ff] px-[19px] py-[12px]">
        <p className="text-[14px] leading-[16.5px] font-bold tracking-[-0.64px] text-[#5c9ce6]">
          {routeRanking.insightMessage}
        </p>
      </div>
    </section>
  )
}

export default RouteRanking