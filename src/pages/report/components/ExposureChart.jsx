import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
} from 'recharts'

const headingFontClass =
  "font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"

function ExposureChart({ dailyExposure, trend }) {
  return (
    <section
      className={`mx-4 mt-3 rounded-[22px] bg-white px-[18px] py-[24px] drop-shadow-[0px_4px_9px_rgba(29,43,68,0.06)] ${headingFontClass}`}
    >
      <div className="px-[4px]">
        <div className="border-b-[0.4px] border-[rgba(138,158,184,0.6)] pb-[12px]">
          <p className="text-[14px] leading-[15px] font-[590] tracking-[-1px] text-[#8a9eb8]">
            노출량 그래프
          </p>
        </div>

        <div className="flex items-end justify-between pt-[12px] pb-[8px]">
          <p className="text-[20px] leading-[20px] font-bold tracking-[-1px] text-[#1d2b44]">
            일별 노출량
          </p>

          <div className="flex gap-[10px] px-[3px]">
            <span className="flex items-center gap-[4px]">
              <i className="block size-[10px] rounded-[2px] bg-[#ff6b4a]" />
              <span className="text-[12px] leading-[16.5px] tracking-[-1px] text-[#8a9eb8]">
                외출
              </span>
            </span>
            <span className="flex items-center gap-[4px]">
              <i className="block size-[10px] rounded-[2px] bg-[#a8b8cc]" />
              <span className="text-[12px] leading-[16.5px] tracking-[-1px] text-[#8a9eb8]">
                실내
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="h-[110px] pt-[8px]">
        <ResponsiveContainer>
          <BarChart data={dailyExposure} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="barOuting" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B4A" />
                <stop offset="100%" stopColor="#F5A623" />
              </linearGradient>
              <linearGradient id="barIndoor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A8B8CC" />
                <stop offset="100%" stopColor="#ECEEF2" />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="day"
              ticks={[1, 8, 15, 22, 31]}
              tickLine={false}
              axisLine={false}
              fontSize={11}
              stroke="#8a9eb8"
            />

            <Bar
              dataKey="indoorValue"
              stackId="a"
              fill="url(#barIndoor)"
              barSize={7.4}
            />
            <Bar
              dataKey="outingValue"
              stackId="a"
              fill="url(#barOuting)"
              barSize={7.4}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-px w-full bg-[#eceef2]" />

      <p className="pt-[20px] pl-[4px] text-[20px] leading-[20px] font-bold tracking-[-1px] text-[#1d2b44]">
        3개월 추이
      </p>

      <div className="h-[110px] pt-[12px]">
        <ResponsiveContainer>
          <AreaChart data={trend.months} margin={{ top: 12, right: 20, bottom: 0, left: 20 }}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f5a623" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#f5a623" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="month"
              tickFormatter={(m) => `${m}월`}
              tickLine={false}
              axisLine={false}
              fontSize={13}
              stroke="#8a9eb8"
            />

            <Area
              type="linear"
              dataKey="value"
              stroke="#f5a623"
              strokeWidth={2}
              fill="url(#trendFill)"
              dot={{ r: 4.5, fill: '#ffffff', stroke: '#f5a623', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-[22px] flex items-center justify-center rounded-[12px] bg-[#fff2df] py-[12px]">
        <p className="text-center text-[14px] leading-[18px] font-[510] tracking-[-0.64px] text-[#f5a623]">
          {trend.comparisonText}
        </p>
      </div>
    </section>
  )
}

export default ExposureChart