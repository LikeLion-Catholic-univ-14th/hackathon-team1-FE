import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts'

// Figma 507:21530 "그래프" 카드 실측
//   그래프 영역   높이 108.771px
//   격자          위에서 5.17px 부터, 5줄, 줄 간격 6px
//   줄 구성       [라벨][선][숫자] — 사이 여백 없음 (justify-end)
//   글자          11px / Regular / 자간 -0.11px / #8a9eb8
//   선            #ECEEF2, 굵기 1.00713, 점선 3.02 / 3.02
//   시각 라벨      10px / 자간 -0.8px, 위에서 94.85% 지점
//   곡선          가로로 왼쪽 13.77% ~ 오른쪽 7.12% 안쪽

const AREA_HEIGHT = 108.771
const GRID_TOP = 5.17
const ROW_HEIGHT = 13
const ROW_GAP = 6

const ROWS = [
  { label: ' 극도로 높음', value: 11 },
  { label: ' 매우 높음', value: 8 },
  { label: '높음', value: 6 },
  { label: '보통', value: 3 },
  { label: '낮음', value: 1 },
]

// 곡선이 닿아야 하는 위·아래 지점 = 첫 줄 / 마지막 줄의 선 높이
const FIRST_LINE_Y = GRID_TOP + ROW_HEIGHT / 2
const LAST_LINE_Y = GRID_TOP + (ROWS.length - 1) * (ROW_HEIGHT + ROW_GAP) + ROW_HEIGHT / 2

// 하루 24시간 기준 가로 위치
const X_LABELS = [
  { text: '06시', at: 6 / 24 },
  { text: '12시', at: 12 / 24 },
  { text: '18시', at: 18 / 24 },
]

const LINE_COLOR = {
  DANGER: '#b55454',
  CAUTION: '#f5a623',
  SAFE: '#3f8ae1',
  INDOOR: '#3f8ae1',
}

// Figma SVG 실측 — CSS border 로는 점선 간격을 못 맞춰서 배경으로 그린다
const gridLineStyle = {
  height: '1.00713px',
  backgroundImage:
    'repeating-linear-gradient(to right, #ECEEF2 0 3.02px, transparent 3.02px 6.04px)',
}

const textClass =
  'shrink-0 text-[11px] font-normal tracking-[-0.11px] text-[#8a9eb8] whitespace-nowrap'

// 곡선 영역 — 시안 실측 비율
const PLOT_LEFT = '13.77%'
const PLOT_RIGHT = '7.12%'

function UvChart({ graph, level = 'CAUTION' }) {
  const color = LINE_COLOR[level] ?? '#f5a623'

  return (
    <div
      className="relative w-full"
      style={{ height: AREA_HEIGHT }}
    >
      {/* 격자 — 라벨 길이가 달라서 줄마다 선 길이가 다르다 */}
      <div
        className="absolute inset-x-0 flex flex-col items-center"
        style={{ top: GRID_TOP, gap: ROW_GAP }}
      >
        {ROWS.map((row) => (
          <div
            key={row.value}
            className="flex w-full items-center justify-end"
            style={{ height: ROW_HEIGHT }}
          >
            <p className={textClass}>{row.label}</p>
            <div className="flex-1" style={gridLineStyle} />
            <p className={textClass}>{row.value}</p>
          </div>
        ))}
      </div>

      {/* 곡선 — 맨 아래 선이 1, 맨 위 선이 11 */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: PLOT_LEFT,
          right: PLOT_RIGHT,
          top: FIRST_LINE_Y,
          bottom: AREA_HEIGHT - LAST_LINE_Y,
        }}
      >
        <ResponsiveContainer>
          <AreaChart data={graph} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`uvFill-${level}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <YAxis domain={[1, 11]} hide />

            <Area
              type="monotone"
              dataKey="uvValue"
              stroke={color}
              strokeWidth={2}
              fill={`url(#uvFill-${level})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 시각 라벨 — 곡선 영역에 맞춰 배치 */}
      <div
        className="absolute"
        style={{
          left: PLOT_LEFT,
          right: PLOT_RIGHT,
          top: AREA_HEIGHT * 0.9485,
        }}
      >
        {X_LABELS.map((item) => (
          <p
            key={item.text}
            className="absolute -translate-x-1/2 text-[10px] font-normal tracking-[-0.8px] whitespace-nowrap text-[#8a9eb8]"
            style={{ left: `${item.at * 100}%` }}
          >
            {item.text}
          </p>
        ))}
      </div>
    </div>
  )
}

export default UvChart
