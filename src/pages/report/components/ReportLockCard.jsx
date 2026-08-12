import lockIcon from '../assets/lock.svg'

const headingFontClass =
  "font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"

function ReportLockCard({ month, onOpen }) {
  return (
    <section
      className={`mx-4 mt-3 flex flex-col items-center justify-center gap-[18px] rounded-[20px] border-[1.276px] border-[#eceef2] bg-white px-[13.276px] py-[17.276px] drop-shadow-[0px_12px_20px_rgba(29,43,68,0.14)] ${headingFontClass}`}
    >
      <div className="flex size-[48px] items-center justify-center rounded-full bg-[#e8f3ff]">
        <img className="size-[22px]" src={lockIcon} alt="" />
      </div>

      <div className="flex flex-col items-center">
        <p className="text-[16px] leading-[21px] font-bold tracking-[-0.64px] text-[#1d2b44]">
          {month}월 리포트
        </p>
        <p className="pt-[3px] text-[13px] leading-[16.5px] tracking-[-0.64px] text-[#8a9eb8]">
          클리닉 연동 동의 후 열람 가능해요.
        </p>
      </div>

      <button
        type="button"
        className="rounded-[10px] bg-[#f5a623] px-[96px] py-[8px] text-[13px] leading-[19.5px] font-[590] tracking-[-0.64px] text-white drop-shadow-[0px_4px_7px_rgba(245,166,35,0.3)]"
        onClick={onOpen}
      >
        리포트 열람하기
      </button>
    </section>
  )
}

export default ReportLockCard