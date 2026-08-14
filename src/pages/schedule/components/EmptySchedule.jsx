// 온보딩에서 스케줄을 한 번도 등록하지 않은 사용자에게 보여주는 빈 상태
function EmptySchedule({ onRegister }) {
  return (
    <div className="mx-[14px] mt-[12px] flex flex-col items-center rounded-[20px] bg-white px-[24px] py-[54px]">
      <span className="flex size-[52px] items-center justify-center rounded-full bg-[#e8f3ff] text-[24px] leading-none text-[#3f8ae1]">
        +
      </span>

      <p className="pt-[16px] text-[16px] leading-[21px] font-bold tracking-[-0.64px] text-[#1d2b44]">
        아직 등록된 비행 일정이 없어요
      </p>
      <p className="pt-[6px] text-center text-[13px] leading-[18px] tracking-[-0.64px] text-[#8a9eb8]">
        스케줄표를 올리면 한 달치 자외선 예보를
        <br />
        한눈에 볼 수 있어요
      </p>

      <button
        type="button"
        className="mt-[22px] rounded-[12px] bg-[#f5a623] px-[28px] py-[13px] text-[14px] leading-[21px] font-[860] tracking-[-0.4px] text-white drop-shadow-[0px_3px_6px_rgba(245,166,35,0.32)]"
        onClick={onRegister}
      >
        비행 일정 등록하기
      </button>
    </div>
  )
}

export default EmptySchedule
