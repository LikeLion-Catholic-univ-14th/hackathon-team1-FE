import { headingFontClass } from './homeStyles.js'

function UvGraph({ graph }) {
  return (
    <section className="mt-[12px] rounded-[16px] bg-white px-[16px] py-[15px] shadow-[0_4px_18px_0_rgba(29,43,68,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <h3
          className={`m-0 text-[12px] font-bold leading-[18px] tracking-[-0.4px] text-[#1d2b44] ${headingFontClass}`}
        >
          {graph.title}
        </h3>
        <span
          className={`rounded-full bg-[#f5a623] px-[6px] py-[2px] text-[8px] font-bold leading-[10px] tracking-[-0.2px] text-white ${headingFontClass}`}
        >
          {graph.peakLabel}
        </span>
      </div>

      <div className="mt-[9px] grid grid-cols-[48px_minmax(0,1fr)] items-end gap-[7px]">
        <div
          className={`flex h-[96px] flex-col justify-between text-[8px] font-[510] leading-[11px] tracking-[-0.3px] text-[#8a9eb8] ${headingFontClass}`}
        >
          {graph.levels.map((level) => (
            <span key={level}>{level}</span>
          ))}
        </div>

        <div className="min-w-0">
          <svg
            className="h-[96px] w-full overflow-visible"
            viewBox="0 0 234 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="시간대별 자외선 그래프"
          >
            <defs>
              <linearGradient id="uvHomeFill" x1="117" y1="23" x2="117" y2="82">
                <stop stopColor="#F5A623" stopOpacity="0.6" />
                <stop offset="1" stopColor="#F5A623" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[20, 39, 58, 77].map((y) => (
              <path
                key={y}
                d={`M0 ${y}H234`}
                stroke="#E8EDF4"
                strokeDasharray="3 4"
                strokeWidth="1"
              />
            ))}
            <path
              d="M0 77C26 77 41 77 57 76C73 75 81 72 88 60C95 48 97 31 111 29C127 27 133 52 144 63C157 77 178 77 234 77"
              fill="url(#uvHomeFill)"
            />
            <path
              d="M0 77C26 77 41 77 57 76C73 75 81 72 88 60C95 48 97 31 111 29C127 27 133 52 144 63C157 77 178 77 234 77"
              stroke="#F5A623"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="111" cy="29" r="4.5" fill="white" stroke="#F5A623" strokeWidth="2" />
          </svg>

          <div
            className={`mt-[2px] flex justify-between px-[7px] text-[8px] font-[510] leading-[11px] tracking-[-0.3px] text-[#8a9eb8] ${headingFontClass}`}
          >
            {graph.hours.map((hour) => (
              <span key={hour}>{hour}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default UvGraph
