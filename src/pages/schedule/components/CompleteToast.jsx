// 등록/수정 완료 알림. 시안의 "비행 일정이 등록되었어요" 토스트
function CompleteToast({ message, onDismiss }) {
  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-[rgba(29,43,68,0.35)] px-[40px]"
      role="button"
      tabIndex={0}
      onClick={onDismiss}
      onKeyDown={onDismiss}
    >
      <div className="flex w-full flex-col items-center rounded-[20px] bg-white px-[24px] py-[28px] drop-shadow-[0px_12px_20px_rgba(29,43,68,0.14)]">
        <span className="flex size-[44px] items-center justify-center rounded-full bg-[#f5a623] text-[20px] leading-none text-white">
          ✓
        </span>
        <p className="pt-[14px] text-center text-[15px] leading-[22px] font-bold tracking-[-0.64px] text-[#1d2b44]">
          {message}
        </p>
      </div>
    </div>
  )
}

export default CompleteToast
