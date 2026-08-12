import { useMemo, useState } from 'react'
import tabIcon from '../assets/icons/tab.svg'
import { headingFontClass } from './homeStyles.js'

const chart = {
  width: 236,
  height: 96,
  top: 10,
  bottom: 80,
  maxUv: 11,
}

const defaultPoints = [
  { x: 0, uv: 1 },
  { x: 32, uv: 1 },
  { x: 58, uv: 1.1 },
  { x: 76, uv: 2.6 },
  { x: 94, uv: 5.6 },
  { x: 107, uv: 8.4 },
  { x: 118, uv: 9 },
  { x: 132, uv: 8.2 },
  { x: 148, uv: 5.7 },
  { x: 164, uv: 2.5 },
  { x: 184, uv: 1.1 },
  { x: 236, uv: 1 },
]

const uvTicks = [11, 8, 6, 3, 1]
const defaultLevels = ['극도로 높음', '매우 높음', '높음', '보통', '낮음']
const defaultHours = ['06시', '12시', '18시']

const getYFromUv = (uv) => {
  const range = chart.bottom - chart.top
  const safeUv = Math.min(Math.max(uv, 1), chart.maxUv)

  return chart.bottom - (safeUv - 1) * (range / 10)
}

const normalizePoints = (points = defaultPoints) => {
  const source = points.length > 0 ? points : defaultPoints
  const maxX = Math.max(...source.map((point) => point.x), 1)

  if (maxX === chart.width) {
    return source
  }

  return source.map((point) => ({
    ...point,
    x: (point.x / maxX) * chart.width,
  }))
}

const buildSmoothPath = (points) =>
  points.reduce((path, point, index) => {
    const x = point.x
    const y = getYFromUv(point.uv)

    if (index === 0) {
      return `M${x} ${y}`
    }

    const previous = points[index - 1]
    const previousX = previous.x
    const previousY = getYFromUv(previous.uv)
    const controlX = (previousX + x) / 2

    return `${path} C${controlX} ${previousY} ${controlX} ${y} ${x} ${y}`
  }, '')

const interpolateUv = (x, points) => {
  const localX = Math.min(Math.max(x, points[0].x), points[points.length - 1].x)
  const nextIndex = points.findIndex((point) => point.x >= localX)

  if (nextIndex <= 0) {
    return Math.round(points[0].uv)
  }

  const previous = points[nextIndex - 1]
  const next = points[nextIndex]
  const progress = (localX - previous.x) / (next.x - previous.x || 1)

  return Math.round(previous.uv + (next.uv - previous.uv) * progress)
}

function UvGraph({ graph = {}, className = '' }) {
  const points = useMemo(() => normalizePoints(graph.points), [graph.points])
  const path = useMemo(() => buildSmoothPath(points), [points])
  const levels = graph.levels?.length === 5 ? graph.levels : defaultLevels
  const hours = graph.hours?.length ? graph.hours : defaultHours

  const [selectedPoint, setSelectedPoint] = useState(() => {
    const peakPoint = points.reduce(
      (peak, point) => (point.uv > peak.uv ? point : peak),
      points[0],
    )

    return {
      x: peakPoint.x,
      uv: Math.round(peakPoint.uv),
    }
  })

  const selectedY = getYFromUv(selectedPoint.uv)
  const markerPercent = (selectedPoint.x / chart.width) * 100
  const markerLabelX = Math.min(Math.max(selectedPoint.x, 19), chart.width - 19)

  const handleSelectPoint = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const nextX = ((event.clientX - rect.left) / rect.width) * chart.width
    const clampedX = Math.min(Math.max(nextX, 0), chart.width)
    const nextUv = interpolateUv(clampedX, points)

    setSelectedPoint({
      x: clampedX,
      uv: Math.min(Math.max(nextUv, 1), chart.maxUv),
    })
  }

  return (
    <section
      className={`rounded-[20px] bg-white px-[16px] pb-[14px] pt-[16px] shadow-[0_4px_18px_0_rgba(29,43,68,0.06)] ${className}`}
    >
      <h3
        className={`m-0 translate-y-[2px] text-[15px] font-bold leading-[15px] tracking-[-1.2px] text-[#1D2B44] ${headingFontClass}`}
      >
        {graph.title || '시간대별 자외선 지수'}
      </h3>

      <div className="mt-[13px] grid grid-cols-[68px_minmax(0,1fr)_18px] grid-rows-[96px_18px] gap-x-[4px]">
        <div
          className={`relative col-start-1 row-start-1 h-[96px] text-center text-[9.6px] font-normal leading-normal tracking-[-0.096px] text-[#8a9eb8] ${headingFontClass}`}
        >
          {levels.map((level, index) => (
            <span
              className="absolute left-0 whitespace-nowrap"
              key={level}
              style={{ top: `${getYFromUv(uvTicks[index]) - 7}px` }}
            >
              {level}
            </span>
          ))}
        </div>

        <div className="relative col-start-2 row-start-1 h-[96px] min-w-0">
          <svg
            className="absolute inset-0 h-full w-full cursor-pointer overflow-visible"
            viewBox={`0 0 ${chart.width} ${chart.height}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="시간대별 자외선 그래프"
            role="img"
            onClick={handleSelectPoint}
          >
            <defs>
              <linearGradient id="uvHomeFill" x1="118" y1="25" x2="118" y2="80">
                <stop stopColor="#F5A623" stopOpacity="0.58" />
                <stop offset="1" stopColor="#F5A623" stopOpacity="0" />
              </linearGradient>
            </defs>

            {uvTicks.map((tick) => {
              const y = getYFromUv(tick)

              return (
                <path
                  key={tick}
                  d={`M0 ${y}H${chart.width}`}
                  stroke="#E8EDF4"
                  strokeDasharray="3 5"
                  strokeWidth="1"
                />
              )
            })}

            <path
              d={`${path} L${chart.width} ${chart.bottom} L0 ${chart.bottom}Z`}
              fill="url(#uvHomeFill)"
            />
            <path
              d={path}
              stroke="#F5A623"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={`M${selectedPoint.x} ${selectedY}V${chart.bottom}`}
              stroke="#F5A623"
              strokeDasharray="3 4"
              strokeWidth="1.4"
            />
            <rect x="0" y="0" width={chart.width} height={chart.height} fill="transparent" />
          </svg>

          <div
          className={`pointer-events-none absolute inline-flex h-[16px] -translate-x-1/2 items-center justify-center rounded-[20px] bg-[#F5A623] px-[7px] text-center text-[9.6px] font-bold leading-none tracking-[-0.096px] text-white ${headingFontClass}`}
            style={{
              fontFamily: '"SF Pro Rounded", "SF_Pro", Arial, sans-serif',
              left: `${(markerLabelX / chart.width) * 100}%`,
              top: `${Math.max(selectedY - 28, 0)}px`,
            }}
          >
            UV {selectedPoint.uv}
          </div>

          <img
            className="pointer-events-none absolute h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2"
            src={tabIcon}
            alt=""
            aria-hidden="true"
            style={{
              left: `${markerPercent}%`,
              top: `${selectedY}px`,
            }}
          />
        </div>

        <div
          className={`relative col-start-3 row-start-1 h-[96px] text-center text-[9.6px] font-normal leading-normal tracking-[-0.096px] text-[#8a9eb8] ${headingFontClass}`}
        >
          {uvTicks.map((tick) => (
            <span
              className="absolute right-0"
              key={tick}
              style={{ top: `${getYFromUv(tick) - 7}px` }}
            >
              {tick}
            </span>
          ))}
        </div>

        <div
          className={`col-start-2 row-start-2 mt-[2px] flex justify-between px-[36px] text-center text-[10px] font-normal leading-normal tracking-[-0.1px] text-[#8a9eb8] ${headingFontClass}`}
        >
          {hours.map((hour) => (
            <span key={hour}>{hour}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default UvGraph
