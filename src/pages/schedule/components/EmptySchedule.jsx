// 온보딩에서 스케줄을 한 번도 등록하지 않은 사용자에게 보여주는 빈 상태
// Figma 실측 (일정 ㅡ 미등록) — 버튼 없이 안내 문구만 있다
function EmptySchedule() {
  return (
    <div className="flex flex-col items-center px-[14px] pt-[12px]">
      <div className="flex w-[358px] flex-col items-center gap-[12px] rounded-[22px] bg-white px-[15px] py-[80px]">
        <span
          className="flex size-[24px] items-center justify-center text-[20px] leading-none text-[rgba(29,43,68,0.5)]"
          aria-hidden="true"
        >
          ···
        </span>

        <p className="text-center text-[15px] leading-[24px] font-[510] tracking-[-1.4px] text-[rgba(29,43,68,0.5)]">
          아직 등록된 비행 일정이 없어요
          <br />
          일정을 등록해주세요
        </p>
      </div>
    </div>
  )
}

export default EmptySchedule
