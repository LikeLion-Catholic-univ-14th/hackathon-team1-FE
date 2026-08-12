import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

const TICKS = [1, 3, 6, 8, 11]
const UV_LABEL = { 1: '낮음', 3: '보통', 6: '높음', 8: '매우 높음', 11: '극도로 높음' }

const LINE_COLOR = {
  DANGER: '#f5a623',
  CAUTION: '#f5a623',
  SAFE: '#3f8ae1',
  INDOOR: '#3f8ae1',
}

function UvChart({ graph, level = 'CAUTION' }) {
  const color = LINE_COLOR[level]

  return (
    <div className="h-[130px] w-full">
      <ResponsiveContainer>
        <AreaChart data={graph} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`uvFill-${level}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="time"
            ticks={['06:00', '12:00', '18:00']}
            tickFormatter={(t) => `${t.slice(0, 2)}시`}
            tickLine={false}
            axisLine={false}
            fontSize={10}
            stroke="#8a9eb8"
          />

          {/* 왼쪽: 한글 라벨 + 점선 그리드 */}
          <YAxis
            domain={[0, 12]}
            ticks={TICKS}
            tickFormatter={(v) => UV_LABEL[v]}
            tickLine={false}
            axisLine={false}
            width={62}
            fontSize={11}
            stroke="#8a9eb8"
          />

          {/* 오른쪽: 숫자 */}
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 12]}
            ticks={TICKS}
            tickLine={false}
            axisLine={false}
            width={20}
            fontSize={11}
            stroke="#8a9eb8"
          />

          <Area
            type="monotone"
            dataKey="uvValue"
            stroke={color}
            strokeWidth={2}
            fill={`url(#uvFill-${level})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default UvChart