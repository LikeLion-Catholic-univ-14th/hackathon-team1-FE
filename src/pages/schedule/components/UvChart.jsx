import { useLayoutEffect, useRef, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts'

// Figma 507:21532 "그래프 배경" 실측
//   5줄, 줄 간격 6px, 글자 11px / SF Pro Regular / 자간 -0.11px / #8a9eb8
//   선은 라벨 오른쪽부터 숫자 앞까지 — 라벨 길이가 달라서 줄마다 길이가 다르다
//   (243 / 255 / 278 / 279 / 280px)
// 그래서 recharts 의 CartesianGrid 를 쓰지 않고 격자를 직접 그린다.
const ROWS = [
  { label: '극도로 높음', value: 11 },
  { label: '매우 높음', value: 8 },
  { label: '높음', value: 6 },
  { label: '보통', value: 3 },
  { label: '낮음', value: 1 },
]

// 가로축 — 하루(24시간) 기준 위치
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

// Figma SVG 실측 — stroke #ECEEF2, 굵기 1.00713, 점선 3.02 / 3.02
// CSS border-dashed 로는 점선 간격을 못 맞춰서 배경 그라데이션으로 그린다
const GRID_LINE_STYLE = {
  height: '1.00713px',
  backgroundImage:
    'repeating-linear-gradient(to right, #ECEEF2 0 3.02px, transparent 3.02px 6.04px)',
}

const labelClass =
  'shrink-0 text-[11px] leading-[13px] font-normal tracking-[-0.11px] text-[#8a9eb8] whitespace-nowrap'

function UvChart({ graph, level = 'CAUTION' }) {
  const color = LINE_COLOR[level] ?? '#f5a623'

  // 곡선은 격자와 정확히 겹쳐야 한다.
  // 맨 아래 줄(가장 긴 선)의 위치를 재서 그래프 영역을 맞춘다
  const lastLineRef = useRef(null)
  const boxRef = useRef(null)
  const [plot, setPlot] = useState({ left: 0, width: 0 })

  useLayoutEffect(() => {
    const measure = () => {
      if (!lastLineRef.current || !boxRef.current) {
        return
      }

      const line = lastLineRef.current.getBoundingClientRect()
      const box = boxRef.current.getBoundingClientRect()

      setPlot({ left: line.left - box.left, width: line.width })
    }

    measure()
    window.addEventListener('resize', measure)

    return () => window.removeEventListener('resize', measure)
  }, [])

  // 줄 높이 13px, 간격 6px → 첫 줄 중심 6.5px, 마지막 줄 중심 아래 6.5px
  const halfRow = 6.5

  return (
    <div className="w-full px-[16px]">
      <div ref={boxRef} className="relative">
        {/* 격자 — 시안대로 줄마다 선 길이가 다르다 */}
        <div className="flex flex-col items-center gap-[6px]">
          {ROWS.map((row, index) => (
            <div key={row.value} className="flex w-full items-center justify-end">
              <p className={labelClass}>{row.label}</p>

              <div
                ref={index === ROWS.length - 1 ? lastLineRef : null}
                className="mx-[8px] flex-1"
                style={GRID_LINE_STYLE}
              />

              <p className={`${labelClass} w-[16px] text-center`}>{row.value}</p>
            </div>
          ))}
        </div>

        {/* 곡선 — 격자 위에 겹친다. 축·격자는 전부 끈다 */}
        <div
          className="pointer-events-none absolute"
          style={{
            left: plot.left,
            width: plot.width,
            top: halfRow,
            bottom: halfRow,
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

              {/* 맨 아래 선이 1, 맨 위 선이 11 */}
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
      </div>

      {/* 가로축 — 그래프 영역에 맞춰 배치 */}
      <div className="relative mt-[8px] h-[13px]">
        {X_LABELS.map((item) => (
          <p
            key={item.text}
            className={`${labelClass} absolute -translate-x-1/2`}
            style={{ left: plot.left + plot.width * item.at }}
          >
            {item.text}
          </p>
        ))}
      </div>
    </div>
  )
}

export default UvChart
