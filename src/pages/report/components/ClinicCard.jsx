const headingFontClass =
  "font-[SF_Pro,Pretendard,sans-serif]"

const headerGradient =
  'linear-gradient(150.18deg, #1B3A61 0%, #345072 49.52%, #3E6495 100%)'

function ClinicCard({ month, clinic, onSavePdf, saving }) {
  return (
    <section
      className={`mx-4 mt-3 overflow-hidden rounded-[22px] bg-white shadow-[0px_4px_18px_0px_rgba(29,43,68,0.06)] ${headingFontClass}`}
    >
      {/* 위쪽 — 남색 그라데이션 */}
      <div
        className="px-[20px] pt-[26px] pb-[24px]"
        style={{ backgroundImage: headerGradient }}
      >
        <div className="px-[4px]">
          <div className="border-b-[0.4px] border-[rgba(138,158,184,0.6)] pb-[12px] pl-[4px]">
            <p className="text-[14px] leading-[15px] font-[590] tracking-[-1px] text-[#8a9eb8]">
              클리닉 연결
            </p>
          </div>
          <p className="pt-[16px] pb-[8px] pl-[5px] text-[24px] leading-[20px] font-bold tracking-[-1px] text-white">
            {month}월 리포트
          </p>
        </div>

        <div className="pt-[12px]">
          <div className="rounded-[14px] bg-[rgba(255,255,255,0.08)] px-[19px] py-[18px]">
            <p className="px-[2px] text-[13px] leading-[16.5px] font-[510] tracking-[-0.64px] text-white/60">
              누적 노출 수준
            </p>

            <div className="flex items-center gap-[8px] pt-[4px]">
              <div className="h-[6px] flex-1 overflow-hidden rounded-[99px] bg-[rgba(255,255,255,0.12)]">
                <div
                  className="h-full rounded-[99px] bg-gradient-to-r from-[#f5a623] to-[#ffd166] transition-[width] duration-700 ease-out"
                  style={{ width: `${clinic.exposurePercentage}%` }}
                />
              </div>
              <p className="text-[14px] leading-[18px] font-bold tracking-[-0.64px] text-[#f5a623]">
                {clinic.exposureLevel}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 아래쪽 — 흰 배경 */}
      <div className="flex flex-col gap-[8px] px-[20px] pt-[18px] pb-[22px]">
        <p className="px-[6px] pt-[4px] pb-[12px] text-[15px] leading-[22.1px] font-[510] tracking-[-0.64px] text-[#3a506b]">
          {clinic.description}
        </p>

        <a
          className="flex h-[52.5px] items-center justify-center rounded-[14px] bg-[#f5a623] text-[16px] leading-[22.5px] font-[860] tracking-[-1px] text-white drop-shadow-[0px_3px_6px_rgba(245,166,35,0.32)]"
          href={clinic.reservationUrl}
          target="_blank"
          rel="noreferrer"
        >
          웰니스하우스 서울 예약하기 →
        </a>

        {/* data-pdf-hide — 저장된 PDF 안에는 이 버튼이 찍히지 않게 한다 */}
        <div
          data-pdf-hide="true"
          className="flex justify-center gap-[24px] pt-[12px]"
        >
          <button
            type="button"
            disabled={saving}
            onClick={onSavePdf}
            className="text-[13px] leading-[19.5px] tracking-[-0.64px] text-[#8a9eb8] disabled:opacity-50"
          >
            {saving ? 'PDF 만드는 중...' : 'PDF 저장하기'}
          </button>
        </div>
      </div>
    </section>
  )
}

export default ClinicCard